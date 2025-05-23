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

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { anticonfigcollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-anticonfig')
        .setDescription('Configure anti-config settings')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add settings')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of setting to add')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Whitelisted Anti-Link Channels', value: 'whitelisted_antilink_channels' },
                            { name: 'Whitelisted Anti-Link Link Types', value: 'whitelisted_antilink_types' },
                            { name: 'Whitelisted Anti-Spam Channels', value: 'whitelisted_antispam_channels' },
                            { name: 'Blocked Words for Anti-Spam', value: 'blocked_words' }
                        ))
                .addStringOption(option =>
                    option.setName('values')
                        .setDescription('Comma-separated list of values to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View settings')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of setting to view')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Whitelisted Anti-Link Channels', value: 'whitelisted_antilink_channels' },
                            { name: 'Whitelisted Anti-Link Link Types', value: 'whitelisted_antilink_types' },
                            { name: 'Whitelisted Anti-Spam Channels', value: 'whitelisted_antispam_channels' },
                            { name: 'Blocked Words for Anti-Spam', value: 'blocked_words' }
                        ))),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
        const subcommand = interaction.options.getSubcommand();
        const type = interaction.options.getString('type');
        const values = interaction.options.getString('values')?.split(',').map(v => v.trim()) || [];
        
        const guildId = interaction.guild.id;

        if (subcommand === 'add') {
            if (!['whitelisted_antilink_channels', 'whitelisted_antilink_types', 'whitelisted_antispam_channels', 'blocked_words'].includes(type)) {
                return interaction.reply({ content: 'Invalid type.', flags: 64 });
            }

            const existingData = await anticonfigcollection.findOne({ serverId: guildId });
            const updatedValues = existingData && existingData[type] ? [...new Set([...existingData[type], ...values])] : values;

            await anticonfigcollection.updateOne(
                { serverId: guildId },
                { $set: { [type]: updatedValues } },
                { upsert: true }
            );

            return interaction.reply({ content: `Settings updated for ${type}.`, flags: 64 });
        }

        if (subcommand === 'view') {
            const data = await anticonfigcollection.findOne({ serverId: guildId });

            if (!data || !data[type]) {
                return interaction.reply({ content: `No settings found for ${type}.`, flags: 64 });
            }

            return interaction.reply({ content: `**${type.replace(/_/g, ' ')}:**\n${data[type].join(', ')}`, flags: 64 });
        }

    } else {
        const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon ,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/setup-anticonfig`')
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
