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
const { serverLevelingLogsCollection } = require('../../mongodb');
const checkPermissions = require('../../utils/checkPermissions');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-leveling')
        .setDescription('Manage leveling settings for the server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Enable or disable leveling and set a log channel')
                .addStringOption(option =>
                    option.setName('channelid')
                        .setDescription('The ID of the leveling logs channel')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable leveling')
                        .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the current leveling configuration')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
      const guild = interaction.guild;
      const serverId = interaction.guild.id;
      if (!await checkPermissions(interaction)) return;
        const subcommand = interaction.options.getSubcommand();
 

        if (subcommand === 'set') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('You do not have permission to use this command.')], flags: 64 });
            }

            const channelId = interaction.options.getString('channelid');
            const enabled = interaction.options.getBoolean('enabled');

            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({ content: 'Invalid channel ID. Please provide a valid channel ID from this server.', flags: 64 });
            }

            try {
                await serverLevelingLogsCollection.updateOne(
                    { serverId },
                    { $set: { levelLogsChannelId: channelId, levelingEnabled: enabled } },
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setColor(enabled ? '#00ff00' : '#ff0000')
                    .setDescription(`Leveling has been **${enabled ? 'enabled' : 'disabled'}**.\nLogs will be sent to <#${channelId}>.`);
                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error setting leveling:', error);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('An error occurred while setting the leveling settings.')], flags: 64 });
            }
        } else if (subcommand === 'view') {
            try {
                const configData = await serverLevelingLogsCollection.findOne({ serverId });

                if (!configData) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('No leveling configuration found for this server.')], flags: 64 });
                }

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Leveling Configuration')
                    .setDescription(`**Status:** ${configData.levelingEnabled ? '✅ Enabled' : '❌ Disabled'}\n**Log Channel:** ${configData.levelLogsChannelId ? `<#${configData.levelLogsChannelId}>` : 'Not Set'}`)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching leveling settings:', error);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('An error occurred while fetching the leveling settings.')], flags: 64 });
            }
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-leveling`')
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
