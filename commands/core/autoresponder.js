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

const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');
const { 
    createOrUpdateAutoResponder, 
    deleteAutoResponder, 
    getUserAutoResponders 
} = require('../../models/autoResponders');
const { autoResponderCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoresponder')
        .setDescription('🤖 Manage AutoResponders.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new AutoResponder.')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('The trigger word or phrase.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('channels')
                        .setDescription('Channel(s) (comma-separated IDs or "all").')
                        .setRequired(true))        
                .addStringOption(option =>
                    option.setName('match')
                        .setDescription('Match type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Exact Match', value: 'exact' },
                            { name: 'Partial Match', value: 'partial' },
                            { name: 'Whole Line Match', value: 'whole' }
                        ))        
                .addStringOption(option =>
                    option.setName('text_response')
                        .setDescription('Non-embed response (optional).')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('use_embed')
                        .setDescription('Use embed response? (true = embed, false = text)'))
                .addStringOption(option =>
                    option.setName('embed_title')
                        .setDescription('Embed title (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_color')
                        .setDescription('Embed color (Hex code, required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_description')
                        .setDescription('Embed description (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_footer')
                        .setDescription('Embed footer text (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_image')
                        .setDescription('Embed image URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_thumbnail')
                        .setDescription('Embed thumbnail URL (optional).')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable the AutoResponder.')))

        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an AutoResponder by index.')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The index number of the AutoResponder.')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View all AutoResponders you created.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        if (subcommand === 'set') {
            const trigger = interaction.options.getString('trigger').toLowerCase();
            const textResponse = interaction.options.getString('text_response') || null;
            const useEmbed = interaction.options.getBoolean('use_embed') || false;
            const matchType = interaction.options.getString('match');
            const channelInput = interaction.options.getString('channels');
            const status = interaction.options.getBoolean('status') || false;

            let channels = [];
            if (channelInput === 'all') {
                channels = ['all'];
            } else {
                channels = channelInput.split(',').map(id => id.trim()).filter(id => id.length > 0);
            }

            let embedData = null;
            if (useEmbed) {
                const embedTitle = interaction.options.getString('embed_title');
                const embedColor = interaction.options.getString('embed_color');
                const embedDescription = interaction.options.getString('embed_description');
                const embedFooter = interaction.options.getString('embed_footer') || null;
                const embedImage = interaction.options.getString('embed_image') || null;
                const embedThumbnail = interaction.options.getString('embed_thumbnail') || null;

                if (!embedTitle || !embedColor || !embedDescription) {
                    return interaction.editReply('⚠️ **Embeds must have `title`, `color`, and `description`!**');
                }

                embedData = {
                    title: embedTitle,
                    color: embedColor,
                    description: embedDescription,
                    footer: embedFooter,
                    image: embedImage,
                    thumbnail: embedThumbnail
                };
            }

            await createOrUpdateAutoResponder(userId, guildId, trigger, textResponse, embedData, matchType, channels, status);
            return interaction.editReply(`✅ AutoResponder for **"${trigger}"** has been set.`);
        }

        else if (subcommand === 'delete') {
            const index = interaction.options.getInteger('index') - 1;
            const wasDeleted = await deleteAutoResponder(userId, index);

            if (!wasDeleted) {
                return interaction.editReply(`❌ Invalid index or you don't have permission.`);
            }
            return interaction.editReply(`🗑️ AutoResponder **#${index + 1}** has been deleted.`);
        }

        else if (subcommand === 'view') {
            const autoResponders = await getUserAutoResponders(userId);
            if (autoResponders.length === 0) {
                return interaction.editReply(`❌ You have no AutoResponders.`);
            }

            const list = autoResponders
                .map((res, i) => `**#${i + 1}** | Trigger: \`${res.trigger}\` | Channels: ${res.channels.join(', ')} | Status: ${res.status ? '✅ Enabled' : '❌ Disabled'}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🤖 Your AutoResponders')
                .setDescription(list)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/autoresponder`')
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