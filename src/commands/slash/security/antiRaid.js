const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anti-raid')
        .setDescription('Configure anti-raid protection')
        .addSubcommand(sub =>
            sub.setName('status').setDescription('View current anti-raid status'))
        .addSubcommand(sub =>
            sub.setName('toggle').setDescription('Enable/disable anti-raid protection')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable the anti-raid system').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('lockdown').setDescription('Toggle server-wide lockdown (Panic Mode)')
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable panic mode').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('set-age').setDescription('Set minimum account age in days to join')
                .addIntegerOption(opt => opt.setName('days').setDescription('Minimum age in days').setRequired(true).setMinValue(0)))
        .addSubcommand(sub =>
            sub.setName('set-flood').setDescription('Set join flood detection thresholds')
                .addIntegerOption(opt => opt.setName('limit').setDescription('Number of joins').setRequired(true).setMinValue(2))
                .addIntegerOption(opt => opt.setName('seconds').setDescription('Within seconds').setRequired(true).setMinValue(1)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const settings = await db.getSettings(guildId);

        if (subcommand === 'status') {
            const embed = new EmbedBuilder()
                .setTitle('🛡️ Anti-Raid Configuration')
                .setColor(settings.antiRaidEnabled ? 'Green' : 'Red')
                .addFields(
                    { name: 'System Enabled', value: settings.antiRaidEnabled ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Panic Mode', value: settings.panicMode ? '🚨 ACTIVE' : '✅ Clear', inline: true },
                    { name: 'Min Account Age', value: `${settings.minAccountAgeDays} days`, inline: true },
                    { name: 'Flood Threshold', value: `${settings.joinLimitThreshold} joins / ${settings.joinLimitTimeframe / 1000}s`, inline: true }
                )
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'toggle') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { antiRaidEnabled: enabled });
            return interaction.reply({ content: `Anti-raid protection has been **${enabled ? 'enabled' : 'disabled'}**.` });
        }

        if (subcommand === 'lockdown') {
            const enabled = interaction.options.getBoolean('enabled', true);
            await db.updateSettings(guildId, { panicMode: enabled });

            return interaction.reply({
                content: enabled ? '🚨 **SERVER LOCKDOWN ENABLED.** No new members will be allowed to join.' : '✅ **Lockdown lifted.** Server is back to normal.'
            });
        }

        if (subcommand === 'set-age') {
            const days = interaction.options.getInteger('days', true);
            await db.updateSettings(guildId, { minAccountAgeDays: days });
            return interaction.reply({ content: `Minimum account age required to join set to **${days} days**.` });
        }

        if (subcommand === 'set-flood') {
            const limit = interaction.options.getInteger('limit', true);
            const seconds = interaction.options.getInteger('seconds', true);
            await db.updateSettings(guildId, { joinLimitThreshold: limit, joinLimitTimeframe: seconds * 1000 });
            return interaction.reply({ content: `Join flood detection set to **${limit} joins** per **${seconds} seconds**.` });
        }
    }
};
