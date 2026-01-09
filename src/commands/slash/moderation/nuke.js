const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Clone the current channel and delete the old one to clear all messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.channel;

        if (!channel || !channel.isTextBased() || channel.isThread()) {
            return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
        }

        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'I do not have permission to manage channels.', ephemeral: true });
        }

        if (interaction.guild.rulesChannelId === channel.id || interaction.guild.publicUpdatesChannelId === channel.id) {
            return interaction.reply({ content: 'This channel is required for community servers and cannot be nuked.', ephemeral: true });
        }

        try {
            const position = channel.position;
            const newChannel = await channel.clone({
                name: channel.name,
                reason: `Nuke command by ${interaction.user.tag}`
            });

            await newChannel.setPosition(position);
            await channel.delete(`Nuke command by ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setTitle('Channel Nuked')
                .setDescription('This channel has been reset.')
                .setColor('Red')
                .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2I4YjVjNjVjOGM1YjVjOGM1YjVjOGM1YjVjOGM1YjVjOGM1YSZlcD12MV9pbnRlcm5hbF9naWZzX2dpZl9pZCZjdD1n/oe33H3BkmYdQY/giphy.gif')
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while nuking the channel.', ephemeral: true });
            }
        }
    }
};
