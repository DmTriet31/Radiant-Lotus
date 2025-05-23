// models/modmail/ModMailConfig.js

const mongoose = require('mongoose');

const modMailConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String, required: true },
    adminRoleId: { type: String, required: true },
    status: { type: Boolean, default: true },
    ownerId: { type: String, required: true }
});

module.exports = mongoose.model('ModMailConfig', modMailConfigSchema);
