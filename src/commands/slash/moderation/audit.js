const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audit')
        .setDescription('View the full moderation history of a user')
        .addSubcommand(subcommand =>
            subcommand.setName('user')
                .setDescription('Audit a user')
                .addUserOption(option => option.setName('user').setDescription('The user to audit').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user', true);
        const guildId = interaction.guildId;

        const warnings = await db.getWarnings(guildId, user.id);
        const notes = await db.getNotes(guildId, user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Audit Log: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor('Greyple')
            .addFields(
                { name: 'User ID', value: `\`${user.id}\``, inline: true },
                { name: 'Warnings', value: warnings.length.toString(), inline: true },
                { name: 'Staff Notes', value: notes.length.toString(), inline: true }
            )
            .setTimestamp();

        if (warnings.length > 0) {
            const warningList = warnings.slice(-5).map(w =>
                `• **${w.reason}** (By <@${w.moderatorId}> <t:${Math.floor(w.timestamp / 1000)}:R>)`
            ).join('\n');
            embed.addFields({ name: 'Recent Warnings (Last 5)', value: warningList });
        } else {
            embed.addFields({ name: 'Recent Warnings', value: 'None' });
        }

        if (notes.length > 0) {
            const noteList = notes.slice(-5).map(n =>
                `• **${n.content}** (By <@${n.moderatorId}> <t:${Math.floor(n.timestamp / 1000)}:R>)`
            ).join('\n');
            embed.addFields({ name: 'Recent Staff Notes (Last 5)', value: noteList });
        } else {
            embed.addFields({ name: 'Recent Staff Notes', value: 'None' });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
