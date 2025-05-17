const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomfood')
    .setDescription('Gợi ý món ăn và nước uống ngẫu nhiên theo vùng (Asian hoặc EU)')
    .addStringOption(option =>
      option
        .setName('region')
        .setDescription('Chọn khu vực món ăn')
        .setRequired(true)
        .addChoices(
          { name: 'Asian (Châu Á)', value: 'asian' },
          { name: 'European (Châu Âu)', value: 'eu' }
        )
    ),

  async execute(interaction) {
    const region = interaction.options.getString('region');

    const asianFoods = [
      "Phở", "Bún bò Huế", "Cơm tấm", "Bánh mì", "Bánh xèo",
      "Mì Quảng", "Gỏi cuốn", "Bún thịt nướng", "Hủ tiếu", "Xôi gà",
      "Sushi", "Ramen", "Cơm chiên Dương Châu", "Lẩu Thái", "Cơm gà Hải Nam",
      "Kimchi", "Gà cay Hàn Quốc", "Takoyaki", "Dimsum", "Lẩu bò"
    ];

    const asianDrinks = [
      "Trà đá", "Sữa đậu nành", "Nước mía", "Cà phê sữa đá", "Trà sữa",
      "Rau má", "Trà đào", "Sâm lạnh", "Sữa bắp", "Nước dừa",
      "Matcha latte", "Trà tắc", "Sinh tố bơ", "Sinh tố xoài", "Chè ba màu",
      "Trà olong", "Sữa chua uống", "Trà chanh", "Chè đậu xanh", "Soda chanh"
    ];

    const euFoods = [
      "Pizza", "Spaghetti", "Lasagna", "Paella", "Crepe",
      "Schnitzel", "Cá tuyết chiên", "Thịt hầm Pháp", "Carbonara", "Bánh mì baguette",
      "Goulash", "Xúc xích Đức", "Bánh mì kẹp thịt", "Risotto", "Quiche",
      "Bò bít tết", "Bruschetta", "Khoai tây nghiền", "Mì Ý pesto", "Salad Caesar"
    ];

    const euDrinks = [
      "Cà phê espresso", "Cappuccino", "Trà đen", "Sô-cô-la nóng", "Nước khoáng có gas",
      "Rượu vang đỏ", "Rượu vang trắng", "Bia Đức", "Cam ép", "Sữa nóng",
      "Latte", "Mocha", "Nước chanh Ý", "Sữa dâu", "Soda Ý",
      "Nước táo", "Trà bạc hà", "Trà hoa cúc", "Sinh tố dâu", "Cocktail nhẹ"
    ];

    let chosenFood;
    let chosenDrink;

    if (region === 'asian') {
      chosenFood = asianFoods[Math.floor(Math.random() * asianFoods.length)];
      chosenDrink = asianDrinks[Math.floor(Math.random() * asianDrinks.length)];
    } else {
      chosenFood = euFoods[Math.floor(Math.random() * euFoods.length)];
      chosenDrink = euDrinks[Math.floor(Math.random() * euDrinks.length)];
    }

    const embed = new EmbedBuilder()
      .setColor(region === 'asian' ? 0xffcc00 : 0x00aaff)
      .setTitle(`🍽️ Món ăn ngẫu nhiên từ vùng ${region === 'asian' ? 'Châu Á' : 'Châu Âu'}`)
      .addFields(
        { name: '🥢 Món ăn', value: chosenFood, inline: true },
        { name: '🥤 Nước uống', value: chosenDrink, inline: true }
      )
      .setFooter({ text: 'Chúc bạn ăn ngon miệng! 😋' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};