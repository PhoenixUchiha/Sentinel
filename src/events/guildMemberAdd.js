const { Events, EmbedBuilder } = require('discord.js');
const { db } = require('../utils/db');

const joinTracker = new Map(); // guildId -> timestamps

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(client, member) {
        const settings = await db.getSettings(member.guild.id);

        // 1. Anti-Raid Checks
        if (settings.panicMode) {
            await member.send('The server is currently under lockdown. Please try joining later.').catch(() => { });
            return member.kick('Raid Protection: Panic Mode enabled');
        }

        if (settings.antiRaidEnabled) {
            // Account Age Check
            const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
            if (accountAgeDays < settings.minAccountAgeDays) {
                await member.send(`Your account is too new to join this server. Minimum age: ${settings.minAccountAgeDays} days.`).catch(() => { });
                return member.kick(`Raid Protection: Account age (${accountAgeDays.toFixed(1)} days) < ${settings.minAccountAgeDays} days`);
            }

            // Join Flood Detection
            const now = Date.now();
            const guildJoins = joinTracker.get(member.guild.id) || [];
            const recentJoins = guildJoins.filter(t => now - t < settings.joinLimitTimeframe);
            recentJoins.push(now);
            joinTracker.set(member.guild.id, recentJoins);

            if (recentJoins.length > settings.joinLimitThreshold) {
                return member.kick('Raid Protection: Join flood detected');
            }
        }

        // Log to log channel
        if (settings.logChannelId) {
            const logChannel = member.guild.channels.cache.get(settings.logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Member Joined')
                    .setColor('Green')
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        { name: 'User', value: `${member.user} (${member.user.id})`, inline: true },
                        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => { });
            }
        }

        // Send welcome message if configured
        if (settings.welcomeChannelId) {
            const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannelId);
            if (welcomeChannel) {
                await welcomeChannel.send(`Welcome to the server, ${member}! We now have ${member.guild.memberCount} members.`).catch(() => { });
            }
        }

        // 2. Invite Tracking
        try {
            const currentInvites = await member.guild.invites.fetch();
            const invite = currentInvites.find(inv => (inv.uses || 0) > 0);

            if (invite && invite.inviter) {
                await db.updateInviteCount(member.guild.id, member.id, invite.code, invite.inviter.id);
            }
        } catch (error) {
            // Logger errors could be added here if needed
        }
    }
};
