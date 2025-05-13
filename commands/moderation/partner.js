const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner')
    .setDescription('Gửi thông báo đối tác mới')
    .addUserOption(option =>
      option.setName('đại_diện')
        .setDescription('Người đại diện cho đối tác')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Link mời đến server đối tác')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('lĩnh_vực')
        .setDescription('Lĩnh vực hoạt động của đối tác')
        .setRequired(true)
        .addChoices(
          { name: 'Community', value: 'Community' },
          { name: 'Shop', value: 'Shop' },
          { name: 'Sell', value: 'Sell' },
          { name: 'Entertainment', value: 'Entertainment' },
          { name: 'Gaming', value: 'Gaming' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('đại_diện');
    const link = interaction.options.getString('link');
    const linhVuc = interaction.options.getString('lĩnh_vực');
    const guild = interaction.guild;

    const serverName = user.username; // Tự lấy từ user đại diện

    const partnerRoleId = '1367120701869260941';
    const outputChannelId = '1367120844878254202'; // Kênh gửi thông báo

    const partnerEmbed = new EmbedBuilder()
      .setColor('#FFC0CB')
      .setDescription(`>>> ✅ **PARTNER MỚI**
<a:RL_verifyanimated:1371693855430283365> **Đối Tác Mới Đã Được Xác Nhận**


<a:RL_77:1367510222603554827> **Người Đại Diện:** <@${user.id}>
<a:RL_124:1367510341734371411> **Tên Server:** **${serverName}**
<a:RL_124:1367510341734371411> **Lĩnh Vực:** **${linhVuc}**
<a:RL_arrow:1367510296020783184> **Link Server:** ${link}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `Radiant Lotus | Gửi bởi ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    const joinButton = new ButtonBuilder()
      .setLabel('Tham gia server')
      .setStyle(5)
      .setURL(link);

    const actionRow = new ActionRowBuilder().addComponents(joinButton);

    try {
      const channel = guild.channels.cache.get(outputChannelId);
      if (!channel) {
        return interaction.reply({ content: '❌ Không tìm thấy kênh gửi partner!', ephemeral: true });
      }

      // Gửi thông báo vào kênh
      await channel.send({
        embeds: [partnerEmbed],
        components: [actionRow]
      });

      // Gán role cho đại diện
      const member = await guild.members.fetch(user.id);
      await member.roles.add(partnerRoleId);

      // Phản hồi riêng cho người dùng dùng lệnh
      await interaction.reply({
        content: `✅ Đã thêm đối tác **${serverName}** và cấp role cho ${user.tag}!`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Lỗi khi xử lý partner:', error);
      await interaction.reply({
        content: '❌ Đã xảy ra lỗi khi gửi partner.',
        ephemeral: true
      });
    }
  },
};
