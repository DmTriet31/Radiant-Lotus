const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

const rankChoices = [
  'Global Elite', 'Supreme Master', 'Legendary Eagle Master',
  'Legendary Eagle', 'Distinguished Master Guardian',
  'Master Guardian', 'Gold Nova', 'Silver',
  'Chưa xếp hạng', 'Chơi thường'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('csgo')
    .setDescription('Tạo tin tuyển người chơi CS:GO')
    .addStringOption(option =>
      option.setName('rank')
        .setDescription('Chọn rank CS:GO')
        .setRequired(true)
        .addChoices(...rankChoices.map(rank => ({ name: rank, value: rank })))
    )
    .addStringOption(option =>
      option.setName('msg')
        .setDescription('Nội dung tin nhắn tuyển')
        .setRequired(true)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString('msg');
    const rank = interaction.options.getString('rank');
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    let roomName = '❌ Không ở trong voice channel';
    let slot = '0/0';
    let row = null;
    let invite = null;

    const embed = new EmbedBuilder()
      .setColor(0x4B92DB)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setFooter({ text: 'Sử dụng: /csgo rank: [rank] msg: [nội dung tuyển]' });

    if (voiceChannel) {
      const memberCount = voiceChannel.members.size;
      const userLimit = voiceChannel.userLimit;
      slot = `${memberCount}/${userLimit === 0 ? 'Unlimited' : userLimit}`;
      roomName = voiceChannel.name;

      // Tạo invite tạm thời
      invite = await voiceChannel.createInvite({
        maxAge: 300,  // Invite hết hạn sau 5 phút
        maxUses: 1,   // Chỉ có thể sử dụng 1 lần
        temporary: true // Người dùng sẽ bị kick nếu không có role khi rời server
      });

      const joinButton = new ButtonBuilder()
        .setLabel(`🔊 Tham gia: ${voiceChannel.name}`)
        .setStyle(ButtonStyle.Link)
        .setURL(invite.url); // Sử dụng link invite

      row = new ActionRowBuilder().addComponents(joinButton);
    }

    embed.addFields(
      { name: 'Phòng voice', value: roomName, inline: true },
      { name: 'Slot', value: slot, inline: true },
      { name: 'Rank', value: rank, inline: true }
    );

    await interaction.reply({
      content: `${interaction.user} ${msg}`,
      embeds: [embed],
      components: row ? [row] : []
    });

    // Lắng nghe sự kiện rời voice channel
    if (voiceChannel && invite) {
      const filter = (oldState, newState) =>
        newState.member.id === interaction.user.id &&
        oldState.channelId === voiceChannel.id &&
        !newState.channelId;

      const collector = voiceChannel.createDisconnectCollector({ filter, time: 60000 });

      collector.on('collect', async () => {
        await invite.delete().catch(() => {});
        console.log(`Đã xóa invite vì người dùng rời khỏi voice channel.`);
      });
    }
  }
};
