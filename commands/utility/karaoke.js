const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

const genreChoices = [
  'Pop', 'Rock', 'Rap', 'Ballad', 'EDM', 'K-Pop', 'Jazz', 'Nhạc trẻ', 'Nhạc trữ tình', 'Khác'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karaoke')
    .setDescription('Tạo danh sách ca sĩ chờ hát karaoke')
    .addStringOption(option =>
      option.setName('genre')
        .setDescription('Chọn thể loại nhạc')
        .setRequired(true)
        .addChoices(...genreChoices.map(genre => ({ name: genre, value: genre })))
    )
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Tên bài hát')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const genre = interaction.options.getString('genre');
    const song = interaction.options.getString('song');
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;
    const roomName = voiceChannel ? voiceChannel.name : '❌ Không ở trong voice channel';

    // Tự động tag người dùng đang thực hiện lệnh (người dùng là ca sĩ)
    const singerTag = interaction.user;

    // Thông tin bài hát và ca sĩ
    const embed = new EmbedBuilder()
      .setColor(0x1E90FF)
      .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(`🎤 **Ca Sĩ Đang Đợi**`)
      .setDescription(`**Bài hát**: ${song}\n**Thể loại**: ${genre}\n**Ca sĩ**: <@${singerTag.id}>`)
      .addFields(
        { name: 'Phòng voice', value: roomName, inline: true },
        { name: 'Số ca sĩ đang chờ', value: '1/Không giới hạn', inline: true }
      )
      .setFooter({ text: 'Sử dụng: /karaoke genre: [thể loại] song: [tên bài hát]' });

    // Nút tham gia voice channel
    const joinButton = new ButtonBuilder()
      .setCustomId(JSON.stringify({ cmd: 'join_voice', vc: voiceChannel?.id || null }))
      .setLabel('🔊 Tham gia Voice')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!voiceChannel);

    const row = new ActionRowBuilder().addComponents(joinButton);

    await interaction.reply({
      content: `${interaction.user} đang chờ hát karaoke!`,
      embeds: [embed],
      components: [row]
    });
  }
};
