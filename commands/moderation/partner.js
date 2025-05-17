const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner')
    .setDescription('Cấp role và gửi thông báo đối tác mới')
    .addUserOption(option =>
      option.setName('đại_diện')
        .setDescription('Người đại diện cho đối tác')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Link mời đến server đối tác')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const user = interaction.options.getUser('đại_diện');
    const link = interaction.options.getString('link');
    const guild = interaction.guild;

    const partnerRoleId = '1367120701869260941'; // ID role partner
    const outputChannelId = '1367120844878254202'; // ID kênh gửi thông báo

    const messageContent = `>>> 
<a:RL_77:1367510222603554827> **Người Đại Diện:** <@${user.id}>
<a:RL_muiten:1371959241430274101> **Link Server:** ${link}`;

    try {
      const channel = guild.channels.cache.get(outputChannelId);
      if (!channel) {
        return interaction.reply({ content: '❌ Không tìm thấy kênh gửi partner!', ephemeral: true });
      }

      // Gửi thông báo
      await channel.send({ content: messageContent });

      // Cấp role cho người đại diện
      const member = await guild.members.fetch(user.id);
      await member.roles.add(partnerRoleId);

      await interaction.reply({
        content: `✅ Đã cấp role partner cho ${user.tag}!`,
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
