const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getEconomyProfile, updateBills, handleEviction, updateWallet } = require('../models/economy');
const { economyCollection } = require('../mongodb');

module.exports = (client) => {
    async function checkAndProcessBills() {
        const allProfiles = await economyCollection.find({}).toArray();

        for (const profile of allProfiles) {
            const userId = profile.userId;
            let user;
            try {
                user = await client.users.fetch(userId);
            } catch {
                continue;
            }

            const now = Date.now();
            const overdueRent = profile.bills.unpaidRent > 0 && now > profile.bills.rentDueDate;
            const overdueUtilities = profile.bills.unpaidUtilities > 0 && now > profile.bills.utilitiesDueDate;
            const totalOverdue = overdueRent ? profile.bills.unpaidRent : 0;

            if (overdueRent || overdueUtilities) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle('Overdue Bills Warning')
                        .setDescription(`You have overdue bills. Total Due: $${totalOverdue}. Please pay to avoid eviction.`)
                        .setColor('#FFA500');
                    await user.send({ embeds: [embed] });
                } catch {}

                if (now - profile.bills.rentDueDate > 7 * 24 * 60 * 60 * 1000) {
                    if (profile.wallet >= totalOverdue) {
                        await updateWallet(userId, -totalOverdue);
                        await updateBills(userId, { unpaidRent: 0, rentDueDate: now + 30 * 24 * 60 * 60 * 1000 });

                        const paymentEmbed = new EmbedBuilder()
                            .setTitle('Bills Paid Automatically')
                            .setDescription(`$${totalOverdue} has been deducted to cover your rent.`)
                            .setColor('#00FF00');
                        await user.send({ embeds: [paymentEmbed] });
                    } else {
                        await handleEviction(userId);
                        const evictionEmbed = new EmbedBuilder()
                            .setTitle('Eviction Notice')
                            .setDescription('You have been evicted due to unpaid bills.')
                            .setColor('#FF0000');
                        await user.send({ embeds: [evictionEmbed] });
                    }
                }
            }
        }
    }

    cron.schedule('4 0 * * *', () => {
        console.log('📆 Running daily bill check...');
        checkAndProcessBills();
    });
};
