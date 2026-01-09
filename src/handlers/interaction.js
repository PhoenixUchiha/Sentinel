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

        if (category === 'help_home') {
            const totalCommands = collections.slashCommands.size + collections.contextCommands.size + new Set(collections.prefixCommands.values()).size;
            const homeEmbed = new EmbedBuilder()
                .setTitle(`🛡️ ${client.user?.username || 'Sentinel'} Information Dashboard`)
                .setColor('#FF4B4B')
                .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }) || null)
                .setDescription(
                    `Welcome to the **Sentinel** help menu. Use the selection menu below to navigate through different module categories and explore my capabilities.\n\n` +
                    `**System Overview**\n` +
                    `> 📊 **Total Commands:** \`${totalCommands}\` commands loaded\n` +
                    `> 🌐 **Network:** Monitoring \`${client.guilds.cache.size}\` servers\n` +
                    `> 👥 **Users:** Serving \`${client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0).toLocaleString()}\` members\n` +
                    `> 📡 **Status:** Shard ID \`#${client.shard?.ids[0] ?? 0}\` Operational`
                )
                .setImage("https://media.discordapp.net/attachments/982652732911542402/1459243271820939317/standard.gif?ex=696291b3&is=69614033&hm=f468b68cfb970a5b1921e338a790668c8c0d130c0b4255189b2b14554a1414c9&=&width=1360&height=480")
                .setFooter({
                    text: `${client.user?.username} Security Engine • Advanced Protection`,
                    iconURL: client.user?.displayAvatarURL()
                });

            return await interaction.update({ embeds: [homeEmbed] });
        }

        let commands = [];
        let title = '';
        let description = '';

        switch (category) {
            case 'help_setups':
                title = '🛠️ Server Setup Modules';
                description = 'Essential configuration tools for guild management and initial setup.';
                commands = ['config-logs', 'verify-setup', 'modlog', 'trusted-role'];
                break;
            case 'help_mod':
                title = '🛡️ Content Moderation';
                description = 'Powerful tools to maintain order and discipline within your community.';
                commands = ['warn', 'warnings', 'clear-warnings', 'kick', 'ban', 'softban', 'massban', 'timeout', 'unmute', 'purge', 'slowmode', 'lock', 'unlock', 'nuke', 'case', 'note'];
                break;
            case 'help_security':
                title = '🔒 Advanced Security & Voice';
                description = 'Enterprise-grade protection against raids, soundboard spam, and risky accounts.';
                commands = ['anti-raid', 'alt-check', 'quarantine', 'vc-mod', 'automod'];
                break;
            case 'help_utility':
                title = '⚙️ Utility & Operations';
                description = 'General purpose tools for system status and administrative tasks.';
                commands = ['ping', 'help', 'db-stats', 'invites', 'role-menu', 'user-info'];
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor('#FF4B4B')
            .setDescription(`> ${description}\n\n**Available Commands**\n${commands.map(cmd => `\`/${cmd}\``).join('  ') || 'No commands listed.'}`)
            .setThumbnail(client.user?.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Sentinel Intelligence System • Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.update({ embeds: [embed] });
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
