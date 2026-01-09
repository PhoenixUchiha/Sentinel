const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a member')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to unmute').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for unmuting').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.options.getMember('user');

        if (!member) {
            return interaction.reply({ content: 'User is not in the server.', ephemeral: true });
        }

        if (!member.communicationDisabledUntilTimestamp) {
            return interaction.reply({ content: 'This user is not timed out.', ephemeral: true });
        }

        await member.timeout(null, reason);

        const embed = new EmbedBuilder()
            .setTitle('Member Unmuted')
            .setColor('Green')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
