const { EmbedBuilder } = require("discord.js");

const ruleEmbeds = {
    spam: new EmbedBuilder()
        .setColor("Red")
        .setTitle("<a:RL_pin:1367510433778372668> Luật Spam")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không gửi quá nhiều tin nhắn liên tục.\n" +
            "<:RL_pinkdot:1371961586608111876> Không spam emoji hoặc sticker.\n" +
            "<:RL_pinkdot:1371961586608111876> Không spam phản ứng.\n" +
            "<:RL_pinkdot:1371961586608111876> Không copy-pasta.\n" +
            "<:RL_pinkdot:1371961586608111876> Không spam quảng cáo cá nhân."
        ),

    nsfw: new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle("<a:RL_Reddot:1367541939662225409> Luật Nội Dung Nhạy Cảm (NSFW)")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Cấm hoàn toàn nội dung NSFW (ảnh, text, link).\n" +
            "<:RL_pinkdot:1371961586608111876> Không đùa giỡn hoặc thảo luận thiếu lành mạnh.\n" +
            "<:RL_pinkdot:1371961586608111876> Cấm quấy rối tình dục.\n" +
            "<:RL_pinkdot:1371961586608111876> Không roleplay 18+."
        ),

    discord_terms: new EmbedBuilder()
        .setColor("Blue")
        .setTitle("<a:RL_GREENDOT:1367541794392506430> Discord Terms & Conditions")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Tuân thủ [Điều Khoản Dịch Vụ](https://discord.com/terms).\n" +
            "<:RL_pinkdot:1371961586608111876> Tuân thủ [Hướng Dẫn Cộng Đồng](https://discord.com/guidelines).\n" +
            "<:RL_pinkdot:1371961586608111876> Không dùng bot, hack, hoặc exploit trái phép.\n" +
            "<:RL_pinkdot:1371961586608111876> Không lừa đảo, scam, phishing."
        ),

    harassment: new EmbedBuilder()
        .setColor("Orange")
        .setTitle("<a:RL_Reddot:1367541939662225409> Luật Chống Quấy Rối")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không công kích cá nhân.\n" +
            "<:RL_pinkdot:1371961586608111876> Không phát ngôn thù ghét.\n" +
            "<:RL_pinkdot:1371961586608111876> Không đe doạ hoặc tiết lộ thông tin.\n" +
            "<:RL_pinkdot:1371961586608111876> Không troll quá mức."
        ),

    links: new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("<a:RL_arrow:1371961649690447892> Luật Về Đường Dẫn")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không đăng link độc hại.\n" +
            "<:RL_pinkdot:1371961586608111876> Không quảng cáo ngoài kênh cho phép.\n" +
            "<:RL_pinkdot:1371961586608111876> Không dùng link rút gọn hoặc IP grabber."
        ),

    images: new EmbedBuilder()
        .setColor("#FF00FF")
        .setTitle("<a:RL_rainbowchloe:1371961708704301207> Luật Về Hình Ảnh")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Cấm hình ảnh NSFW hoặc phản cảm.\n" +
            "<:RL_pinkdot:1371961586608111876> Không chia sẻ ảnh bạo lực, máu me.\n" +
            "<:RL_pinkdot:1371961586608111876> Không spam meme.\n" +
            "<:RL_pinkdot:1371961586608111876> Không đăng ảnh phân biệt đối xử."
        ),

    hacking: new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("<a:RL_77:1367510222603554827> Luật Hacking")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Cấm hack, cheat hoặc exploit.\n" +
            "<:RL_pinkdot:1371961586608111876> Không chia sẻ phần mềm trái phép.\n" +
            "<:RL_pinkdot:1371961586608111876> Không lừa đảo social engineering.\n" +
            "<:RL_pinkdot:1371961586608111876> Không dùng tài khoản phụ để tránh bị phạt."
        ),

    mic_spam: new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("<a:62802:1210522480901496863> Luật Voice Chat / Mic")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không phát âm thanh to hoặc méo tiếng.\n" +
            "<:RL_pinkdot:1371961586608111876> Không dùng voice changer nếu không được phép.\n" +
            "<:RL_pinkdot:1371961586608111876> Không mở nhạc qua mic.\n" +
            "<:RL_pinkdot:1371961586608111876> Không hét hoặc gây ồn ào quá mức."
        ),

    bot_usage: new EmbedBuilder()
        .setColor("#008000")
        .setTitle("<a:RL_staff:1367510478288322710> Luật Sử Dụng Bot")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không spam hoặc lạm dụng bot.\n" +
            "<:RL_pinkdot:1371961586608111876> Dùng bot đúng kênh.\n" +
            "<:RL_pinkdot:1371961586608111876> Không tìm cách phá bot."
        ),

    trading_selling: new EmbedBuilder()
        .setColor("#8B4513")
        .setTitle("<a:RL_arrow:1371961649690447892> Luật Mua Bán / Giao Dịch")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không buôn bán tài khoản, item, dịch vụ.\n" +
            "<:RL_pinkdot:1371961586608111876> Không cá cược hoặc giao dịch rủi ro.\n" +
            "<:RL_pinkdot:1371961586608111876> Không quảng bá dịch vụ cá nhân trái phép."
        ),

    language: new EmbedBuilder()
        .setColor("#4682B4")
        .setTitle("<a:RL_rainletter:1371820268552589437> Luật Ngôn Ngữ")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Chỉ dùng tiếng Anh ở kênh chung.\n" +
            "<:RL_pinkdot:1371961586608111876> Không chửi tục quá nhiều.\n" +
            "<:RL_pinkdot:1371961586608111876> Không dùng từ xúc phạm hay phân biệt."
        ),

    spoilers: new EmbedBuilder()
        .setColor("#A52A2A")
        .setTitle("<a:RL_Reddot:1367541939662225409> Luật Spoiler")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Dùng `||spoiler||` cho nội dung tiết lộ.\n" +
            "<:RL_pinkdot:1371961586608111876> Không spoil ở kênh không cho phép."
        ),

    self_promotion: new EmbedBuilder()
        .setColor("#9370DB")
        .setTitle("<a:RL_arrow:1371961649690447892> Luật Tự Quảng Cáo")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Không quảng cáo ngoài khu vực cho phép.\n" +
            "<:RL_pinkdot:1371961586608111876> Không quảng cáo qua tin nhắn riêng (DM).\n" +
            "<:RL_pinkdot:1371961586608111876> Không xin donate, follow hoặc subs."
        ),

    moderation: new EmbedBuilder()
        .setColor("#228B22")
        .setTitle("<a:RL_staff:1367510478288322710> Luật Quản Trị")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> Tôn trọng quyết định của quản trị viên.\n" +
            "<:RL_pinkdot:1371961586608111876> Không tự ý can thiệp khi staff đang xử lý.\n" +
            "<:RL_pinkdot:1371961586608111876> Góp ý nên nhắn riêng cho staff."
        )
};

module.exports = ruleEmbeds;
