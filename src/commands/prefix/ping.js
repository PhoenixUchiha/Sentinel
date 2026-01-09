module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    aliases: ['p'],
    cooldown: 5,
    async execute(message, args, client) {
        await message.reply({
            content: `Pong! Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`
        });
    }
};
