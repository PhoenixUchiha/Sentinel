const { Events } = require('discord.js');
const { Logger } = require('../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Logger.success(`Logged in as ${client.user?.tag}!`);
        Logger.info(`Ready to serve in ${client.guilds.cache.size} guilds.`);
    }
};
