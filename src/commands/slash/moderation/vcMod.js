const { ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { db } = require('../../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vc-mod')
        .setDescription('Voice channel moderation commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('Configure VC logging and auto-moderation')
                .addChannelOption(opt => opt.setName('channel').setDescription('Log channel for VC events').setRequired(true))
                .addBooleanOption(opt => opt.setName('automod').setDescription('Enable/Disable VC auto-moderation').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('kick')
                .setDescription('Kick a member from a voice channel')
                .addUserOption(opt => opt.setName('target').setDescription('The user to kick').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick'))
        )
        .addSubcommand(sub =>
            sub.setName('mute')
                .setDescription('Server mute a member')
                .addUserOption(opt => opt.setName('target').setDescription('The user to mute').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('unmute')
                .setDescription('Server unmute a member')
                .addUserOption(opt => opt.setName('target').setDescription('The user to unmute').setRequired(true))
        ),
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const sub = interaction.options.getSubcommand();

        if (sub === 'config') {
            const channel = interaction.options.getChannel('channel', true);
            const automod = interaction.options.getBoolean('automod', true);

            await db.updateSettings(guildId, {
                vcLogChannelId: channel.id,
                vcAutoMod: automod
            });

            return interaction.reply({
                content: `✅ VC Moderation configured: Logs -> <#${channel.id}>, AutoMod -> \`${automod}\``,
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('target', true);
        const member = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);

        if (!member || !member.voice.channel) {
            return interaction.reply({ content: '❌ Member is not in a voice channel.', ephemeral: true });
        }

        if (sub === 'kick') {
            const reason = interaction.options.getString('reason') || 'No reason provided';
            await member.voice.disconnect(reason);
            return interaction.reply({ content: `✅ Kicked **${targetUser.tag}** from voice.` });
        }

        if (sub === 'mute') {
            await member.voice.setMute(true);
            return interaction.reply({ content: `✅ Server muted **${targetUser.tag}**.` });
        }

        if (sub === 'unmute') {
            await member.voice.setMute(false);
            return interaction.reply({ content: `✅ Server unmuted **${targetUser.tag}**.` });
        }
    }
};
