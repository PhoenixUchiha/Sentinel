const { EmbedBuilder } = require('discord.js');
const { Logger } = require('../utils/logger');
const { handleInteractionError } = require('./error');
const { db } = require('../utils/db');
const { checkCooldown } = require('../utils/cooldown');
const { validateCommandAccess } = require('../utils/permissions');

async function handleInteraction(interaction, client, collections) {
    if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction, client, collections);
    } else if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction, client, collections);
    } else if (interaction.isContextMenuCommand()) {
        await handleContextMenuCommand(interaction, client, collections);
    } else if (interaction.isButton()) {
        await handleButton(interaction, client, collections);
    } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(interaction, client, collections);
    } else if (interaction.isModalSubmit()) {
        await handleModal(interaction, client, collections);
    }
}

async function handleModal(interaction, client, collections) {
    if (interaction.customId.startsWith('vc_report_')) {
        const targetId = interaction.customId.replace('vc_report_', '');
        const reason = interaction.fields.getTextInputValue('report_reason');
        const guildId = interaction.guildId;
        const settings = await db.getSettings(guildId);

        const target = await client.users.fetch(targetId).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle('🎙️ Voice Activity Report')
            .setColor('Orange')
            .addFields(
                { name: 'Reporter', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Target', value: `${target?.tag || 'Unknown'} (${targetId})`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        if (settings.vcLogChannelId) {
            const channel = interaction.guild.channels.cache.get(settings.vcLogChannelId);
            if (channel) await channel.send({ embeds: [embed] }).catch(() => { });
        }

        await interaction.reply({ content: '✅ Report submitted to moderators.', ephemeral: true });
    }
}

async function handleSelectMenu(interaction, client, collections) {
    if (interaction.customId === 'help_menu') {
        const category = interaction.values[0];
        let commands = [];
        let title = '';

        switch (category) {
            case 'help_setups':
                title = '🛠️ Setups Commands';
                commands = ['config-logs', 'verify-setup'];
                break;
            case 'help_mod':
                title = '🛡️ Moderation Commands';
                commands = ['warn', 'warnings', 'clear-warnings', 'kick', 'ban', 'timeout', 'purge', 'slowmode', 'lock', 'unlock', 'vc-mod'];
                break;
            case 'help_voice':
                title = '🎙️ Voice Commands';
                commands = ['vc-mod kick', 'vc-mod mute', 'vc-mod unmute', 'Report Voice Activity (Context)'];
                break;
            case 'help_security':
                title = '🔒 Security Commands';
                commands = ['anti-raid'];
                break;
            case 'help_utility':
                title = '⚙️ Utility Commands';
                commands = ['ping', 'help'];
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor('#FF4B4B')
            .setDescription(commands.map(cmd => `\`/${cmd}\``).join(', ') || 'No commands found.')
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

async function handleButton(interaction, client, collections) {
    if (interaction.customId === 'verify_user') {
        if (!interaction.guildId) return;

        const settings = await db.getSettings(interaction.guildId);

        if (!settings.verifiedRoleId) {
            return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
        }

        const member = interaction.member;
        if (!member || !member.roles) {
            return interaction.reply({ content: 'Could not find your member profile.', ephemeral: true });
        }

        try {
            await member.roles.add(settings.verifiedRoleId);
            await interaction.reply({ content: '✅ You have been successfully verified!', ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: 'Failed to assign role. Please contact an administrator.', ephemeral: true });
        }
    } else if (interaction.customId.startsWith('role_')) {
        const roleId = interaction.customId.replace('role_', '');
        const member = interaction.member;

        if (!member || !member.roles) return;

        const hasRole = member.roles.cache.has(roleId);
        try {
            if (hasRole) {
                await member.roles.remove(roleId);
                await interaction.reply({ content: `✅ Successfully removed the role <@&${roleId}>.`, ephemeral: true });
            } else {
                await member.roles.add(roleId);
                await interaction.reply({ content: `✅ Successfully added the role <@&${roleId}>.`, ephemeral: true });
            }
        } catch (error) {
            Logger.error(`Failed to toggle role ${roleId} for ${interaction.user.tag}:`);
            Logger.error(error);
            await interaction.reply({ content: '❌ Failed to update your roles. I might be missing permissions or the role might be above mine.', ephemeral: true });
        }
    }
}

async function handleSlashCommand(interaction, client, collections) {
    const command = collections.slashCommands.get(interaction.commandName);
    if (!command) return;

    const start = Date.now();

    const access = validateCommandAccess(interaction, command);
    if (!access.allowed) {
        return interaction.reply({ content: access.reason, ephemeral: true });
    }

    if (command.cooldown) {
        const remaining = checkCooldown(collections.cooldowns, command.data.name, interaction.user.id, command.cooldown);
        if (remaining) {
            return interaction.reply({ content: `Please wait ${remaining.toFixed(1)} more seconds before using this command again.`, ephemeral: true });
        }
    }

    try {
        await command.execute(interaction, client, collections);
        Logger.logCommand(interaction.commandName, interaction.user.tag, interaction.guild?.name || 'DM', Date.now() - start, client.shard?.ids[0]);
    } catch (error) {
        await handleInteractionError(interaction, error);
    }
}

async function handleAutocomplete(interaction, client, collections) {
    const command = collections.slashCommands.get(interaction.commandName);
    if (!command || !command.autocomplete) return;

    try {
        await command.autocomplete(interaction, client, collections);
    } catch (error) {
        Logger.error(`Autocomplete error for command ${interaction.commandName}:`);
        Logger.error(error);
    }
}

async function handleContextMenuCommand(interaction, client, collections) {
    const command = collections.contextCommands.get(interaction.commandName);
    if (!command) return;

    const start = Date.now();

    const access = validateCommandAccess(interaction, command);
    if (!access.allowed) {
        return interaction.reply({ content: access.reason, ephemeral: true });
    }

    try {
        await command.execute(interaction, client, collections);
        Logger.logCommand(interaction.commandName, interaction.user.tag, interaction.guild?.name || 'DM', Date.now() - start, client.shard?.ids[0]);
    } catch (error) {
        await handleInteractionError(interaction, error);
    }
}

module.exports = { handleInteraction };
