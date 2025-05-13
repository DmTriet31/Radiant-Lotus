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
    .setDescription('Gửi thông báo partner đẹp như mẫu')
    .addUserOption(option =>
      option.setName('đại_diện')
        .setDescription('Người đại diện cho đối tác')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tên_server')
        .setDescription('Tên server đối tác')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('lĩnh_vực')
        .setDescription('Lĩnh vực hoạt động')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Link mời đến server đối tác')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('đại_diện');
    const serverName = interaction.options.getString('tên_server');
    const linhVuc = interaction.options.getString('lĩnh_vực');
    const link = interaction.options.getString('link');
    const guild = interaction.guild;

    const partnerRoleId = '1367120701869260941';
    const partnerPostChannelId = '1367120846413631639'; // Đặt lại ID nếu cần
    const outputChannelId = '1367120844878254202'; // Kênh gửi thông báo

    const partnerEmbed = new EmbedBuilder()
      .setColor('#FFC0CB')
      .setDescription(`>>> ✅ **PARTNER**
<a:ws_verify:1289423707302789177> **Đơn Của Bạn Đã Được Chấp Nhận**

<a:ws_partner:1289193885138161664> **Partner**<a:ws_partner:1289193885138161664>
<a:ws_star_pink:1289417957734223872> **Người Đại Diện:** <@${user.id}>
<a:ws_papitas:1289417992081506417> **Tên Server:** **${serverName}**
<:ws_hypesquad_balance:1294648243472437258> **Lĩnh Vực:** **${linhVuc}**
<a:ws_sparklecolors:1284407469413498961> **Link Server:** ${link}`)
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
        content: `✅ Đã đăng partner cho **${serverName}** và cấp role cho ${user.tag}!`,
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