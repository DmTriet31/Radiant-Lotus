const { likeuserconfig } = require('../../mongodb');

// List of user IDs who can manage like limits (Add user IDs here)
const allowedUsers = ['1197447304110673963', '1004206704994566164']; // Replace with actual user IDs

module.exports = {
    name: 'managelike',
    description: 'Set a user’s like limit per 24 hours (Only for allowed users)',
    execute: async (message, args) => {
        // Check if the user is in the allowed list
        if (!allowedUsers.includes(message.author.id)) {
            return message.reply('❌ You are not authorized to use this command.');
        }

        if (args.length < 2) {
            return message.reply('❌ Usage: `!managelike <userId> <limit>`\nExample: `!managelike 123456789012345678 2`');
        }

        const [userId, limit] = args;
        const likeLimit = parseInt(limit);

        if (isNaN(likeLimit) || likeLimit < 2 || likeLimit > 50) {
            return message.reply('❌ Invalid limit. Please set a limit between 2 and 30.');
        }

        await likeuserconfig.updateOne(
            { userId },
            { $set: { limit: likeLimit } },
            { upsert: true }
        );

        return message.reply(`✅ User <@${userId}>'s like limit has been set to **${likeLimit}** per 24 hours.`);
    },
};
