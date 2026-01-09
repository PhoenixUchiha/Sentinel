const { WebhookClient, EmbedBuilder } = require('discord.js');
const { Logger } = require('../utils/logger');
const { config } = require('../utils/env');

const errorWebhook = new WebhookClient({ url: config.errorWebhookUrl });

async function sendErrorWebhook(error, context, details) {
    try {
        const embed = new EmbedBuilder()
            .setTitle('🚨 Internal Bot Error')
            .setColor('Red')
            .addFields(
                { name: 'Context', value: context, inline: true },
                { name: 'Error Message', value: `\`\`\`${error.message || error}\`\`\`` },
                { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        if (details) {
            embed.addFields({ name: 'Details', value: details });
        }

        if (error.stack) {
            const stack = error.stack.slice(0, 1000);
            embed.addFields({ name: 'Stack Trace', value: `\`\`\`${stack}\`\`\`` });
        }

        await errorWebhook.send({
            username: 'Sentinel Error Monitor',
            avatarURL: 'https://i.imgur.com/8nS8v36.png',
            embeds: [embed]
        });
    } catch (err) {
        Logger.error('Failed to send error webhook:');
        Logger.error(err);
    }
}

function setupProcessErrorHandler() {
    process.on('unhandledRejection', (reason) => {
        Logger.error('Unhandled Rejection:');
        Logger.error(reason);
        sendErrorWebhook(reason, 'Unhandled Rejection');
    });

    process.on('uncaughtException', (error) => {
        Logger.error('Uncaught Exception:');
        Logger.error(error);
        sendErrorWebhook(error, 'Uncaught Exception');
    });

    process.on('SIGINT', () => {
        Logger.info('SIGINT received. Shutting down...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        Logger.info('SIGTERM received. Shutting down...');
        process.exit(0);
    });
}

async function handleInteractionError(interaction, error) {
    Logger.error(`Error handling interaction ${interaction.id}:`);
    Logger.error(error);

    const detail = `Command: ${interaction.isChatInputCommand() ? interaction.commandName : 'Unknown'}\nUser: ${interaction.user.tag} (${interaction.user.id})`;
    sendErrorWebhook(error, 'Interaction Error', detail);

    if (interaction.isRepliable()) {
        const content = 'There was an error while executing this command!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content, ephemeral: true }).catch(() => { });
        } else {
            await interaction.reply({ content, ephemeral: true }).catch(() => { });
        }
    }
}

async function handleMessageError(message, error) {
    Logger.error(`Error handling message command ${message.id}:`);
    Logger.error(error);

    sendErrorWebhook(error, 'Message Error', `User: ${message.author.tag}\nContent: ${message.content}`);

    await message.reply('There was an error while executing this command!').catch(() => { });
}

module.exports = { setupProcessErrorHandler, handleInteractionError, handleMessageError };
