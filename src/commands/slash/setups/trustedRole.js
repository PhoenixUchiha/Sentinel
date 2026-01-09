const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trusted-role')
        .setDescription('Configure the server trusted role')
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set the role that bypasses certain security checks')
                .addRoleOption(opt => opt.setName('role').setDescription('The trusted role').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the current trusted role'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'set') {
            const role = interaction.options.getRole('role', true);
            await db.updateSettings(guildId, { verifiedRoleId: role.id });

            return interaction.reply({ content: `Trusted role has been set to <@&${role.id}>.`, ephemeral: true });
        }

        if (subcommand === 'view') {
            const settings = await db.getSettings(guildId);
            const roleId = settings.verifiedRoleId;

            return interaction.reply({
                content: roleId ? `The current trusted role is <@&${roleId}>.` : 'No trusted role has been configured.',
                ephemeral: true
            });
        }
    }
};
