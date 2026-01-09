const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('massban')
        .setDescription('Ban multiple users by their IDs')
        .addStringOption(option =>
            option.setName('ids').setDescription('IDs of users to ban, separated by spaces or commas').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for mass banning').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const idString = interaction.options.getString('ids', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const ids = idString.split(/[\s,]+/).filter(id => /^\d{17,19}$/.test(id));

        if (ids.length === 0) {
            return interaction.reply({ content: 'No valid user IDs provided.', ephemeral: true });
        }

        if (ids.length > 20) {
            return interaction.reply({ content: 'You can only mass ban up to 20 users at a time to prevent rate limits.', ephemeral: true });
        }

        await interaction.deferReply();

        const success = [];
        const failed = [];

        for (const id of ids) {
            try {
                await interaction.guild?.members.ban(id, { reason: `Massban: ${reason}` });
                success.push(id);
            } catch (error) {
                failed.push(id);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Mass Ban Result')
            .setColor(failed.length === 0 ? 'Green' : 'Orange')
            .addFields(
                { name: 'Successfully Banned', value: success.length > 0 ? success.join(', ') : 'None' },
                { name: 'Failed to Ban', value: failed.length > 0 ? failed.join(', ') : 'None' },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
