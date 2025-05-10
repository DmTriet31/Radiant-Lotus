const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lotushop')
        .setDescription('Gửi tin nhắn shop cố định vào kênh'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Radiant Lotus Shop')
            .setURL('https://www.instagram.com/radiant.lotus12?igsh=MXg3cW02dGEwMWhkdw==')
            .setDescription(`**Chào mừng đến với Radiant Lotus Shop!**

Chúng tôi cung cấp dịch vụ:
• Spotify Premium  
• Netflix Premium  
• Thẻ Garena  

Hãy chọn sản phẩm từ menu bên dưới để xem chi tiết và giá.

**Thanh toán hỗ trợ:**  
PayPal, Swish, Thẻ cào  

Nếu cần hỗ trợ, vui lòng mở ticket tại <#1367671205926146122>`)
            .setColor(0xf1c40f)
            .setFooter({ text: 'Liên hệ Admin để thanh toán hoặc hỏi thêm.' });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('shop_select') // Đảm bảo customId trùng với điều kiện trong interaction
            .setPlaceholder('Chọn sản phẩm bạn muốn')
            .addOptions([
                {
                    label: 'Spotify Premium',
                    value: 'spotify',
                    description: 'Xem giá và gói Spotify Premium',
                    emoji: '🎵',
                },
                {
                    label: 'Netflix Premium',
                    value: 'netflix',
                    description: 'Xem giá và gói Netflix Premium',
                    emoji: '📺',
                },
                {
                    label: 'Thẻ Garena',
                    value: 'garena',
                    description: 'Xem mệnh giá thẻ Garena',
                    emoji: '💳',
                },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: 'Shop đã được gửi vào kênh này.',
            ephemeral: true
        });

        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
