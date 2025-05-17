const { EmbedBuilder, Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const user = member.user;

    const embed = new EmbedBuilder()
      .setTitle('୨ <:Lounge_bow:1193021836510892083> ୧〃 ➜ *Thành viên mới*')
      .setDescription(`╭─────── <:p_heart18:710751780991926273> ────────❥
*${user}* đã tham gia server! ﹒ ><a:p_flowers01:700919142785744917> 

╭─ Hướng dẫn
> <a:RL_arrow:1367510296020783184> [Kênh Chat Fa](https://discord.com/channels/1367120428648108042/1367506963696713891)  
> <a:RL_arrow:1367510296020783184> [Tìm Đồng Đội](https://discord.com/channels/1367120428648108042/1367120810170515507)  
> <a:RL_arrow:1367510296020783184> [Chơi Bot](https://discord.com/channels/1367120428648108042/1367120830785519687)  
> <a:RL_arrow:1367510296020783184> [Vào đây để tạo voice chat của bạn](https://discord.com/channels/1367120428648108042/1367120774300700763)
╰─ ────── <:p_heart18:710751780991926273> ────────❥`)
      .setImage('https://cdn.discordapp.com/attachments/1367522678420013146/1367522834787729548/standard.gif?ex=6814e463&is=681392e3&hm=851175dde7a8e999bfe5a37f0eda1ef9934b76b49e267264c1df6ce6b7d83be6&')
      .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 256 }))
      .setColor('#FF1493') // màu hồng đậm

    // Gửi qua DM, fallback qua kênh nếu lỗi
    try {
      await user.send({ embeds: [embed] });
    } catch (error) {
      console.error('Không gửi được DM, thử gửi trong server...');
      const channel = member.guild.channels.cache.get('ID_KENH_WELCOME'); // thay ID kênh bạn muốn
      if (channel) channel.send({ content: `🎉 **Chào mừng <@${user.id}>!**`, embeds: [embed] });
    }
  }
};