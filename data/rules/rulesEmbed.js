const { EmbedBuilder } = require("discord.js");

const ruleEmbeds = {
    spam: new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚫 Quy Tắc Spam")
        .setDescription(
            "**1️⃣ Không gửi quá nhiều tin nhắn:** Tránh gửi quá nhiều tin nhắn trong thời gian ngắn.\n" +
            "**2️⃣ Không spam biểu tượng cảm xúc:** Không làm ngập chat bằng emoji hoặc sticker.\n" +
            "**3️⃣ Không spam phản ứng:** Việc thêm/xoá phản ứng liên tục là gây rối.\n" +
            "**4️⃣ Không dùng văn bản lặp lại:** Không được gửi các đoạn văn bản dài và lặp đi lặp lại.\n" +
            "**5️⃣ Không spam quảng cáo:** Không được quảng bá nội dung cá nhân một cách quá mức."
        ),

    nsfw: new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle("🔞 Quy Tắc Nội Dung Nhạy Cảm (NSFW)")
        .setDescription(
            "**1️⃣ Cấm nội dung NSFW:** Bao gồm hình ảnh, văn bản hoặc liên kết.\n" +
            "**2️⃣ Không đùa cợt hay thảo luận không phù hợp:** Hãy giữ nội dung sạch sẽ.\n" +
            "**3️⃣ Cấm quấy rối tình dục:** Không được đưa ra những lời lẽ gợi dục hoặc khiếm nhã.\n" +
            "**4️⃣ Cấm đóng vai người lớn:** Máy chủ này không dành cho người trên 18 tuổi."
        ),

    discord_terms: new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📜 Điều Khoản & Điều Kiện của Discord")
        .setDescription(
            "**1️⃣ Tuân thủ [Điều khoản dịch vụ của Discord](https://discord.com/terms)**.\n" +
            "**2️⃣ Tuân thủ [Nguyên tắc cộng đồng của Discord](https://discord.com/guidelines)**.\n" +
            "**3️⃣ Không sử dụng bot, hack hoặc lỗ hổng trái phép.**\n" +
            "**4️⃣ Không tham gia vào các hành vi lừa đảo, giả mạo hoặc lừa gạt.**"
        ),

    harassment: new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🚷 Quy Tắc Quấy Rối")
        .setDescription(
            "**1️⃣ Cấm công kích cá nhân:** Không được xúc phạm hoặc nhắm vào người khác.\n" +
            "**2️⃣ Cấm phát ngôn thù ghét:** Chủ nghĩa phân biệt chủng tộc, giới tính, LGBT+ hay bất kỳ sự kỳ thị nào đều bị cấm.\n" +
            "**3️⃣ Không đe dọa hoặc doxing:** Việc đe dọa hay chia sẻ thông tin cá nhân là vi phạm nghiêm trọng.\n" +
            "**4️⃣ Cấm troll quá mức:** Đùa vui nhẹ nhàng thì được, nhưng gây rối thì không."
        ),

    links: new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🔗 Quy Tắc Về Liên Kết")
        .setDescription(
            "**1️⃣ Không đăng liên kết độc hại:** Bao gồm phần mềm độc hại, lừa đảo hoặc nội dung NSFW.\n" +
            "**2️⃣ Không tự quảng cáo ngoài các kênh dành riêng:** Chỉ quảng cáo ở nơi được phép.\n" +
            "**3️⃣ Không chia sẻ liên kết rút gọn, IP grabber hoặc theo dõi:** Chỉ chia sẻ liên kết an toàn, rõ ràng."
        ),

    images: new EmbedBuilder()
        .setColor("#FF00FF")
        .setTitle("🖼️ Quy Tắc Hình Ảnh")
        .setDescription(
            "**1️⃣ Cấm hình ảnh NSFW hoặc khiêu dâm:** Đây là môi trường an toàn.\n" +
            "**2️⃣ Cấm hình ảnh bạo lực hoặc máu me:** Giữ nội dung phù hợp.\n" +
            "**3️⃣ Không spam meme:** Chia sẻ meme một cách vừa phải.\n" +
            "**4️⃣ Cấm hình ảnh xúc phạm hoặc phân biệt đối xử.**"
        ),

    hacking: new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛑 Quy Tắc Hack")
        .setDescription(
            "**1️⃣ Không hack, gian lận hoặc khai thác lỗi:** Không được hack bot, máy chủ hoặc người dùng.\n" +
            "**2️⃣ Không chia sẻ lỗ hổng hoặc phần mềm không hợp lệ:** Cấm chia sẻ phần mềm trái phép.\n" +
            "**3️⃣ Không lừa đảo xã hội hoặc giả danh:** Cấm lừa người khác để lấy thông tin.\n" +
            "**4️⃣ Không dùng tài khoản phụ để né lệnh cấm hoặc giới hạn.**"
        ),

    mic_spam: new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("🎤 Quy Tắc Spam Mic")
        .setDescription(
            "**1️⃣ Không phát âm thanh lớn, méo tiếng hoặc gây khó chịu:** Không phá hoại voice chat.\n" +
            "**2️⃣ Không dùng biến đổi giọng nói hoặc soundboard:** Trừ khi được cho phép trong kênh cụ thể.\n" +
            "**3️⃣ Không phát nhạc qua mic:** Hãy dùng bot nhạc.\n" +
            "**4️⃣ Không hét to hoặc la hét quá mức.**"
        ),

    bot_usage: new EmbedBuilder()
        .setColor("#008000")
        .setTitle("🤖 Quy Tắc Sử Dụng Bot")
        .setDescription(
            "**1️⃣ Không lạm dụng lệnh bot:** Hãy sử dụng đúng cách.\n" +
            "**2️⃣ Không spam lệnh bot trong các kênh chính:** Dùng trong kênh dành cho bot.\n" +
            "**3️⃣ Không hack hoặc khai thác bot.**"
        ),

    trading_selling: new EmbedBuilder()
        .setColor("#8B4513")
        .setTitle("💰 Quy Tắc Giao Dịch & Bán Hàng")
        .setDescription(
            "**1️⃣ Cấm bán tài khoản, vật phẩm hoặc dịch vụ:** Đây không phải là chợ.\n" +
            "**2️⃣ Cấm giao dịch hoặc đánh bạc:** Hãy dùng các nền tảng đáng tin cậy.\n" +
            "**3️⃣ Cấm quảng bá doanh nghiệp cá nhân nếu không có sự cho phép.**"
        ),

    rule: new EmbedBuilder()
        .setColor("#4682B4")
        .setTitle("🗣️ Quy Tắc Ngôn Ngữ")
        .setDescription(
            "**1️⃣ Chỉ dùng tiếng Việt trong các kênh chung:** Các ngôn ngữ khác có kênh riêng.\n" +
            "**2️⃣ Không chửi thề quá mức:** Hãy giữ bầu không khí thân thiện.\n" +
            "**3️⃣ Cấm ngôn từ xúc phạm, miệt thị.**"
        ),

    spoilers: new EmbedBuilder()
        .setColor("#A52A2A")
        .setTitle("🎥 Quy Tắc Spoiler")
        .setDescription(
            "**1️⃣ Dùng thẻ spoiler cho nội dung tiết lộ:** Ví dụ: `||spoiler here||`.\n" +
            "**2️⃣ Không đăng spoiler ngoài các kênh chuyên về spoiler.**"
        ),

    self_promotion: new EmbedBuilder()
        .setColor("#9370DB")
        .setTitle("📢 Quy Tắc Tự Quảng Bá")
        .setDescription(
            "**1️⃣ Không tự quảng bá ngoài các kênh dành riêng.**\n" +
            "**2️⃣ Cấm quảng cáo qua tin nhắn riêng:** Không gửi link không mong muốn cho người khác.\n" +
            "**3️⃣ Không xin xỏ theo dõi, đăng ký hay quyên góp.**"
        ),

    moderation: new EmbedBuilder()
        .setColor("#228B22")
        .setTitle("⚖️ Quy Tắc Quản Trị")
        .setDescription(
            "**1️⃣ Tôn trọng các quản trị viên và quyết định của họ.**\n" +
            "**2️⃣ Không tự ý can thiệp vào quản trị:** Hãy để staff xử lý vấn đề.\n" +
            "**3️⃣ Nếu có thắc mắc, hãy nhắn riêng cho staff.**"
        )
};

module.exports = ruleEmbeds;
