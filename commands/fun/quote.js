const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath('../../UI/fonts/inter-bold.ttf', 'Inter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Create a custom quote image and post it')
        .addStringOption(opt =>
            opt.setName('text')
                .setDescription('Quote text')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('author')
                .setDescription('Author of the quote')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('image')
                .setDescription('Background image URL')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('createdby')
                .setDescription('Who created this?')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const quoteText = interaction.options.getString('text');
        const author = interaction.options.getString('author');
        const bgUrl = interaction.options.getString('image');
        const createdBy = interaction.options.getString('createdby') || interaction.user.username;

        const width = 800;
        const height = 450;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        try {
            const res = await fetch(bgUrl);
            if (!res.ok) throw new Error('Image load failed');
            const buffer = Buffer.from(await res.arrayBuffer());
            const bgImage = await loadImage(buffer);

            // Draw background
            ctx.drawImage(bgImage, 0, 0, width, height);

            // Overlay for readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, width, height);

            // Stylized Quote Text (wrapped in quotation marks)
            ctx.fillStyle = 'white';
            ctx.font = '32px Inter';
            ctx.textAlign = 'center';
            wrapText(ctx, `“${quoteText}”`, width / 2, height / 2 - 60, 700, 38);

            // Author (italic)
            ctx.font = 'italic 22px Inter';
            ctx.fillText(`— ${author}`, width / 2, height / 2 + 80);

            // Created By (bottom right)
            ctx.font = '14px Inter';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'lightgray';
            ctx.fillText(`Created by ${createdBy}`, width - 20, height - 20);

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'quote.png' });
            await interaction.editReply({ files: [attachment] });

        } catch (err) {
            console.error(err);
            return interaction.editReply({ content: '❌ Failed to create quote image. Make sure the image URL is valid.' });
        }
    }
};

// Word-wrap helper
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}
