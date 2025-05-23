const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    messageId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'pending' }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
