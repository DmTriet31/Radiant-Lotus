const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner-update')
    .setDescription('Cập nhật link mời server đối tác')
    .addUserOption(option =>
      option.setName('đại_diện')
        .setDescription('Người đại diện cần cập nhật')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link_mới')
        .setDescription('Link mời mới đến server đối tác')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('đại_diện');
    const newLink = interaction.options.getString('link_mới');
    const guild = interaction.guild;

    const outputChannelId = '1376211429719412767'; // Kênh thông báo

    const updatedMessage = `>>> 🔁 **Cập nhật đối tác:** <@${user.id}>
<a:RL_muiten:1371959241430274101> **Link mới:** ${newLink}`;

    try {
      const channel = guild.channels.cache.get(outputChannelId);
      if (!channel) {
        return interaction.reply({ content: '❌ Không tìm thấy kênh gửi cập nhật partner!', ephemeral: true });
      }

      await channel.send({ content: updatedMessage });

      await interaction.reply({
        content: `✅ Đã cập nhật link mới cho đại diện ${user.tag}.`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Lỗi khi cập nhật partner:', error);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi cập nhật link.',
        ephemeral: true
      });
    }
  },
};
