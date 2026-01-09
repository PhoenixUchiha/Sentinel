const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('Configure or view moderation log settings')
        .addSubcommand(subcommand =>
            subcommand.setName('set')
                .setDescription('Set the channel for moderation logs')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send logs to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View current moderation log settings'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'set') {
            const channel = interaction.options.getChannel('channel', true);
            await db.updateSettings(guildId, { logChannelId: channel.id });

            const embed = new EmbedBuilder()
                .setTitle('ModLog Configured')
                .setDescription(`Moderation logs will now be sent to ${channel}.`)
                .setColor('Green')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'view') {
            const settings = await db.getSettings(guildId);
            const channel = settings.logChannelId ? `<#${settings.logChannelId}>` : 'Not set';

            const embed = new EmbedBuilder()
                .setTitle('ModLog Settings')
                .addFields({ name: 'Log Channel', value: channel })
                .setColor('Blue')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
