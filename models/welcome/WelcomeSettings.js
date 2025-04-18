const mongoose = require('mongoose');

const welcomeSettingsSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    welcomeChannelId: { type: String },
    channelStatus: { type: Boolean, default: false },
    dmStatus: { type: Boolean, default: false },
    ownerId: { type: String, required: true }
});

module.exports = mongoose.model('WelcomeSettings', welcomeSettingsSchema);
