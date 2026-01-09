const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { config, validateEnv } = require('./utils/env');
const { Logger } = require('./utils/logger');
const { loadEvents } = require('./handlers/event');
const { loadCommands, registerSlashCommands } = require('./handlers/command');
const { handleInteraction } = require('./handlers/interaction');
const { handleMessage } = require('./handlers/message');
const { setupProcessErrorHandler } = require('./handlers/error');

// 1. Validate Environment
validateEnv();

// 2. Setup Process Error Handling
setupProcessErrorHandler();

// 3. Initialize Shared Collections
const collections = {
    slashCommands: new Map(),
    prefixCommands: new Map(),
    contextCommands: new Map(),
    cooldowns: new Map()
};

// 4. Create Client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// 5. Load Handlers
Logger.banner();
loadEvents(client);
loadCommands(collections);

// 6. Interaction Router
client.on('interactionCreate', (interaction) => {
    handleInteraction(interaction, client, collections);
});

// 7. Message Command Router
client.on('messageCreate', async (message) => {
    await handleMessage(message, client, collections);
});

// 8. Startup
(async () => {
    try {
        await registerSlashCommands();
        await client.login(config.token);
        Logger.success(`Client logged in as ${client.user?.tag}`, client.shard?.ids[0]);
    } catch (error) {
        Logger.error('Failed to start the bot:', client.shard?.ids[0]);
        Logger.error(error, client.shard?.ids[0]);
        process.exit(1);
    }
})();

// 9. Graceful Shutdown
function shutdown() {
    Logger.info('Graceful shutdown initiated...', client.shard?.ids[0]);
    client.destroy();
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
