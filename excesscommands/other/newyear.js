const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'newyear',
    description: '🎆 Countdown to the New Year!',
    execute(message) {
        let today = new Date();
        let newYear = new Date(today.getFullYear() + 1, 0, 1); // Jan 1

        let daysLeft = Math.ceil((newYear - today) / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle('🎆 New Year Countdown 🎉')
            .setDescription(`🎇 **${daysLeft} days left until New Year!**`)
            .setColor('#ffcc00')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
