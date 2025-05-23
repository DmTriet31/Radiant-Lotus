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
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
} = require('discord.js');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');
function chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription(lang.serverInfoDescription)
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show detailed server information with pagination.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription('Show the server icon.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('Show the server banner.')
        ),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();

        const server = interaction.guild;
        if (!server) return interaction.editReply(lang.serverInfoError);

        // Check which subcommand was used
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'info') {
            try {
                const owner = await server.fetchOwner();
                const emojis = server.emojis.cache;
                const roles = server.roles.cache.filter(role => role.id !== server.id);
                const channels = server.channels.cache;
        
                const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
                const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
                const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
                const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
                const totalChannels = textChannels + voiceChannels + stageChannels + categories;
        
                const boostCount = server.premiumSubscriptionCount || 0;
                const boostLevel = server.premiumTier || 0;
        
                // === PAGE 1: Basic Server Info ===
                const baseEmbed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setAuthor({ name: 'Server Info', iconURL: server.iconURL({ dynamic: true }) })
                    .setThumbnail(server.iconURL({ dynamic: true, size: 1024 }))
                    .addFields([
                        { name: '📛 Server Name', value: `\`${server.name}\``, inline: true },
                        { name: '👑 Owner', value: `<@${owner.id}>`, inline: true },
                        { name: '🆔 Server ID', value: `\`${server.id}\``, inline: true },
                        { name: '👥 Members', value: `\`${server.memberCount}\``, inline: true },
                        { name: '🤖 Bots', value: `\`${server.members.cache.filter(m => m.user.bot).size}\``, inline: true },
                        { name: '🚀 Boosts', value: `\`${boostCount} (Level ${boostLevel})\``, inline: true },
                        { name: '📂 Categories', value: `\`${categories}\``, inline: true },
                        { name: '💬 Text Channels', value: `\`${textChannels}\``, inline: true },
                        { name: '🔊 Voice Channels', value: `\`${voiceChannels}\``, inline: true },
                        { name: '🎭 Roles', value: `\`${roles.size}\``, inline: true },
                        { name: '😀 Emojis', value: `\`${emojis.size}\``, inline: true },
                        { name: '🆕 Created On', value: `<t:${Math.floor(server.createdTimestamp / 1000)}:F>`, inline: false },
                    ])
                    .setTimestamp();
        
                // === PAGE 2: Roles ===
                const roleEmbed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle('🎭 Roles')
                    .setDescription(roles.size > 0 ? roles.map(role => `<@&${role.id}>`).join(', ') : 'No roles available.');
        
                // === PAGE 3+: Emojis, Chunked in 25s ===
                const emojiChunks = chunkArray(emojis.map(e => e.toString()), 25);
                const emojiEmbeds = emojiChunks.map((chunk, i) =>
                    new EmbedBuilder()
                        .setColor('#FFFFFF')
                        .setTitle(`😀 Emojis (Page ${i + 1})`)
                        .setDescription(chunk.join(' '))
                );
        
                // Combine all pages
                const embeds = [baseEmbed, roleEmbed, ...emojiEmbeds];
        
                // Buttons
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('previous').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
                );
        
                let currentPage = 0;
                await interaction.editReply({ embeds: [embeds[currentPage]], components: [row] });
        
                const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        
                collector.on('collect', async i => {
                    if (i.customId === 'previous') currentPage--;
                    if (i.customId === 'next') currentPage++;
        
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === embeds.length - 1);
        
                    await i.update({ embeds: [embeds[currentPage]], components: [row] });
                });
        
                collector.on('end', async () => {
                    try {
                        await interaction.editReply({ components: [] });
                    } catch (err) {
                        console.error('Failed to remove buttons after collector ended:', err);
                    }
                });
        
            } catch (error) {
                console.error('Error fetching server information:', error);
                return interaction.editReply({ content: '❌ Error fetching server information.' });
            }
        }
        else if (subcommand === 'icon') {
            // Create an embed with the server icon
            const iconURL = server.iconURL({ format: 'png', dynamic: true, size: 1024 });
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(lang.serverIconTitle)
                .setImage(iconURL)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } 
        else if (subcommand === 'banner') {
            // Create an embed with the server banner (if available)
            const bannerURL = server.bannerURL({ format: 'png', dynamic: true, size: 1024 });
            if (!bannerURL) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(lang.serverNoBanner);
                return await interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(lang.serverBannerTitle)
                .setImage(bannerURL)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash command!\n- Please use `/server`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } 
    },
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
