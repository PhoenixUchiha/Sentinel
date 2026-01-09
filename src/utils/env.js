const dotenv = require('dotenv');
const { Logger } = require('./logger');

dotenv.config();

const requiredEnv = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'PREFIX',
    'MONGO_URI',
    'ERROR_WEBHOOK_URL'
];

function validateEnv() {
    const missing = requiredEnv.filter(key => !process.env[key]);

    if (missing.length > 0) {
        Logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    const validations = [
        {
            key: 'DISCORD_TOKEN',
            regex: /^[MNO][a-zA-Z0-9_-]{23,25}\.[a-zA-Z0-9_-]{5,7}\.[a-zA-Z0-9_-]{27,39}$/,
            message: 'Invalid DISCORD_TOKEN format.'
        },
        {
            key: 'CLIENT_ID',
            regex: /^\d{17,20}$/,
            message: 'Invalid CLIENT_ID format. Must be a numeric snowflake.'
        },
        {
            key: 'GUILD_ID',
            regex: /^\d{17,20}$/,
            message: 'Invalid GUILD_ID format. Must be a numeric snowflake.',
            optional: true
        }
    ];

    for (const { key, regex, message, optional } of validations) {
        const value = process.env[key];
        if (optional && !value) continue;
        if (value && !regex.test(value)) {
            Logger.error(message);
            process.exit(1);
        }
    }

    if (!process.env.MONGO_URI) {
        Logger.error('Missing MONGO_URI.');
        process.exit(1);
    }

    if (!process.env.GUILD_ID) {
        Logger.warn('GUILD_ID not provided. Slash commands will be registered globally (can take up to an hour).');
    }
}

const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    mongoUri: process.env.MONGO_URI,
    errorWebhookUrl: process.env.ERROR_WEBHOOK_URL,
    prefix: process.env.PREFIX || '!',
    ownerIds: (process.env.OWNER_IDS || '').split(',').filter(id => id),
    isProduction: process.env.NODE_ENV === 'production'
};

module.exports = { validateEnv, config };
