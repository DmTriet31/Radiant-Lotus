const mongoose = require('mongoose');

const leaveSettingsSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    leaveChannelId: { type: String },
    channelStatus: { type: Boolean, default: false },
    dmStatus: { type: Boolean, default: false },
    ownerId: { type: String, required: true }
});

module.exports = mongoose.model('LeaveSettings', leaveSettingsSchema);
