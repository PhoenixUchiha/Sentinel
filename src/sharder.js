const { ShardingManager } = require('discord.js');
const path = require('path');
const { Logger } = require('./utils/logger');
const { config, validateEnv } = require('./utils/env');

// Validate environment before spawning shards
validateEnv();

const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
    token: config.token,
    totalShards: 'auto'
});

manager.on('shardCreate', (shard) => {
    Logger.info(`Launched shard ${shard.id}`);

    shard.on('ready', () => {
        Logger.success(`Shard ${shard.id} is ready`);
    });

    shard.on('disconnect', () => {
        Logger.warn(`Shard ${shard.id} disconnected`);
    });

    shard.on('reconnecting', () => {
        Logger.info(`Shard ${shard.id} is reconnecting`);
    });
});

manager.spawn().catch((error) => {
    Logger.error('Failed to spawn shards:');
    Logger.error(error);
});
