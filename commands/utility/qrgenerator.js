/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const qr = require('qrcode');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrgenerator')
        .setDescription(lang.generateQRDescription)
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text to encode into QR code')
                .setRequired(true)),

    async execute(interaction) {
       
    if (interaction.isCommand && interaction.isCommand()) {
        try {
            let textToEncode;

            if (interaction.isCommand && interaction.isCommand()) {
                textToEncode = interaction.options.getString('text');
            } else {
                const args = interaction.content.split(' ');
                args.shift(); 
                textToEncode = args.join(' ');
            }

            const qrCodeBuffer = await qr.toBuffer(textToEncode, { width: 500, height: 500 });
            const attachment = new AttachmentBuilder(qrCodeBuffer, { name: 'qrcode.png' });

            await interaction.reply({ files: [attachment] });
        } catch (error) {
            //console.error('Error generating QR code:', error);
            await interaction.reply(lang.generateQRFailed);
        }
    } else {
        const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon ,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/generateqr`')
        .setTimestamp();
    
        await interaction.reply({ embeds: [embed] });
    
        }  
    },
};
