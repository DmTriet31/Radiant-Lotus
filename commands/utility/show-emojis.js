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

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show-emojis')
        .setDescription(lang.showemojisDescription)
        .addStringOption(option => 
            option.setName('filter')
                .setDescription('Filter emojis by name')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Type of emojis to show')
                .setRequired(false)
                .addChoices(
                    { name: 'Animated Only', value: 'animated' },
                    { name: 'Static Only', value: 'static' },
                    { name: 'All', value: 'all' }
                ))
        .addIntegerOption(option => 
            option.setName('page')
                .setDescription('Page number to display')
                .setRequired(false)
                .setMinValue(1)),
    
    async execute(interaction) {
        try {
            // Get options from command
            const filter = interaction.options.getString('filter')?.toLowerCase();
            const type = interaction.options.getString('type') || 'animated'; // Default to animated only
            const requestedPage = interaction.options.getInteger('page') || 1;
            
            // Get all emojis from client cache
            let allEmojis = interaction.client.emojis.cache.map(emoji => ({
                id: emoji.id,
                name: emoji.name,
                animated: emoji.animated,
                url: emoji.url,
                emoji: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
            }));

            // First filter by type (animated/static/all)
            if (type === 'animated') {
                allEmojis = allEmojis.filter(emoji => emoji.animated);
            } else if (type === 'static') {
                allEmojis = allEmojis.filter(emoji => !emoji.animated);
            }
            // 'all' shows everything, so no filter needed

            // Then apply name filter if provided
            if (filter) {
                allEmojis = allEmojis.filter(emoji => 
                    emoji.name.toLowerCase().includes(filter)
                );
            }

            // Check if we have any emojis matching our criteria
            if (allEmojis.length === 0) {
                const typeMessage = type === 'animated' ? 'animated' : 
                                   type === 'static' ? 'static' : '';
                                   
                return interaction.reply({ 
                    content: filter 
                        ? `No ${typeMessage} custom emojis found matching '${filter}'`
                        : `No ${typeMessage} custom emojis found`,
                    ephemeral: true 
                });
            }

            // Sort emojis alphabetically by name
            allEmojis.sort((a, b) => a.name.localeCompare(b.name));

            // Settings for pagination
            const pageSize = 24; // Show 24 emojis per page
            const totalPages = Math.ceil(allEmojis.length / pageSize);
            
            // Ensure requested page is within bounds
            const page = Math.min(Math.max(1, requestedPage), totalPages) - 1;
            
            const start = page * pageSize;
            const end = Math.min(start + pageSize, allEmojis.length);
            const displayEmojis = allEmojis.slice(start, end);

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`Discord Emojis (${type === 'animated' ? 'Animated' : type === 'static' ? 'Static' : 'All'})`)
                .setColor('#00B0F4')
                .setFooter({ 
                    text: `Page ${page + 1}/${totalPages} • Showing ${displayEmojis.length} of ${allEmojis.length} emojis` 
                })
                .setTimestamp();

            // Create description with rows of emojis
            // We'll create multiple fields to stay under the 1024 character limit
            const emojisPerField = 8; // 8 emojis per field should be safe
            
            for (let i = 0; i < displayEmojis.length; i += emojisPerField) {
                const fieldEmojis = displayEmojis.slice(i, i + emojisPerField);
                const fieldContent = fieldEmojis
                    .map(emoji => `${emoji.emoji} [\`${emoji.name}\`](${emoji.url})`)
                    .join(' ');
                
                embed.addFields({
                    name: i === 0 ? 'Emojis' : '\u200B', // First field gets a header, others get an invisible character
                    value: fieldContent,
                    inline: false
                });
            }

            // Add navigation instructions
            embed.addFields({
                name: 'Navigation',
                value: `• Use \`/showemojis page:[number]\` to view different pages\n` +
                       `• Use \`/showemojis type:[animated|static|all]\` to filter by type\n` +
                       `• Use \`/showemojis filter:[text]\` to search by name`,
                inline: false
            });

            // Send the embed
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error executing showemojis command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: lang.errorExecutingCommand, 
                    ephemeral: true 
                }).catch(() => {});
            }
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
