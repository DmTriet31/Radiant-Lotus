const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'holi',
    description: '🎨 Countdown to Holi!',
    execute(message) {
        let today = new Date();
        let holi = new Date(today.getFullYear(), 2, 14); // **Holi 2025: March 14**
        
        if (today > holi) {
            holi.setFullYear(holi.getFullYear() + 1);
        }

        let daysLeft = Math.ceil((holi - today) / (1000 * 60 * 60 * 24));

        const embed = new EmbedBuilder()
            .setTitle('🎨 Holi Countdown 🌈')
            .setDescription(`🌸 **${daysLeft} days left until Holi!**\n📅 **Next Holi:** March 14, ${holi.getFullYear()}`)
            .setColor('#ff33cc')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
