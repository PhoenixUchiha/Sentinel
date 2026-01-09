const { Events, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');

module.exports = {
    name: Events.MessageUpdate,
    async execute(client, oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const settings = await db.getSettings(newMessage.guild.id);
        if (!settings.logChannelId) return;

        const logChannel = newMessage.guild.channels.cache.get(settings.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Edited')
            .setColor('Blue')
            .setAuthor({
                name: newMessage.author.tag,
                iconURL: newMessage.author.displayAvatarURL()
            })
            .addFields(
                { name: 'Channel', value: `${newMessage.channel}`, inline: true },
                { name: 'Sent By', value: `${newMessage.author} (${newMessage.author.id})`, inline: true },
                { name: 'Before', value: oldMessage.content || '*No content*' },
                { name: 'After', value: newMessage.content || '*No content*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => { });
    }
};
