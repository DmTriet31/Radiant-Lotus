const { EmbedBuilder } = require('discord.js');

module.exports = function createWelcomeDMEmbed(member) {
    const username = member.user.username;
    const serverName = member.guild.name;
    const avatar = member.user.displayAvatarURL({ dynamic: true });

    return new EmbedBuilder()
      .setTitle(`<a:RL_rainbowchloe:1371961708704301207> Welcome ୧〃 ➜ *Thành viên mới to ${serverName}!`)
      .setDescription(`╭─────── <a:RL_rainbowchloe:1371961708704301207> ────────❥
*${user}* đã tham gia server! ﹒ ><a:p_flowers01:700919142785744917> 

╭─ Hướng dẫn
> <a:RL_arrow:1367510296020783184> [Kênh Chat Fa](https://discord.com/channels/1367120428648108042/1367506963696713891)  
> <a:RL_arrow:1367510296020783184> [Tìm Đồng Đội](https://discord.com/channels/1367120428648108042/1367120810170515507)  
> <a:RL_arrow:1367510296020783184> [Chơi Bot](https://discord.com/channels/1367120428648108042/1367120830785519687)  
> <a:RL_arrow:1367510296020783184> [Vào đây để tạo voice chat của bạn](https://discord.com/channels/1367120428648108042/1367120774300700763)
╰─ ────── <:p_heart18:710751780991926273> ────────❥`)
        .setColor('#FF1493')
        .setThumbnail(avatar)
        .addFields(
            { name: '📅 Tham Gia', value: new Date().toDateString(), inline: true },
            { name: '📝 Info', value: 'Explore channels, follow rules, and say hi!' }
        )
        .setFooter({ text: `${serverName} Community` })
        .setTimestamp();
};
