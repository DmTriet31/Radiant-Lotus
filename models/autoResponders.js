const { autoResponderCollection } = require('../mongodb');

async function createOrUpdateAutoResponder(userId, guildId, trigger, textResponse, embedData, matchType, channels, status) {
    console.log(`[DEBUG] Saving AutoResponder: ${trigger} for Guild: ${guildId}`);

    const result = await autoResponderCollection.updateOne(
        { guildId, trigger }, 
        { 
            $set: { 
                guildId, 
                userId, 
                trigger, 
                textResponse, 
                embedData, 
                matchType, 
                channels, 
                status 
            } 
        },
        { upsert: true }
    );
}


async function deleteAutoResponder(userId, index) {
    const userResponders = await autoResponderCollection.find({ userId }).toArray();
    if (!userResponders[index]) return false;
    await autoResponderCollection.deleteOne({ _id: userResponders[index]._id });
    return true;
}

async function getUserAutoResponders(userId) {
    return await autoResponderCollection.find({ userId }).toArray();
}

module.exports = { createOrUpdateAutoResponder, deleteAutoResponder, getUserAutoResponders };
