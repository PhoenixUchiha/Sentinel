const { Message } = require('discord.js');
const { Logger } = require('../utils/logger');
const { config } = require('../utils/env');
const { checkAutoMod } = require('../utils/automod');
const { validateCommandAccess } = require('../utils/permissions');
const { checkCooldown } = require('../utils/cooldown');
const { handleMessageError } = require('./error');

async function handleMessage(message, client, collections) {
    if (message.author.bot || !message.guild) return;

    // Run AutoMod
    const violated = await checkAutoMod(message);
    if (violated) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = collections.prefixCommands.get(commandName);
    if (!command) return;

    const start = Date.now();

    // Permission check
    const access = validateCommandAccess(message, command);
    if (!access.allowed) {
        return message.reply(access.reason || 'You do not have permission to use this command.').catch(() => { });
    }

    // Cooldown check
    if (command.cooldown) {
        const remaining = checkCooldown(collections.cooldowns, command.name, message.author.id, command.cooldown);
        if (remaining) {
            return message.reply(`Please wait ${remaining.toFixed(1)} more seconds before using this command again.`).catch(() => { });
        }
    }

    try {
        await command.execute(message, args, client, collections);
        Logger.logCommand(`[PREFIX] ${command.name}`, message.author.tag, message.guild?.name || 'DM', Date.now() - start, client.shard?.ids[0]);
    } catch (error) {
        await handleMessageError(message, error);
    }
}

module.exports = { handleMessage };
