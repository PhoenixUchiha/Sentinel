const fs = require('fs');
const path = require('path');
const { Logger } = require('../utils/logger');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => {
                const start = Date.now();
                event.execute(client, ...args);
                if (event.name !== 'raw') Logger.logEvent(event.name, Date.now() - start);
            });
        } else {
            client.on(event.name, (...args) => {
                const start = Date.now();
                event.execute(client, ...args);
                if (event.name !== 'raw') Logger.logEvent(event.name, Date.now() - start);
            });
        }
    }

    Logger.success(`Loaded ${eventFiles.length} events.`);
}

module.exports = { loadEvents };
