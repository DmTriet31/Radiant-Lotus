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


const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { countingCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-counting')
        .setDescription('Manage the counting game for your server.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)

        .addSubcommand(sub =>
            sub.setName('channel')
                .setDescription('Set a counting channel.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select the channel for the counting game.')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable counting.')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the current count.')
        )

        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit the counting channel.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select a new counting channel.')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('update')
                .setDescription('Manually update the current count.')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Set the current count.')
                        .setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
        const guildId = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'channel') {
            const channel = interaction.options.getChannel('channel');
            const status = interaction.options.getBoolean('status');

            await countingCollection.updateOne(
                { guildId },
                { $set: { channelId: channel.id, status, currentCount: 0 } },
                { upsert: true }
            );

            return interaction.reply(`✅ Counting game is now **${status ? 'enabled' : 'disabled'}** in <#${channel.id}>.`);
        }

        if (subcommand === 'view') {
            const countingData = await countingCollection.findOne({ guildId });

            if (!countingData || !countingData.status) {
                return interaction.reply('ℹ️ Counting game is not set up for this server.');
            }

            return interaction.reply(`📊 **Current count:** ${countingData.currentCount}`);
        }

        if (subcommand === 'edit') {
            const newChannel = interaction.options.getChannel('channel');

            const countingData = await countingCollection.findOne({ guildId });
            if (!countingData) {
                return interaction.reply('❌ No counting game set up. Use `/setup-counting channel` first.');
            }

            await countingCollection.updateOne(
                { guildId },
                { $set: { channelId: newChannel.id } }
            );

            return interaction.reply(`✅ Counting game channel changed to <#${newChannel.id}>.`);
        }

        if (subcommand === 'update') {
            const newCount = interaction.options.getInteger('count');

            const countingData = await countingCollection.findOne({ guildId });
            if (!countingData) {
                return interaction.reply('❌ No counting game set up. Use `/setup-counting channel` first.');
            }

            await countingCollection.updateOne(
                { guildId },
                { $set: { currentCount: newCount } }
            );

            return interaction.reply(`✅ Counting game count updated to **${newCount}**.`);
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-counting`')
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
