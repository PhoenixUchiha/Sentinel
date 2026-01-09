const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.channel;

        await channel.permissionOverwrites.edit(interaction.guild?.roles.everyone, {
            SendMessages: true
        });

        await interaction.reply({
            content: `🔓 Channel has been unlocked.`
        });
    }
};
