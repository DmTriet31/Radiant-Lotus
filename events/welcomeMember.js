const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.GuildMemberAdd, async member => {
    const channel = member.guild.channels.cache.find(
      ch => ch.name === 'welcome' || ch.id === '1376211389324202177'
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xff4757)
      .setTitle('<a:RL_rainbowchloe:1376245313853063250> Welcome To Radiant Lotus <a:RL_rainbowchloe:1376245313853063250>')
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
        .setLabel('.gg/radiantlotus')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/channels/1369830175700942959/1376211346294833152') // Link mời của server
        .setEmoji('<a:RL_62802:1376215865036636182>'),
    
    new ButtonBuilder()
        .setCustomId('greet_member')
        .setLabel('👋 Chào member')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: `🎉 Chào mừng <@${member.id}> đã đến với server, <@&1376211241915125813> có member mới nè!`,
      embeds: [embed],
      components: [row]
    });

    const greetings = [
      `Chào mừng <@${member.id}> đến với Radiant Lotus! 🌸`,
      `Heyy <@${member.id}>! Mong bạn sẽ có khoảng thời gian tuyệt vời tại đây 💫`,
      `<@${member.id}>, rất vui khi bạn tham gia với chúng tôi 😄`,
      `Yay <@${member.id}> đã đến, cùng vui chơi nào! 🎉`,
      `Xin chào <@${member.id}>, chúc bạn tìm được những người bạn mới tuyệt vời! 💖`
    ];

    const collector = sentMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60 * 1000 // hoạt động trong 1 phút
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'greet_member') {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        await interaction.reply({
          content: `<@${interaction.user.id}> nói: ${randomGreeting}`,
          ephemeral: false
        });
      }
    });
  });