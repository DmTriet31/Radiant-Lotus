const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ramadan',
    description: '🕌 Countdown to Ramadan!',
    execute(message) {
        let today = new Date();
        let ramadan = new Date(today.getFullYear(), 2, 1); // **Ramadan 2025 starts on February 28**
        
        if (today > ramadan) {
            ramadan.setFullYear(ramadan.getFullYear() + 1);
        }

        let daysLeft = Math.ceil((ramadan - today) / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle('🌙 Ramadan Countdown 🕌')
            .setDescription(`🕋 **${daysLeft} days left until Ramadan begins!**\n📅 **Next Ramadan starts:** February 28, ${ramadan.getFullYear()}`)
            .setColor('#0099ff')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
