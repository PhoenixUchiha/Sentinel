const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View a member\'s warnings')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to view warnings for').setRequired(true)),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const guildId = interaction.guildId;

        const warnings = await db.getWarnings(guildId, user.id);

        if (warnings.length === 0) {
            return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${user.tag}`)
            .setColor('Orange')
            .setDescription(warnings.map((w, i) =>
                `**${i + 1}. ID: ${w.id}**\nReason: ${w.reason}\nBy: <@${w.moderatorId}>\nOn: <t:${Math.floor(w.timestamp / 1000)}:f>`
            ).join('\n\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
