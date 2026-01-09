const { EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');
const { checkSoundboardSpam } = require('../utils/voiceMod');

module.exports = {
    name: 'raw',
    async execute(client, packet) {
        if (packet.t !== 'GUILD_SOUNDBOARD_SOUND_PLAY') return;

        const { guild_id, user_id, sound_name } = packet.d;

        const guild = client.guilds.cache.get(guild_id);
        if (!guild) return;

        const settings = await db.getSettings(guild_id);
        const member = await guild.members.fetch(user_id).catch(() => null);
        if (!member) return;

        // Logging
        if (settings.vcLogChannelId) {
            const logChannel = guild.channels.cache.get(settings.vcLogChannelId);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('📢 Soundboard Used')
                    .setColor('LuminousVividPink')
                    .setDescription(`**${member.user.tag}** used sound: \`${sound_name || 'Unknown'}\``)
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }

        // AutoMod
        if (settings.vcAutoMod) {
            const isSpamming = await checkSoundboardSpam(member);
            if (isSpamming) {
                await member.voice.setMute(true, 'Soundboard Spamming').catch(() => { });

                if (settings.vcLogChannelId) {
                    const logChannel = guild.channels.cache.get(settings.vcLogChannelId);
                    if (logChannel) {
                        await logChannel.send({
                            content: `⚠️ **${member.user.tag}** has been server-muted for soundboard spam.`
                        }).catch(() => { });
                    }
                }
            }
        }
    }
};
