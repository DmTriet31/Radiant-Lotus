const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Wcard } = require('wcard-gen');
const { welcomeCollection } = require('../mongodb');
const data = require('../UI/banners/welcomecards');

// Hàm tải cấu hình chào mừng từ cơ sở dữ liệu
async function loadWelcomeConfig() {
    try {
        const configs = await welcomeCollection.find().toArray();
        return configs.reduce((acc, config) => {
            acc[config.serverId] = config;
            return acc;
        }, {});
    } catch (err) {
        return {};
    }
}

// Hàm lấy hậu tố thứ tự (th, st, nd, rd)
function getOrdinalSuffix(number) {
    if (number === 11 || number === 12 || number === 13) {
        return 'th';
    }
    const lastDigit = number % 10;
    switch (lastDigit) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

// Hàm chọn ngẫu nhiên một hình ảnh từ danh sách
function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}

// Hàm rút ngắn tên người dùng nếu vượt quá độ dài tối đa
function truncateUsername(username, maxLength = 15) {
    return username.length > maxLength ? `${username.slice(0, maxLength)}...` : username;
}

module.exports = async (client) => {
    let welcomeConfig = await loadWelcomeConfig();

    // Cập nhật cấu hình chào mừng mỗi 5 giây
    setInterval(async () => {
        welcomeConfig = await loadWelcomeConfig();
    }, 5000);

    client.on('guildMemberAdd', async (member) => {
        const guildId = member.guild.id;
        const settings = welcomeConfig[guildId];

        if (settings && settings.status) {
            const welcomeChannel = member.guild.channels.cache.get(settings.welcomeChannelId);
            if (welcomeChannel) {
                const memberCount = member.guild.memberCount;
                const suffix = getOrdinalSuffix(memberCount);
                const userName = truncateUsername(member.user.username);
                const joinDate = member.joinedAt.toDateString();
                const creationDate = member.user.createdAt.toDateString();
                const serverIcon = member.guild.iconURL({ format: 'png', dynamic: true, size: 256 });
                const randomImage = getRandomImage(data.welcomeImages);
                
                const embed = new EmbedBuilder()
                    .setTitle("𝑾𝒆𝒍𝒄𝒐𝒎𝒆 ${member.guild.name} <a:member:1358083165998158057>")
                    .setDescription(`<a:wlc:1358771983311175781> Chúc bạn có những khoảng khắc vui vẻ và gắn kết với mọi người khi tham gia server, đừng ngần ngại trò chuyện và kết bạn với các thành viên khác nhé.\n\nHãy thoải mái tham gia các cuộc trò chuyện, đóng góp ý tưởng và cùng nhau xây dựng 1 cộng đồng vui vẻ đoàn kết. Hy vọng bạn có những khoảng khắc tuyệt vời tại server!`)
                    .setColor("#8B0000")
                    .setThumbnail(serverIcon)
                    .setFooter({ text: "Viet Zone", iconURL: serverIcon })
                    .setAuthor({ name: userName, iconURL: member.user.displayAvatarURL() })
                    .setTimestamp();
                
                welcomeChannel.send({
                    content: `<a:wlc:1358771983311175781> Chào mừng ${member} đã đến với server.`,
                    embeds: [embed]
                });                
            }
        }
    });
};
