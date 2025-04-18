const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

const genreChoices = [
  'Hành động', 'Kinh dị', 'Lãng mạn', 'Hài hước',
  'Khoa học viễn tưởng', 'Hoạt hình', 'Phim tài liệu', 'Chưa chọn'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('votephim')
    .setDescription('Tạo cuộc bầu chọn cho thể loại phim và tên phim')
    .addStringOption(option =>
      option.setName('genre')
        .setDescription('Chọn thể loại phim')
        .setRequired(true)
        .addChoices(...genreChoices.map(genre => ({ name: genre, value: genre })))
    )
    .addStringOption(option =>
      option.setName('movie')
        .setDescription('Tên phim')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Ngày tháng xem phim (VD: 20/04/2025)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('vote_time')
        .setDescription('Thời gian vote (phút, VD: 5)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const genre = interaction.options.getString('genre');
    const movie = interaction.options.getString('movie');
    const date = interaction.options.getString('date');
    let voteTime = interaction.options.getInteger('vote_time') || 5; // mặc định 5 phút nếu không nhập

    if (voteTime < 1 || voteTime > 60) {
      return interaction.reply({
        content: 'Thời gian vote phải từ 1 đến 60 phút!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFF6347)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle('Cuộc Bầu Chọn Phim Xem Cùng!')
      .setDescription(`**Thể loại phim**: ${genre}\n**Tên phim**: ${movie}\n**Ngày xem**: ${date}\n**Thời gian vote**: ${voteTime} phút`)
      .setFooter({ text: 'Hãy vote bằng cách thả 👍 hoặc 👎' });

    const message = await interaction.reply({
      content: `${interaction.user} đã tạo một cuộc bầu chọn phim!`,
      embeds: [embed],
      fetchReply: true
    });

    try {
      await message.react('👍');
      await message.react('👎');
    } catch (error) {
      console.error('Lỗi khi thêm reaction:', error);
    }

    setTimeout(async () => {
      try {
        const fetchedMessage = await message.fetch();
        const upVotes = fetchedMessage.reactions.cache.get('👍')?.count - 1 || 0;
        const downVotes = fetchedMessage.reactions.cache.get('👎')?.count - 1 || 0;

        const resultEmbed = new EmbedBuilder()
          .setColor(0x00BFFF)
          .setTitle('Kết Quả Bầu Chọn')
          .setDescription(`**Phim:** ${movie}\n**👍 Thích:** ${upVotes} phiếu\n**👎 Không thích:** ${downVotes} phiếu`);

        await interaction.followUp({ content: 'Cuộc vote đã kết thúc!', embeds: [resultEmbed] });
      } catch (error) {
        console.error('Lỗi khi thống kê kết quả vote:', error);
      }
    }, voteTime * 60 * 1000); // chuyển phút sang milliseconds
  }
};