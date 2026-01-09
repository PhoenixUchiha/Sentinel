const { PermissionFlagsBits } = require('discord.js');
const { db } = require('./db');
const { Logger } = require('./logger');

const spamMap = new Map();
const SPAM_THRESHOLD = 5; // messages
const SPAM_INTERVAL = 5000; // ms (5 seconds)

async function checkAutoMod(message) {
    if (message.author.bot || !message.guild || message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return false;
    }

    const settings = await db.getSettings(message.guild.id);
    if (!settings.autoModEnabled) return false;

    // 1. Anti-Spam
    if (settings.antiSpam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMessage: now };

        if (now - userData.lastMessage < SPAM_INTERVAL) {
            userData.count++;
        } else {
            userData.count = 1;
            userData.lastMessage = now;
        }
        spamMap.set(userId, userData);

        if (userData.count > SPAM_THRESHOLD) {
            await handleViolation(message, 'Spamming');
            return true;
        }
    }

    // 2. Word Filter
    const content = message.content.toLowerCase();
    const hasBannedWord = settings.bannedWords.some(word => content.includes(word));
    if (hasBannedWord) {
        await handleViolation(message, 'Banned word usage');
        return true;
    }

    // 3. Invite Blocker
    if (settings.antiInvite) {
        const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+/i;
        if (inviteRegex.test(message.content)) {
            await handleViolation(message, 'Discord invite link');
            return true;
        }
    }

    // 4. Link Blocker
    if (settings.antiLink) {
        const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
        if (linkRegex.test(message.content)) {
            await handleViolation(message, 'Unauthorized link');
            return true;
        }
    }

    return false;
}

async function handleViolation(message, reason) {
    try {
        if (message.deletable) {
            await message.delete();
            const warnMsg = await message.channel.send(`${message.author}, your message was removed for: **${reason}**.`);
            setTimeout(() => warnMsg.delete().catch(() => { }), 5000);

            Logger.info(`AutoMod: Removed message from ${message.author.tag} in ${message.guild?.name} for ${reason}.`);
        }
    } catch (error) {
        Logger.error('AutoMod failed to delete message:');
        Logger.error(error);
    }
}

module.exports = { checkAutoMod };
