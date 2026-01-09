const { Events, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');

module.exports = {
    name: Events.MessageDelete,
    async execute(client, message) {
        if (!message.guild || message.author?.bot) return;

        const settings = await db.getSettings(message.guild.id);
        if (!settings.logChannelId) return;

        const logChannel = message.guild.channels.cache.get(settings.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('Red')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .addFields(
                { name: 'Channel', value: `${message.channel}`, inline: true },
                { name: 'Sent By', value: `${message.author} (${message.author.id})`, inline: true },
                { name: 'Content', value: message.content || '*No content (possibly an image or embed)*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => { });
    }
};
