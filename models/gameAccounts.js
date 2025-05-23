// models/gameAccounts.js

const { gameAccountsCollection } = require('../mongodb');

async function createAccountDataIfNotExists(userId) {
    const existing = await gameAccountsCollection.findOne({ userId });
    if (!existing) {
        await gameAccountsCollection.insertOne({
            userId,
            steam: null,
            riot: null
        });
    }
}

async function setAccount(userId, platform, username) {
    await createAccountDataIfNotExists(userId);
    await gameAccountsCollection.updateOne({ userId }, { $set: { [platform]: username } });
}

async function getAccount(userId, platform) {
    const data = await gameAccountsCollection.findOne({ userId });
    return data?.[platform] || null;
}

async function removeAccount(userId, platform) {
    await gameAccountsCollection.updateOne({ userId }, { $unset: { [platform]: "" } });
}

module.exports = {
    setAccount,
    getAccount,
    removeAccount,
};
