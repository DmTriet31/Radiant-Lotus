// models/modmail/OpenModMail.js

const mongoose = require('mongoose');

const openModMailSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    threadChannelId: { type: String, required: true },
    openedAt: { type: Date, default: Date.now }
});

openModMailSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('OpenModMail', openModMailSchema);
