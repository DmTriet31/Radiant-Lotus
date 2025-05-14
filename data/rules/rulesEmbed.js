const { EmbedBuilder } = require("discord.js");

const ruleEmbeds = {
    spam: new EmbedBuilder()
        .setColor("Red")
        .setTitle("<a:RL_pin:1367510433778372668> 🚫 Luật Spam")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> **1️⃣ Không gửi quá nhiều tin nhắn liên tục:** Tránh spam quá mức trong thời gian ngắn.\n" +
            "<:RL_pinkdot:1371961586608111876> **2️⃣ Không spam emoji:** Đừng làm loạn kênh với emoji hay sticker.\n" +
            "<:RL_pinkdot:1371961586608111876> **3️⃣ Không spam phản ứng:** Việc thêm/xoá phản ứng liên tục gây phiền.\n" +
            "<:RL_pinkdot:1371961586608111876> **4️⃣ Không copy-pasta:** Các đoạn văn dài, lặp lại sẽ bị xoá.\n" +
            "<:RL_pinkdot:1371961586608111876> **5️⃣ Không spam tự quảng cáo:** Quảng bá nội dung cá nhân quá mức là cấm."
        ),

    nsfw: new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle("<a:62802:1210522480901496863> 🔞 Luật Nội Dung Nhạy Cảm (NSFW)")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> **1️⃣ Cấm hoàn toàn nội dung NSFW:** Bao gồm ảnh, văn bản, hoặc đường link.\n" +
            "<:RL_pinkdot:1371961586608111876> **2️⃣ Không đùa giỡn hoặc thảo luận thiếu lành mạnh:** Hãy giữ nội dung trong sáng.\n" +
            "<:RL_pinkdot:1371961586608111876> **3️⃣ Cấm quấy rối tình dục:** Mọi hành vi khiếm nhã đều bị nghiêm cấm.\n" +
            "<:RL_pinkdot:1371961586608111876> **4️⃣ Không roleplay 18+:** Đây không phải là server dành cho người lớn."
        ),

    discord_terms: new EmbedBuilder()
        .setColor("Blue")
        .setTitle("<a:RL_GREENDOT:1367541794392506430> 📜 Điều Khoản & Chính Sách Discord")
        .setDescription(
            "**1️⃣ Tuân thủ [Điều Khoản Dịch Vụ của Discord](https://discord.com/terms)**.\n" +
            "**2️⃣ Tuân thủ [Hướng Dẫn Cộng Đồng Discord](https://discord.com/guidelines)**.\n" +
            "**3️⃣ Không sử dụng bot, hack, hay exploit trái phép.**\n" +
            "**4️⃣ Không lừa đảo, scam hoặc câu thông tin.**"
        ),

    harassment: new EmbedBuilder()
        .setColor("Orange")
        .setTitle("<a:RL_Reddot:1367541939662225409> 🚷 Luật Chống Quấy Rối")
        .setDescription(
            "<:RL_pinkdot:1371961586608111876> **1️⃣ Không công kích cá nhân.**\n" +
            "<:RL_pinkdot:1371961586608111876> **2️⃣ Không phát ngôn thù ghét.**\n" +
            "<:RL_pinkdot:1371961586608111876> **3️⃣ Không đe doạ hay tiết lộ thông tin cá nhân.**\n" +
            "<:RL_pinkdot:1371961586608111876> **4️⃣ Không troll quá mức.**"
        ),

    links: new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("<a:RL_arrow:1371961649690447892> 🔗 Luật Về Đường Dẫn")
        .setDescription(
            "**1️⃣ Không đăng link độc hại.**\n" +
            "**2️⃣ Không tự quảng cáo ngoài các kênh cho phép.**\n" +
            "**3️⃣ Không dùng link rút gọn hoặc IP grabber.**"
        ),

    images: new EmbedBuilder()
        .setColor("#FF00FF")
        .setTitle("<a:RL_rainbowchloe:1371961708704301207> 🖼️ Luật Về Hình Ảnh")
        .setDescription(
            "**1️⃣ Cấm hình NSFW hoặc phản cảm.**\n" +
            "**2️⃣ Cấm ảnh bạo lực, máu me.**\n" +
            "**3️⃣ Không spam meme.**\n" +
            "**4️⃣ Không đăng ảnh xúc phạm hoặc phân biệt.**"
        ),

    hacking: new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("<a:RL_77:1367510222603554827> 🛑 Luật Chống Hack/Exploit")
        .setDescription(
            "**1️⃣ Cấm hack, cheat hoặc exploit.**\n" +
            "**2️⃣ Không chia sẻ phần mềm trái phép.**\n" +
            "**3️⃣ Cấm lừa đảo kiểu social engineering.**\n" +
            "**4️⃣ Cấm dùng tài khoản phụ để vượt phạt.**"
        ),

    mic_spam: new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("🎤 Luật Về Voice/Mic <a:RL_pin:1367510433778372668>")
        .setDescription(
            "**1️⃣ Không phát âm thanh lớn, méo hoặc khó chịu.**\n" +
            "**2️⃣ Không dùng voice changer nếu chưa được cho phép.**\n" +
            "**3️⃣ Không mở nhạc qua mic.**\n" +
            "**4️⃣ Không hét hoặc la quá mức.**"
        ),

    bot_usage: new EmbedBuilder()
        .setColor("#008000")
        .setTitle("<a:RL_staff:1367510478288322710> 🤖 Luật Sử Dụng Bot")
        .setDescription(
            "**1️⃣ Không lạm dụng lệnh bot.**\n" +
            "**2️⃣ Không spam lệnh bot ở kênh chính.**\n" +
            "**3️⃣ Không tìm cách phá hoại bot.**"
        ),

    trading_selling: new EmbedBuilder()
        .setColor("#8B4513")
        .setTitle("💰 Luật Mua Bán & Giao Dịch <a:RL_arrow:1371961649690447892>")
        .setDescription(
            "**1️⃣ Không mua bán tài khoản, vật phẩm.**\n" +
            "**2️⃣ Không giao dịch hoặc cá cược.**\n" +
            "**3️⃣ Không quảng bá dịch vụ cá nhân trái phép.**"
        ),

    language: new EmbedBuilder()
        .setColor("#4682B4")
        .setTitle("🗣️ Luật Ngôn Ngữ <a:RL_rainletter:1371820268552589437>")
        .setDescription(
            "**1️⃣ Dùng tiếng Anh ở kênh chung.**\n" +
            "**2️⃣ Không chửi tục quá mức.**\n" +
            "**3️⃣ Không dùng từ xúc phạm.**"
        ),

    spoilers: new EmbedBuilder()
        .setColor("#A52A2A")
        .setTitle("🎥 Luật Spoiler <a:RL_Reddot:1367541939662225409>")
        .setDescription(
            "**1️⃣ Dùng spoiler tag cho nội dung tiết lộ.**\n" +
            "**2️⃣ Không spoil ở kênh không cho phép.**"
        ),

    self_promotion: new EmbedBuilder()
        .setColor("#9370DB")
        .setTitle("📢 Luật Tự Quảng Cáo <a:RL_arrow:1371961649690447892>")
        .setDescription(
            "**1️⃣ Không tự quảng cáo ngoài khu vực được phép.**\n" +
            "**2️⃣ Không gửi quảng cáo qua DM.**\n" +
            "**3️⃣ Không xin xỏ follow, sub, donate.**"
        ),

    moderation: new EmbedBuilder()
        .setColor("#228B22")
        .setTitle("⚖️ Luật Về Quản Trị <a:RL_staff:1367510478288322710>")
        .setDescription(
            "**1️⃣ Tôn trọng quyết định của staff.**\n" +
            "**2️⃣ Không làm quản trị viên tự phong.**\n" +
            "**3️⃣ Có gì cần góp ý hãy nhắn riêng cho staff.**"
        )
};

module.exports = ruleEmbeds;
