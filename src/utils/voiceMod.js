const { Collection } = require('discord.js');

const soundboardTracker = new Collection();

async function checkSoundboardSpam(member) {
    const now = Date.now();
    const userTrack = soundboardTracker.get(member.id) || { count: 0, lastUsed: 0 };

    if (now - userTrack.lastUsed < 10000) { // 10 second window
        userTrack.count++;
    } else {
        userTrack.count = 1;
    }

    userTrack.lastUsed = now;
    soundboardTracker.set(member.id, userTrack);

    if (userTrack.count > 5) { // More than 5 sounds in 10 seconds
        return true;
    }

    return false;
}

module.exports = { checkSoundboardSpam };
