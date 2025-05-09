const mongoose = require('mongoose');

const verificationConfigSchema =  new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    verificationEnabled: { type: Boolean, default: false },
    unverifiedRoleId: { type: String, default: null },
    verifiedRoleId: { type: String, default: null },
    verificationChannelId: { type: String, default: null }
});

module.exports = mongoose.model('VerificationConfig', verificationConfigSchema);
