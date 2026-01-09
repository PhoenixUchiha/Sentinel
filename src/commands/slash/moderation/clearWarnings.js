const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-warnings')
        .setDescription('Clear all warnings for a member')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to clear warnings for').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const guildId = interaction.guildId;

        await db.clearWarnings(guildId, user.id);

        await interaction.reply({
            content: `Successfully cleared all warnings for ${user.tag}.`,
            ephemeral: false
        });
    }
};
