const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode for a channel')
        .addIntegerOption(option =>
            option.setName('seconds').setDescription('Slowmode duration in seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const seconds = interaction.options.getInteger('seconds', true);
        const channel = interaction.channel;

        await channel.setRateLimitPerUser(seconds);

        await interaction.reply({
            content: seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode has been set to ${seconds} seconds.`,
            ephemeral: true
        });
    }
};
