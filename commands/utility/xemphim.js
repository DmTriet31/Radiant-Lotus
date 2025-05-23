const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

const genreChoices = [
  'Hành động', 'Kinh dị', 'Lãng mạn', 'Hài hước', 
  'Khoa học viễn tưởng', 'Hoạt hình', 'Phim tài liệu', 'Chưa chọn'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xemphim')
    .setDescription('Tạo tin tuyển người tham gia xem phim')
    .addStringOption(option =>
      option.setName('genre')
        .setDescription('Chọn thể loại phim')
        .setRequired(true)
        .addChoices(...genreChoices.map(genre => ({ name: genre, value: genre })))
    )
    .addStringOption(option =>
      option.setName('msg')
        .setDescription('Nội dung tin nhắn')
        .setRequired(true)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString('msg');
    const genre = interaction.options.getString('genre');
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;
    const roomName = voiceChannel ? voiceChannel.name : '❌ Không ở trong voice channel';

    const embed = new EmbedBuilder()
      .setColor(0xFF6347)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .addFields(
        { name: 'Phòng voice', value: roomName, inline: true },
        { name: 'Thể loại phim', value: genre, inline: true }
      )
      .setFooter({ text: 'Sử dụng: /xemphim genre: [thể loại] msg: [nội dung tuyển]' });

    const joinButton = new ButtonBuilder()
      .setCustomId(JSON.stringify({ cmd: 'join_voice', vc: voiceChannel?.id || null }))
      .setLabel('🔊 Tham gia voice')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!voiceChannel);

    const row = new ActionRowBuilder().addComponents(joinButton);

    await interaction.reply({
      content: `${interaction.user} ${msg}`,
      embeds: [embed],
      components: [row]
    });
  }
};
