const { reportsCollection } = require('../mongodb');


async function addReport(userId, reporterId, reason) {
    const report = {
        reporterId,
        reason,
        timestamp: new Date(),
    };

    await reportsCollection.updateOne(
        { userId },
        { $push: { reports: report } },
        { upsert: true }
    );
}


async function getReports(userId) {
    return await reportsCollection.findOne({ userId });
}


async function clearReports(userId) {
    await reportsCollection.deleteOne({ userId });
}


async function removeReport(userId, index) {
    const userReports = await getReports(userId);
    
    if (!userReports || !userReports.reports || index < 0 || index >= userReports.reports.length) {
        throw new Error('Invalid report index or no reports found.');
    }

    userReports.reports.splice(index, 1); 

    if (userReports.reports.length === 0) {
        await clearReports(userId); 
    } else {
        await reportsCollection.updateOne(
            { userId },
            { $set: { reports: userReports.reports } }
        );
    }
}

module.exports = {
    addReport,
    getReports,
    clearReports,
    removeReport
};
