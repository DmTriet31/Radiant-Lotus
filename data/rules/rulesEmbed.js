const { EmbedBuilder } = require("discord.js");

const ruleEmbeds = {
    spam: new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚫 Luật Spam")
        .setDescription(
            "**1️⃣ Không gửi quá nhiều tin nhắn liên tục:** Tránh spam quá mức trong thời gian ngắn.\n" +
            "**2️⃣ Không spam emoji:** Đừng làm loạn kênh với emoji hay sticker.\n" +
            "**3️⃣ Không spam phản ứng:** Việc thêm/xoá phản ứng liên tục gây phiền.\n" +
            "**4️⃣ Không copy-pasta:** Các đoạn văn dài, lặp lại sẽ bị xoá.\n" +
            "**5️⃣ Không spam tự quảng cáo:** Quảng bá nội dung cá nhân quá mức là cấm."
        ),

    nsfw: new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle("🔞 Luật Nội Dung Nhạy Cảm (NSFW)")
        .setDescription(
            "**1️⃣ Cấm hoàn toàn nội dung NSFW:** Bao gồm ảnh, văn bản, hoặc đường link.\n" +
            "**2️⃣ Không đùa giỡn hoặc thảo luận thiếu lành mạnh:** Hãy giữ nội dung trong sáng.\n" +
            "**3️⃣ Cấm quấy rối tình dục:** Mọi hành vi khiếm nhã đều bị nghiêm cấm.\n" +
            "**4️⃣ Không roleplay 18+:** Đây không phải là server dành cho người lớn."
        ),

    discord_terms: new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📜 Điều Khoản & Chính Sách Discord")
        .setDescription(
            "**1️⃣ Tuân thủ [Điều Khoản Dịch Vụ của Discord](https://discord.com/terms)**.\n" +
            "**2️⃣ Tuân thủ [Hướng Dẫn Cộng Đồng Discord](https://discord.com/guidelines)**.\n" +
            "**3️⃣ Không sử dụng bot, hack, hay exploit trái phép.**\n" +
            "**4️⃣ Không lừa đảo, scam hoặc câu thông tin.**"
        ),

    harassment: new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🚷 Luật Chống Quấy Rối")
        .setDescription(
            "**1️⃣ Không công kích cá nhân:** Không xúc phạm hay nhắm vào ai.\n" +
            "**2️⃣ Không phát ngôn thù ghét:** Kỳ thị chủng tộc, giới tính, LGBTQ+, tôn giáo... đều bị cấm.\n" +
            "**3️⃣ Không đe doạ hay tiết lộ thông tin cá nhân (dox):** Hành vi nghiêm trọng sẽ bị ban.\n" +
            "**4️⃣ Không troll quá mức:** Đùa vui được, nhưng đừng gây khó chịu."
        ),

    links: new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🔗 Luật Về Đường Dẫn")
        .setDescription(
            "**1️⃣ Không đăng link độc hại:** Bao gồm virus, scam, hoặc NSFW.\n" +
            "**2️⃣ Không tự quảng cáo ngoài các kênh cho phép.**\n" +
            "**3️⃣ Không dùng link rút gọn hoặc IP grabber:** Chỉ chia sẻ link uy tín và rõ ràng."
        ),

    images: new EmbedBuilder()
        .setColor("#FF00FF")
        .setTitle("🖼️ Luật Về Hình Ảnh")
        .setDescription(
            "**1️⃣ Cấm hình NSFW hoặc phản cảm:** Giữ môi trường an toàn.\n" +
            "**2️⃣ Cấm ảnh bạo lực, máu me:** Không phù hợp với cộng đồng.\n" +
            "**3️⃣ Không spam meme:** Vui thôi, đừng vui quá.\n" +
            "**4️⃣ Không đăng ảnh xúc phạm hoặc phân biệt.**"
        ),

    hacking: new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛑 Luật Chống Hack/Exploit")
        .setDescription(
            "**1️⃣ Cấm hack, cheat hoặc exploit:** Không tấn công bot, server hay người dùng.\n" +
            "**2️⃣ Không chia sẻ phần mềm trái phép:** Bao gồm scripts, tools không được cho phép.\n" +
            "**3️⃣ Cấm lừa đảo kiểu kỹ thuật xã hội (social engineering).**\n" +
            "**4️⃣ Cấm dùng tài khoản phụ để vượt qua hình phạt.**"
        ),

    mic_spam: new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("🎤 Luật Về Voice/Mic")
        .setDescription(
            "**1️⃣ Không phát âm thanh lớn, méo hoặc gây khó chịu.**\n" +
            "**2️⃣ Không dùng voice changer hoặc soundboard trừ khi được phép.**\n" +
            "**3️⃣ Không mở nhạc qua mic:** Dùng bot âm nhạc thay thế.\n" +
            "**4️⃣ Không hét to hoặc la lối quá mức.**"
        ),

    bot_usage: new EmbedBuilder()
        .setColor("#008000")
        .setTitle("🤖 Luật Sử Dụng Bot")
        .setDescription(
            "**1️⃣ Không lạm dụng lệnh bot:** Dùng đúng mục đích.\n" +
            "**2️⃣ Không spam lệnh bot ở kênh chính:** Sử dụng trong kênh bot.\n" +
            "**3️⃣ Không tìm cách hack hoặc phá hoại bot.**"
        ),

    trading_selling: new EmbedBuilder()
        .setColor("#8B4513")
        .setTitle("💰 Luật Mua Bán & Giao Dịch")
        .setDescription(
            "**1️⃣ Không mua bán tài khoản, vật phẩm, dịch vụ:** Server không phải chợ.\n" +
            "**2️⃣ Không chơi trò đổi chác, đánh cược:** Hãy dùng nền tảng uy tín khác.\n" +
            "**3️⃣ Không quảng bá kinh doanh cá nhân khi chưa được phép.**"
        ),

    language: new EmbedBuilder()
        .setColor("#4682B4")
        .setTitle("🗣️ Luật Ngôn Ngữ")
        .setDescription(
            "**1️⃣ Chỉ dùng tiếng Anh trong kênh chung:** Các ngôn ngữ khác có kênh riêng.\n" +
            "**2️⃣ Không chửi tục quá mức:** Hãy giữ phép lịch sự.\n" +
            "**3️⃣ Không dùng từ ngữ thô tục, phân biệt, xúc phạm.**"
        ),

    spoilers: new EmbedBuilder()
        .setColor("#A52A2A")
        .setTitle("🎥 Luật Spoiler")
        .setDescription(
            "**1️⃣ Dùng thẻ spoiler cho nội dung tiết lộ:** Ví dụ: `||spoiler||`\n" +
            "**2️⃣ Không spoil ngoài kênh được chỉ định.**"
        ),

    self_promotion: new EmbedBuilder()
        .setColor("#9370DB")
        .setTitle("📢 Luật Tự Quảng Cáo")
        .setDescription(
            "**1️⃣ Không tự quảng cáo ngoài kênh cho phép.**\n" +
            "**2️⃣ Không quảng cáo qua tin nhắn riêng (DM):** Gửi link không mong muốn là cấm.\n" +
            "**3️⃣ Không xin xỏ follow, donate, sub.**"
        ),

    moderation: new EmbedBuilder()
        .setColor("#228B22")
        .setTitle("⚖️ Luật Về Quản Trị")
        .setDescription(
            "**1️⃣ Tôn trọng quản trị viên và quyết định của họ.**\n" +
            "**2️⃣ Không tự ý làm quản trị viên:** Hãy để staff xử lý tình huống.\n" +
            "**3️⃣ Có vấn đề? Nhắn riêng cho staff để được hỗ trợ.**"
        )
};

module.exports = ruleEmbeds;
