const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for the warning').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const guildId = interaction.guildId;

        const warning = {
            id: Math.random().toString(36).substring(2, 9),
            userId: user.id,
            reason: reason,
            moderatorId: interaction.user.id,
            timestamp: Date.now()
        };

        await db.addWarning(guildId, warning);

        const embed = new EmbedBuilder()
            .setTitle('Member Warned')
            .setColor('Yellow')
            .addFields(
                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            await user.send(`You have been warned in **${interaction.guild?.name}** for: ${reason}`);
        } catch (error) {
            // User likely has DMs off
        }
    }
};
