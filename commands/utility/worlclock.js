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

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('worldclock')
        .setDescription('🌍 View world times by continent with pagination.'),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();

        const timeZones = {
            "🌍 **Europe**": [
                { name: "London, UK 🇬🇧", tz: "Europe/London", offset: "GMT+0 / GMT+1" },
                { name: "Berlin, Germany 🇩🇪", tz: "Europe/Berlin", offset: "GMT+1 / GMT+2" },
                { name: "Paris, France 🇫🇷", tz: "Europe/Paris", offset: "GMT+1 / GMT+2" },
                { name: "Madrid, Spain 🇪🇸", tz: "Europe/Madrid", offset: "GMT+1 / GMT+2" },
                { name: "Moscow, Russia 🇷🇺", tz: "Europe/Moscow", offset: "GMT+3" },
                { name: "Rome, Italy 🇮🇹", tz: "Europe/Rome", offset: "GMT+1 / GMT+2" }
            ],
            "🌎 **Americas**": [
                { name: "New York, USA 🇺🇸", tz: "America/New_York", offset: "GMT-5" },
                { name: "Los Angeles, USA 🇺🇸", tz: "America/Los_Angeles", offset: "GMT-8" },
                { name: "Mexico City, Mexico 🇲🇽", tz: "America/Mexico_City", offset: "GMT-6" },
                { name: "São Paulo, Brazil 🇧🇷", tz: "America/Sao_Paulo", offset: "GMT-3" },
                { name: "Toronto, Canada 🇨🇦", tz: "America/Toronto", offset: "GMT-5" },
                { name: "Buenos Aires, Argentina 🇦🇷", tz: "America/Argentina/Buenos_Aires", offset: "GMT-3" }
            ],
            "🌏 **Asia**": [
                { name: "Beijing, China 🇨🇳", tz: "Asia/Shanghai", offset: "GMT+8" },
                { name: "Tokyo, Japan 🇯🇵", tz: "Asia/Tokyo", offset: "GMT+9" },
                { name: "Seoul, South Korea 🇰🇷", tz: "Asia/Seoul", offset: "GMT+9" },
                { name: "Mumbai, India 🇮🇳", tz: "Asia/Kolkata", offset: "GMT+5:30" },
                { name: "Jakarta, Indonesia 🇮🇩", tz: "Asia/Jakarta", offset: "GMT+7" },
                { name: "Bangkok, Thailand 🇹🇭", tz: "Asia/Bangkok", offset: "GMT+7" }
            ],
            "🌍 **Australia & Pacific**": [
                { name: "Sydney, Australia 🇦🇺", tz: "Australia/Sydney", offset: "GMT+11" },
                { name: "Melbourne, Australia 🇦🇺", tz: "Australia/Melbourne", offset: "GMT+11" },
                { name: "Perth, Australia 🇦🇺", tz: "Australia/Perth", offset: "GMT+8" },
                { name: "Auckland, New Zealand 🇳🇿", tz: "Pacific/Auckland", offset: "GMT+13" },
                { name: "Fiji 🇫🇯", tz: "Pacific/Fiji", offset: "GMT+12" },
                { name: "Honolulu, Hawaii 🇺🇸", tz: "Pacific/Honolulu", offset: "GMT-10" }
            ],
            "🌍 **Middle East & Africa**": [
                { name: "Dubai, UAE 🇦🇪", tz: "Asia/Dubai", offset: "GMT+4" },
                { name: "Riyadh, Saudi Arabia 🇸🇦", tz: "Asia/Riyadh", offset: "GMT+3" },
                { name: "Istanbul, Turkey 🇹🇷", tz: "Europe/Istanbul", offset: "GMT+3" },
                { name: "Cape Town, South Africa 🇿🇦", tz: "Africa/Johannesburg", offset: "GMT+2" },
                { name: "Cairo, Egypt 🇪🇬", tz: "Africa/Cairo", offset: "GMT+2" },
                { name: "Nairobi, Kenya 🇰🇪", tz: "Africa/Nairobi", offset: "GMT+3" }
            ]
        };

        const getCurrentTimes = (region) => {
            return region.map(place => `🕰️ **${place.name}**\n🕒 ${new Date().toLocaleString("en-US", { timeZone: place.tz })} (${place.offset})`).join("\n\n");
        };

        const regions = Object.keys(timeZones);
        let currentPage = 0;

        const generateEmbed = (page) => {
            const region = regions[page];
            return new EmbedBuilder()
                .setTitle(`🌍 World Clock - ${region}`)
                .setColor('#3498db')
                .setDescription(getCurrentTimes(timeZones[region]))
                .setFooter({ text: `Page ${page + 1} of ${regions.length}` })
                .setTimestamp();
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⏪ Previous').setStyle(ButtonStyle.Primary).setDisabled(true),
            new ButtonBuilder().setCustomId('next').setLabel('⏩ Next').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('refresh').setLabel('🔄 Refresh').setStyle(ButtonStyle.Success)
        );

        const message = await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [row] });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: "❌ You can't interact with this button!", flags: 64 });
            }

            if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'prev') {
                currentPage--;
            } else if (i.customId === 'refresh') {
                return i.update({ embeds: [generateEmbed(currentPage)] });
            }

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === regions.length - 1);

            await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
        });

        collector.on('end', async () => {
            try {
                row.components.forEach(button => button.setDisabled(true));
                await message.edit({ components: [row] });
            } catch (err) {
                console.error('Error disabling buttons:', err);
            }
        });
        
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/worldclock`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
    
};

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
