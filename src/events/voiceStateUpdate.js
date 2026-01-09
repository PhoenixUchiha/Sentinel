const { EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(client, oldState, newState) {
        const guildId = newState.guild.id;
        const settings = await db.getSettings(guildId);

        if (!settings.vcLogChannelId) return;

        const logChannel = newState.guild.channels.cache.get(settings.vcLogChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: newState.member?.user.tag || 'Unknown',
                iconURL: newState.member?.user.displayAvatarURL()
            })
            .setTimestamp();

        // Join
        if (!oldState.channelId && newState.channelId) {
            embed.setTitle('Voice Joined')
                .setColor('Green')
                .setDescription(`**${newState.member}** joined channel <#${newState.channelId}>`);
        }
        // Leave
        else if (oldState.channelId && !newState.channelId) {
            embed.setTitle('Voice Left')
                .setColor('Red')
                .setDescription(`**${newState.member}** left channel <#${oldState.channelId}>`);
        }
        // Move
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            embed.setTitle('Voice Moved')
                .setColor('Blue')
                .setDescription(`**${newState.member}** moved from <#${oldState.channelId}> to <#${newState.channelId}>`);
        }
        else {
            return;
        }

        await logChannel.send({ embeds: [embed] }).catch(() => { });
    }
};
