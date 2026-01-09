const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for banning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.options.getMember('user');

        if (member && !member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user. They might have a higher role than me.', ephemeral: true });
        }

        await interaction.guild?.members.ban(user, { reason });

        const embed = new EmbedBuilder()
            .setTitle('Member Banned')
            .setColor('DarkRed')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
