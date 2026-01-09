const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member (mute them)')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for timeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const duration = interaction.options.getInteger('duration', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.options.getMember('user');

        if (!member) {
            return interaction.reply({ content: 'User is not in the server.', ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ content: 'I cannot timeout this user.', ephemeral: true });
        }

        await member.timeout(duration * 60 * 1000, reason);

        const embed = new EmbedBuilder()
            .setTitle('Member Timed Out')
            .setColor('Yellow')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Duration', value: `${duration} minutes`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
