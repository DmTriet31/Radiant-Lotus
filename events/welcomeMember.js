const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.GuildMemberAdd, async member => {
    const channel = member.guild.channels.cache.find(
      ch => ch.name === 'welcome' || ch.id === '1367506963696713891'
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xff4757)
      .setTitle(':RL_rainbowchloe: Welcome To Radiant Lotus :RL_rainbowchloe:')
      .setDescription(
        `Chúc bạn có những khoảng khắc vui vẻ và gắn kết với mọi người khi tham gia server, đừng ngần ngại trò chuyện và kết bạn với các thành viên khác nhé.\n\n` +
        `Hãy thoải mái tham gia các cuộc trò chuyện, đóng góp ý tưởng và cùng nhau xây dựng 1 cộng đồng vui vẻ và đoàn kết. ` +
        `Hi vọng bạn có những khoảng khắc tuyệt vời tại server!`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Radiant Lotus • ${new Date().toLocaleTimeString()}`,
        iconURL: 'https://cdn.discordapp.com/attachments/1367522678420013146/1367522900445495446/standard_1.gif'
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('.gg/ssh2hgpadH')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/channels/1367120428648108042/1367120774300700763') // Link mời của server
        .setEmoji(':62802:'),
    );

    await channel.send({
      content: `🎉 Chào mừng <@${member.id}> đã đến với server, <@&1367120686405128306> có member mới nè!`,
      embeds: [embed],
      components: [row]
    });
  });
};
