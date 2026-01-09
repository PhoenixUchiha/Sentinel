const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Server administration and control')
        .addSubcommand(subcommand =>
            subcommand.setName('lockdown')
                .setDescription('Lock the entire server (prevents @everyone from sending messages)')
                .addStringOption(option => option.setName('reason').setDescription('Reason for lockdown').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('unlock')
                .setDescription('Unlock the server')
                .addStringOption(option => option.setName('reason').setDescription('Reason for unlocking').setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guild = interaction.guild;

        if (!guild) return;

        await interaction.deferReply();

        const action = subcommand === 'lockdown' ? 'lock' : 'unlock';
        const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        const failed = [];

        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: action === 'lock' ? false : null
                }, { reason: `Server ${action === 'lock' ? 'Lockdown' : 'Unlock'} by ${interaction.user.tag}: ${reason}` });
            } catch (error) {
                failed.push(channel.name);
            }
        }

        await db.updateSettings(guild.id, { panicMode: action === 'lock' });

        const embed = new EmbedBuilder()
            .setTitle(action === 'lock' ? 'Server Locked Down' : 'Server Lockdown Lifted')
            .setColor(action === 'lock' ? 'DarkRed' : 'Green')
            .setDescription(`The server has been ${action === 'lock' ? 'locked' : 'unlocked'}.`)
            .addFields(
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp();

        if (failed.length > 0) {
            embed.addFields({ name: 'Failed Channels', value: failed.join(', ').slice(0, 1024) });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
