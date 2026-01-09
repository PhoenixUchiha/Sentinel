const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-logs')
        .setDescription('Configure the moderation log channel')
        .addChannelOption(option =>
            option.setName('channel').setDescription('The channel to send logs to').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel', true);
        const guildId = interaction.guildId;

        await db.updateSettings(guildId, { logChannelId: channel.id });

        await interaction.reply({
            content: `Log channel has been set to ${channel}.`,
            ephemeral: true
        });
    }
};
