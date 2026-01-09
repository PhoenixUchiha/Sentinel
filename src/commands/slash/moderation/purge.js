const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Clear a specific amount of messages')
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount', true);
        const channel = interaction.channel;

        try {
            const deleted = await channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Successfully deleted ${deleted.size} messages.`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: 'There was an error trying to purge messages in this channel! (Messages older than 14 days cannot be bulk deleted)', ephemeral: true });
        }
    }
};
