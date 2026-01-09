const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');
const { config } = require('../utils/env');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else if (file.endsWith('.js')) {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

function loadCommands(collections) {
    // Load Slash Commands
    const slashPath = path.join(__dirname, '../commands/slash');
    if (fs.existsSync(slashPath)) {
        const slashFiles = getAllFiles(slashPath);
        for (const filePath of slashFiles) {
            const command = require(filePath);
            if (command?.data?.name) {
                collections.slashCommands.set(command.data.name, command);
            }
        }
    }

    // Load Prefix Commands
    const prefixPath = path.join(__dirname, '../commands/prefix');
    if (fs.existsSync(prefixPath)) {
        const prefixFiles = getAllFiles(prefixPath);
        for (const filePath of prefixFiles) {
            const command = require(filePath);
            if (command?.name) {
                collections.prefixCommands.set(command.name, command);
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        collections.prefixCommands.set(alias, command);
                    }
                }
            }
        }
    }

    // Load Context Commands
    const contextPath = path.join(__dirname, '../commands/context');
    if (fs.existsSync(contextPath)) {
        const contextFiles = getAllFiles(contextPath);
        for (const filePath of contextFiles) {
            const command = require(filePath);
            if (command?.data?.name) {
                collections.contextCommands.set(command.data.name, command);
            }
        }
    }

    Logger.success(`Loaded ${collections.slashCommands.size} slash, ${collections.prefixCommands.size} prefix (incl. aliases), ${collections.contextCommands.size} context commands.`);
}

async function registerSlashCommands() {
    const commands = [];

    const slashPath = path.join(__dirname, '../commands/slash');
    if (fs.existsSync(slashPath)) {
        const slashFiles = getAllFiles(slashPath);
        for (const filePath of slashFiles) {
            const command = require(filePath);
            if (command?.data) commands.push(command.data.toJSON());
        }
    }

    const contextPath = path.join(__dirname, '../commands/context');
    if (fs.existsSync(contextPath)) {
        const contextFiles = getAllFiles(contextPath);
        for (const filePath of contextFiles) {
            const command = require(filePath);
            if (command?.data) commands.push(command.data.toJSON());
        }
    }

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        if (config.guildId) {
            Logger.info(`Clearing commands for guild ${config.guildId} to prevent duplicates...`);
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: [] },
            );
        }

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );
        Logger.success('Successfully reloaded application (/) commands globally.');

        if (config.guildId) {
            Logger.info(`Note: GUILD_ID (${config.guildId}) is set but commands are now registered globally.`);
        }
    } catch (error) {
        Logger.error('Error registering slash commands:');
        Logger.error(error);
    }
}

module.exports = { loadCommands, registerSlashCommands };
