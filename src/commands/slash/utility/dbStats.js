const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('db-stats')
        .setDescription('View database storage statistics'),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const stats = await db.getDbStats();
        if (!stats) {
            return interaction.editReply('Could not fetch database statistics.');
        }

        const formatBytes = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const embed = new EmbedBuilder()
            .setTitle('📊 Database Statistics')
            .setColor('Blue')
            .addFields(
                { name: 'Collections', value: stats.collections.toString(), inline: true },
                { name: 'Total Objects', value: stats.objects.toString(), inline: true },
                { name: 'Data Size', value: formatBytes(stats.dataSize), inline: true },
                { name: 'Storage Size', value: formatBytes(stats.storageSize), inline: true },
                { name: 'Index Size', value: formatBytes(stats.indexSize), inline: true },
                { name: 'Avg Object Size', value: formatBytes(stats.avgObjSize), inline: true }
            )
            .setFooter({ text: 'MongoDB Storage Metrics' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
