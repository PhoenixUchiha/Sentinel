const { Events, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(client, member) {
        const settings = await db.getSettings(member.guild.id);

        if (settings.logChannelId) {
            const logChannel = member.guild.channels.cache.get(settings.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Member Left')
                    .setColor('Orange')
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        { name: 'User', value: `${member.user} (${member.user.id})`, inline: true },
                        { name: 'Joined At', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
            }
        }
    }
};
