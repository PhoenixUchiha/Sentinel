const { GuildMember, Message } = require('discord.js');
const { config } = require('./env');

function hasPermission(member, permissions) {
    if (!permissions || permissions.length === 0) return true;
    if (!member) return false;

    return member.permissions.has(permissions);
}

function isOwner(userId) {
    return config.ownerIds.includes(userId);
}

function validateCommandAccess(interaction, command) {
    const userId = interaction instanceof Message ? interaction.author.id : interaction.user.id;
    const member = interaction.member;

    if (command.ownerOnly && !isOwner(userId)) {
        return { allowed: false, reason: 'This command is restricted to bot owners.' };
    }

    if (command.permissions && !hasPermission(member, command.permissions)) {
        return { allowed: false, reason: `You lack the required permissions: ${command.permissions.join(', ')}` };
    }

    return { allowed: true };
}

module.exports = { hasPermission, isOwner, validateCommandAccess };
