const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomfood')
    .setDescription('Gợi ý món ăn và nước uống ngẫu nhiên (món Việt)!'),
  async execute(interaction) {
    const foods = [
      "Phở", "Bún bò Huế", "Cơm tấm", "Bánh mì", "Bánh xèo",
      "Bánh cuốn", "Hủ tiếu", "Chả giò", "Bún thịt nướng", "Gỏi cuốn",
      "Bún riêu", "Mì Quảng", "Bún chả", "Lẩu mắm", "Cá kho tộ",
      "Xôi gà", "Cơm gà", "Cháo lòng", "Gà nướng", "Nem nướng"
    ];

    const drinks = [
      "Trà đá", "Sữa đậu nành", "Nước mía", "Cà phê sữa đá", "Cà phê đen",
      "Nước chanh", "Sinh tố bơ", "Sinh tố xoài", "Trà sữa", "Trà đào",
      "Sâm lạnh", "Rau má", "Trà tắc", "Nước dừa", "Sữa bắp",
      "Nước cam", "Chè đậu xanh", "Chè ba màu", "Soda chanh", "Bia Sài Gòn"
    ];

    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];

    await interaction.reply(`🥢 **Món ăn:** ${randomFood}\n🥤 **Nước uống:** ${randomDrink}`);
  }
};