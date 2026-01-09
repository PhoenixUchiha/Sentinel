function checkCooldown(cooldowns, commandName, userId, cooldownAmount) {
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }

    const timestamps = cooldowns.get(commandName);
    const now = Date.now();
    const cooldownAmountMs = cooldownAmount * 1000;

    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmountMs;

        if (now < expirationTime) {
            return (expirationTime - now) / 1000;
        }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmountMs);

    return null;
}

module.exports = { checkCooldown };
