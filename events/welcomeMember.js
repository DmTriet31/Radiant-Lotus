const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.GuildMemberAdd, async member => {
    const channel = member.guild.channels.cache.find(
      ch => ch.name === 'welcome' || ch.id === '1367506963696713891' // sửa lại nếu cần
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xff4757)
      .setTitle('<a:RL_rainbowchloe:1371961708704301207>Welcome To Radiant Lotus <a:RL_rainbowchloe:1371961708704301207>')
      .setDescription(
        `Chúc bạn có những khoảng khắc vui vẻ và gắn kết với mọi người khi tham gia server, đừng ngần ngại trò chuyện và kết bạn với các thành viên khác nhé.\n\n` +
        `Hãy thoải mái tham gia các cuộc trò chuyện, đóng góp ý tưởng và cùng nhau xây dựng 1 cộng đồng vui vẻ và đoàn kết. ` +
        `Hi vọng bạn có những khoảng khắc tuyệt vời tại server!`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Radiant Lotus • ${new Date().toLocaleTimeString()}`,
        iconURL: 'https://cdn.discordapp.com/attachments/1367522678420013146/1367522900445495446/standard_1.gif?ex=6814e472&is=681392f2&hm=5e8a8d444f74a6fea7bdda586a483f2e2a2278e3f55ed4a1c30c92366b0a7570&'
      });

    // Tạo nút Discord Invite
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Join Discord')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/ssh2hgpadH')
      );

    // Gửi tin nhắn và chèn nút
    const message = await channel.send({
      content: `🎉 Chào mừng <@${member.id}> đã đến với server, <@&1367120686405128306> có member mới nè`,
      embeds: [embed],
      components: [row]
    });

    // Thêm phản ứng emoji
    await message.react('<a:62802:1210522480901496863>');
  });
};
