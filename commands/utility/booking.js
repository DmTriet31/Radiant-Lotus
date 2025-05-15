const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booking')
    .setDescription('Đăng ký tham gia sự kiện hoặc mong muốn chơi/talk/hát cùng ai đó')
    .addStringOption(option =>
      option.setName('sự_kiện')
        .setDescription('Chọn sự kiện')
        .setRequired(true)
        .addChoices(
          { name: 'Karaoke', value: 'karaoke' },
          { name: 'Talkshow', value: 'talkshow' },
          { name: 'Gamenight', value: 'gamenight' }
        ))
    .addStringOption(option =>
      option.setName('link_bài_hát')
        .setDescription('Link bài hát nếu chọn karaoke')
        .setRequired(false))
    .addUserOption(option =>
      option.setName('người_muốn_book')
        .setDescription('Người bạn muốn chơi/talk/hát cùng (tùy chọn)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('mục_đích')
        .setDescription('Mục đích hoặc ghi chú (tùy chọn)')
        .setRequired(false)),

  async execute(interaction) {
    const event = interaction.options.getString('sự_kiện');
    const songLink = interaction.options.getString('link_bài_hát');
    const targetUser = interaction.options.getUser('người_muốn_book');
    const purpose = interaction.options.getString('mục_đích') || 'Không có ghi chú';
    const user = interaction.user;

    // Đọc dữ liệu từ file hoặc tạo mới
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync('bookings.json', 'utf8'));
    } catch (e) {
      data = {};
    }
    if (!data[event]) data[event] = [];

    // Nếu là đăng ký đơn thuần (không tag người)
    if (!targetUser) {
      if (data[event].some(e => e.userId === user.id && !e.targetUserId)) {
        return interaction.reply({ content: `Bạn đã đăng ký sự kiện ${event} rồi.`, ephemeral: true });
      }
      if (event === 'karaoke' && !songLink) {
        return interaction.reply({ content: 'Vui lòng nhập link bài hát khi chọn karaoke.', ephemeral: true });
      }

      const booking = { userId: user.id };
      if (event === 'karaoke') booking.song = songLink;

      data[event].push(booking);
      fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
      return interaction.reply({ content: `Bạn đã đăng ký tham gia sự kiện ${event}.`, ephemeral: true });
    }

    // Nếu có tag người muốn book cùng (mong muốn chơi/talk/hát cùng)
    if (data[event].some(e => e.userId === user.id && e.targetUserId === targetUser.id)) {
      return interaction.reply({ content: `Bạn đã đăng ký mong muốn chơi/talk/hát cùng ${targetUser.username} rồi.`, ephemeral: true });
    }

    data[event].push({
      userId: user.id,
      targetUserId: targetUser.id,
      purpose,
      timestamp: Date.now(),
    });

    fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
    return interaction.reply({ content: `Đã ghi nhận mong muốn chơi/talk/hát cùng ${targetUser.username} trong sự kiện ${event}.`, ephemeral: true });
  }
};