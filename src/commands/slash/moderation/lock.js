const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the current channel')
        .addStringOption(option =>
            option.setName('reason').setDescription('Reason for the lockdown').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await channel.permissionOverwrites.edit(interaction.guild?.roles.everyone, {
            SendMessages: false
        });

        await interaction.reply({
            content: `🔒 Channel has been locked.\n**Reason:** ${reason}`
        });
    }
};
