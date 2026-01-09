const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Logger } = require('./logger');
const { config } = require('./env');

// --- Mongoose Schemas ---

const WarningSchema = new Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    moderatorId: { type: String, required: true },
    timestamp: { type: Number, default: Date.now }
});

const NoteSchema = new Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    moderatorId: { type: String, required: true },
    timestamp: { type: Number, default: Date.now }
});

const UserInviteSchema = new Schema({
    userId: { type: String, required: true },
    inviteCode: { type: String, required: true },
    uses: { type: Number, default: 0 },
    inviterId: { type: String, required: true }
});

const CaseSchema = new Schema({
    id: { type: Number, required: true },
    type: { type: String, enum: ['warn', 'mute', 'kick', 'ban', 'softban', 'massban'], required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Number, default: Date.now },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    evidence: { type: [String], default: [] }
});

const SettingsSchema = new Schema({
    logChannelId: String,
    welcomeChannelId: String,
    autoModEnabled: { type: Boolean, default: true },
    bannedWords: { type: [String], default: ['nazi', 'racist', 'scam'] },
    antiRaidEnabled: { type: Boolean, default: false },
    minAccountAgeDays: { type: Number, default: 0 },
    joinLimitThreshold: { type: Number, default: 10 },
    joinLimitTimeframe: { type: Number, default: 10000 },
    panicMode: { type: Boolean, default: false },
    verifiedRoleId: String,
    verificationChannelId: String,
    vcLogChannelId: String,
    vcAutoMod: { type: Boolean, default: false },
    antiInvite: { type: Boolean, default: false },
    antiLink: { type: Boolean, default: false },
    antiSpam: { type: Boolean, default: false },
    reactionRoles: { type: [{ messageId: String, emoji: String, roleId: String }], default: [] }
}, { _id: false });

const GuildSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    settings: { type: SettingsSchema, default: () => ({}) },
    warnings: [WarningSchema],
    notes: [NoteSchema],
    cases: [CaseSchema],
    invites: [UserInviteSchema]
});

const GuildModel = mongoose.model('Guild', GuildSchema);

// --- Database Manager ---

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        try {
            await mongoose.connect(config.mongoUri);
            Logger.success('Connected to MongoDB');
        } catch (error) {
            Logger.error('Failed to connect to MongoDB:');
            Logger.error(error);
            process.exit(1);
        }
    }

    async ensureGuild(guildId) {
        let guild = await GuildModel.findOne({ guildId });
        if (!guild) {
            guild = await GuildModel.create({ guildId });
        }
        return guild;
    }

    // Warnings
    async addWarning(guildId, warning) {
        await GuildModel.updateOne(
            { guildId },
            { $push: { warnings: warning } },
            { upsert: true }
        );
    }

    async getWarnings(guildId, userId) {
        const guild = await GuildModel.findOne({ guildId });
        if (!guild) return [];
        return guild.warnings.filter(w => w.userId === userId);
    }

    async getAllWarnings(guildId) {
        const guild = await GuildModel.findOne({ guildId });
        if (!guild) return [];
        return guild.warnings;
    }

    async clearWarnings(guildId, userId) {
        await GuildModel.updateOne(
            { guildId },
            { $pull: { warnings: { userId } } }
        );
    }

    // Notes
    async addNote(guildId, note) {
        await GuildModel.updateOne(
            { guildId },
            { $push: { notes: note } },
            { upsert: true }
        );
    }

    async getNotes(guildId, userId) {
        const guild = await GuildModel.findOne({ guildId });
        if (!guild) return [];
        return guild.notes.filter(n => n.userId === userId);
    }

    async removeNote(guildId, noteId) {
        await GuildModel.updateOne(
            { guildId },
            { $pull: { notes: { id: noteId } } }
        );
    }

    // Cases
    async createCase(guildId, caseData) {
        const guild = await this.ensureGuild(guildId);
        const nextId = (guild.cases.length > 0) ? Math.max(...guild.cases.map(c => c.id)) + 1 : 1;

        const newCase = { ...caseData, id: nextId };

        await GuildModel.updateOne(
            { guildId },
            { $push: { cases: newCase } }
        );

        return newCase;
    }

    async getCase(guildId, caseId) {
        const guild = await GuildModel.findOne({ guildId });
        if (!guild) return undefined;
        return guild.cases.find(c => c.id === caseId);
    }

    async updateCase(guildId, caseId, updates) {
        const updateObj = {};
        for (const [key, value] of Object.entries(updates)) {
            updateObj[`cases.$.${key}`] = value;
        }

        await GuildModel.updateOne(
            { guildId, 'cases.id': caseId },
            { $set: updateObj }
        );
    }

    // Settings
    async getSettings(guildId) {
        const guild = await this.ensureGuild(guildId);
        return guild.settings;
    }

    async updateSettings(guildId, settings) {
        const updateObj = {};
        for (const [key, value] of Object.entries(settings)) {
            updateObj[`settings.${key}`] = value;
        }

        await GuildModel.updateOne(
            { guildId },
            { $set: updateObj },
            { upsert: true }
        );
    }

    async getDbStats() {
        if (!mongoose.connection.db) return null;
        const stats = await mongoose.connection.db.command({ dbStats: 1 });
        return {
            collections: stats.collections,
            objects: stats.objects,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexSize: stats.indexSize,
            avgObjSize: stats.avgObjSize
        };
    }

    // Reaction Roles
    async addReactionRole(guildId, reactionRole) {
        await GuildModel.updateOne(
            { guildId },
            { $push: { 'settings.reactionRoles': reactionRole } }
        );
    }

    async getReactionRoles(guildId) {
        const guild = await GuildModel.findOne({ guildId });
        return guild?.settings?.reactionRoles || [];
    }

    // Invite Tracking
    async updateInviteCount(guildId, userId, inviteCode, inviterId) {
        await GuildModel.updateOne(
            { guildId, 'invites.userId': userId },
            {
                $set: {
                    'invites.$.inviteCode': inviteCode,
                    'invites.$.inviterId': inviterId
                },
                $inc: { 'invites.$.uses': 1 }
            },
            { upsert: false }
        );

        const result = await GuildModel.updateOne(
            { guildId, 'invites.userId': { $ne: userId } },
            {
                $push: {
                    invites: { userId, inviteCode, inviterId, uses: 1 }
                }
            }
        );
    }

    async getUserInvites(guildId, userId) {
        const guild = await GuildModel.findOne({ guildId });
        if (!guild) return [];
        return guild.invites;
    }
}

const db = new Database();

module.exports = { db };
