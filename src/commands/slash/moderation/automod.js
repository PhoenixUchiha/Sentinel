const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure and manage AutoMod settings')
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('View current AutoMod status and rules'))
        .addSubcommand(sub =>
            sub.setName('toggle')
                .setDescription('Enable or disable the entire AutoMod system')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable AutoMod').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('anti-invite')
                .setDescription('Toggle Anti-Invite system')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable Anti-Invite').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('anti-link')
                .setDescription('Toggle Anti-Link system')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable Anti-Link').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('anti-spam')
                .setDescription('Toggle Anti-Spam system')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable Anti-Spam').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('Configure AutoMod rules')
                .addStringOption(opt =>
                    opt.setName('action')
                        .setDescription('Action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add Banned Word', value: 'add_word' },
                            { name: 'Remove Banned Word', value: 'remove_word' }
                        ))
                .addStringOption(opt => opt.setName('value').setDescription('The word or value').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'status') {
            const settings = await db.getSettings(guildId);
            const embed = new EmbedBuilder()
                .setTitle('🛡️ AutoMod Status')
                .setColor(settings.autoModEnabled ? 'Green' : 'Red')
                .addFields(
                    { name: 'System Enabled', value: settings.autoModEnabled ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Anti-Invite', value: settings.antiInvite ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Anti-Link', value: settings.antiLink ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Anti-Spam', value: settings.antiSpam ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Banned Words', value: settings.bannedWords.length > 0 ? settings.bannedWords.join(', ') : 'None', inline: false }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'toggle') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { autoModEnabled: enabled });
            return interaction.reply({ content: `AutoMod has been **${enabled ? 'enabled' : 'disabled'}**.` });
        }

        if (subcommand === 'anti-invite') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { antiInvite: enabled });
            return interaction.reply({ content: `Anti-Invite has been **${enabled ? 'enabled' : 'disabled'}**.` });
        }

        if (subcommand === 'anti-link') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { antiLink: enabled });
            return interaction.reply({ content: `Anti-Link has been **${enabled ? 'enabled' : 'disabled'}**.` });
        }

        if (subcommand === 'anti-spam') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { antiSpam: enabled });
            return interaction.reply({ content: `Anti-Spam has been **${enabled ? 'enabled' : 'disabled'}**.` });
        }

        if (subcommand === 'config') {
            const action = interaction.options.getString('action', true);
            const value = interaction.options.getString('value', true).toLowerCase();
            const settings = await db.getSettings(guildId);
            let updatedWords = [...settings.bannedWords];

            if (action === 'add_word') {
                if (updatedWords.includes(value)) {
                    return interaction.reply({ content: `\`${value}\` is already in the banned words list.`, ephemeral: true });
                }
                updatedWords.push(value);
                await db.updateSettings(guildId, { bannedWords: updatedWords });
                return interaction.reply({ content: `Added \`${value}\` to banned words.` });
            } else if (action === 'remove_word') {
                if (!updatedWords.includes(value)) {
                    return interaction.reply({ content: `\`${value}\` is not in the banned words list.`, ephemeral: true });
                }
                updatedWords = updatedWords.filter(w => w !== value);
                await db.updateSettings(guildId, { bannedWords: updatedWords });
                return interaction.reply({ content: `Removed \`${value}\` from banned words.` });
            }
        }
    }
};
