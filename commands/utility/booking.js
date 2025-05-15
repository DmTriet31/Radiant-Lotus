const fs = require('fs');

module.exports = {
  name: 'booking',
  async execute(message, args) {
    const event = args[0];
    if (!['karaoke', 'talkshow', 'gamenight'].includes(event)) {
      return message.reply('Vui lòng chọn sự kiện: `karaoke`, `talkshow` hoặc `gamenight`.');
    }

    const user = message.author;
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync('bookings.json', 'utf8'));
    } catch {
      data = {};
    }

    if (!data[event]) data[event] = [];

    const mentioned = message.mentions.users.first();
    const note = args.slice(2).join(' ') || 'Không có ghi chú';

    if (!mentioned) {
      // Booking đơn thuần
      if (data[event].some(e => e.userId === user.id && !e.targetUserId)) {
        return message.reply(`Bạn đã đăng ký sự kiện ${event} rồi.`);
      }

      if (event === 'karaoke' && !args[1]) {
        return message.reply('Vui lòng nhập link bài hát sau `karaoke <link>`.');
      }

      const booking = { userId: user.id };
      if (event === 'karaoke') booking.song = args[1];

      data[event].push(booking);
      fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
      return message.reply(`Bạn đã đăng ký tham gia sự kiện ${event}.`);
    } else {
      // Booking với người khác
      if (data[event].some(e => e.userId === user.id && e.targetUserId === mentioned.id)) {
        return message.reply(`Bạn đã mong muốn chơi với ${mentioned.username} rồi.`);
      }

      data[event].push({
        userId: user.id,
        targetUserId: mentioned.id,
        purpose: note,
        timestamp: Date.now(),
      });

      fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
      return message.reply(`Ghi nhận mong muốn chơi cùng ${mentioned.username} trong sự kiện ${event}.`);
    }
  }
};