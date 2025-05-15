const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('booking-list')
    .setDescription('Xem danh sách đăng ký booking sự kiện')
    .addStringOption(option =>
      option.setName('sự_kiện')
        .setDescription('Chọn sự kiện cần xem')
        .setRequired(true)
        .addChoices(
          { name: 'Karaoke', value: 'karaoke' },
          { name: 'Talkshow', value: 'talkshow' },
          { name: 'Gamenight', value: 'gamenight' }
        )),
  
  async execute(interaction) {
    const event = interaction.options.getString('sự_kiện');
    const data = JSON.parse(fs.readFileSync('bookings.json', 'utf8') || '{}');
    const bookings = data[event] || [];

    if (bookings.length === 0) {
      return interaction.reply({ content: `Hiện chưa có ai đăng ký sự kiện ${event}.`, ephemeral: true });
    }

    // Phân loại booking: đơn thuần và có tag người muốn book cùng
    const soloBookings = bookings.filter(b => !b.targetUserId);
    const pairedBookings = bookings.filter(b => b.targetUserId);

    // Tạo nội dung reply
    let reply = `**Danh sách đăng ký sự kiện ${event}:**\n\n`;

    if (soloBookings.length) {
      reply += '**Tham gia đơn thuần:**\n';
      for (const b of soloBookings) {
        const user = await interaction.client.users.fetch(b.userId).catch(() => ({ username: 'Unknown' }));
        reply += `- ${user.username}`;
        if (event === 'karaoke' && b.song) {
          reply += ` | Bài hát: ${b.song}`;
        }
        reply += '\n';
      }
      reply += '\n';
    } else {
      reply += '_Chưa có ai đăng ký tham gia đơn thuần._\n\n';
    }

    if (pairedBookings.length) {
      reply += '**Mong muốn chơi/talk/hát cùng:**\n';
      for (const b of pairedBookings) {
        const user = await interaction.client.users.fetch(b.userId).catch(() => ({ username: 'Unknown' }));
        const targetUser = await interaction.client.users.fetch(b.targetUserId).catch(() => ({ username: 'Unknown' }));
        reply += `- ${user.username} muốn cùng ${targetUser.username} (${b.purpose || 'Không có ghi chú'})\n`;
      }
    } else {
      reply += '_Chưa có ai đặt mong muốn chơi cùng người khác._\n';
    }

    return interaction.reply({ content: reply, ephemeral: false });
  }
};