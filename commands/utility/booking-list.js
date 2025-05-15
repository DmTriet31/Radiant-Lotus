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
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync('bookings.json', 'utf8'));
    } catch (e) {
      data = {};
    }

    const bookings = data[event] || [];

    if (bookings.length === 0) {
      return interaction.reply(`Hiện chưa có ai đăng ký sự kiện **${event}**.`);
    }

    const solo = bookings.filter(b => !b.targetUserId);
    const paired = bookings.filter(b => b.targetUserId);

    let reply = `**Danh sách sự kiện ${event}:**\n\n`;

    if (solo.length) {
      reply += '**Tham gia đơn thuần:**\n';
      for (const b of solo) {
        const user = await interaction.client.users.fetch(b.userId).catch(() => ({ username: 'Không rõ' }));
        reply += `- ${user.username}`;
        if (event === 'karaoke' && b.song) reply += ` | Bài hát: ${b.song}`;
        reply += `\n`;
      }
      reply += '\n';
    } else {
      reply += '_Không có ai tham gia đơn thuần._\n\n';
    }

    if (paired.length) {
      reply += '**Mong muốn chơi cùng:**\n';
      for (const b of paired) {
        const user = await interaction.client.users.fetch(b.userId).catch(() => ({ username: 'Không rõ' }));
        const target = await interaction.client.users.fetch(b.targetUserId).catch(() => ({ username: 'Không rõ' }));
        reply += `- ${user.username} → ${target.username} (${b.purpose})\n`;
      }
    } else {
      reply += '_Không có ai mong muốn chơi cùng._';
    }

    return interaction.reply(reply);
  }
};