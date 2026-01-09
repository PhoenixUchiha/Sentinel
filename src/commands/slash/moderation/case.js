const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('Manage moderation cases')
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View a case by ID')
                .addIntegerOption(option => option.setName('id').setDescription('The Case ID').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit a case reason')
                .addIntegerOption(option => option.setName('id').setDescription('The Case ID').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('The new reason').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('close')
                .setDescription('Close a case')
                .addIntegerOption(option => option.setName('id').setDescription('The Case ID').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const caseId = interaction.options.getInteger('id', true);

        const modCase = await db.getCase(guildId, caseId);

        if (!modCase) {
            return interaction.reply({ content: `Case #${caseId} not found.`, ephemeral: true });
        }

        if (subcommand === 'view') {
            const embed = new EmbedBuilder()
                .setTitle(`Case #${modCase.id} - ${modCase.type.toUpperCase()}`)
                .setColor(modCase.status === 'open' ? 'Orange' : 'Grey')
                .addFields(
                    { name: 'User', value: `<@${modCase.userId}> (\`${modCase.userId}\`)`, inline: true },
                    { name: 'Moderator', value: `<@${modCase.moderatorId}>`, inline: true },
                    { name: 'Status', value: modCase.status.toUpperCase(), inline: true },
                    { name: 'Reason', value: modCase.reason },
                    { name: 'Timestamp', value: `<t:${Math.floor(modCase.timestamp / 1000)}:f>` }
                )
                .setTimestamp();

            if (modCase.evidence && modCase.evidence.length > 0) {
                embed.addFields({ name: 'Evidence', value: modCase.evidence.join('\n') });
            }

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'edit') {
            const newReason = interaction.options.getString('reason', true);
            await db.updateCase(guildId, caseId, { reason: newReason });

            await interaction.reply({ content: `Case #${caseId} reason updated.`, ephemeral: true });
        } else if (subcommand === 'close') {
            await db.updateCase(guildId, caseId, { status: 'closed' });

            await interaction.reply({ content: `Case #${caseId} marked as closed.`, ephemeral: true });
        }
    }
};
