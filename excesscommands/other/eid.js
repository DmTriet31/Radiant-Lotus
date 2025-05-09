const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'eid',
    description: '🕌 Countdown to Eid-al-Fitr!',
    execute(message) {
        let today = new Date();
        let eid = new Date(today.getFullYear(), 3, 21); // April 21

        if (today > eid) {
            eid.setFullYear(eid.getFullYear() + 1);
        }

        let daysLeft = Math.ceil((eid - today) / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle('🕌 Eid Countdown 🌙')
            .setDescription(`✨ **${daysLeft} days left until Eid-al-Fitr!**`)
            .setColor('#00cc99')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
