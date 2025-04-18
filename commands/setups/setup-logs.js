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

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { logsCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-logs')
        .setDescription('Configure server logging channels for specific or all events.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('event')
                .setDescription('Set a logging channel for a specific event.')
                .addStringOption(option =>
                    option.setName('event')
                        .setDescription('The event to log.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Message Deleted', value: 'messageDelete' },
                            { name: 'Message Updated', value: 'messageUpdate' },
                            { name: 'Member Joined', value: 'memberJoin' },
                            { name: 'Member Left', value: 'memberLeave' },
                            { name: 'Role Created', value: 'roleCreate' },
                            { name: 'Role Deleted', value: 'roleDelete' },
                            { name: 'Member Banned', value: 'memberBan' },
                            { name: 'Member Unbanned', value: 'memberUnban' },
                            { name: 'Voice Channel Joined', value: 'voiceJoin' },
                            { name: 'Voice Channel Left', value: 'voiceLeave' },
                            { name: 'Channel Created', value: 'channelCreate' },
                            { name: 'Channel Deleted', value: 'channelDelete' },
                            { name: 'Role Assigned to User', value: 'roleAssigned' },
                            { name: 'Role Removed from User', value: 'roleRemoved' },
                            { name: 'Nickname Changed', value: 'nicknameChange' },
                            { name: 'Moderation Logs', value: 'moderationLogs' },
                        ))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to log the event in.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Set a logging channel for all events.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to log all events in.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View all configured logging channels.')),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('You do not have permission to use this command.');
                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'event') {
            const eventType = interaction.options.getString('event');
            const channel = interaction.options.getChannel('channel');

            if (!channel.isTextBased()) {
                return interaction.reply({ content: 'Please select a text-based channel.', flags: 64 });
            }

            await logsCollection.updateOne(
                { guildId, eventType },
                { $set: { channelId: channel.id } },
                { upsert: true }
            );

            return interaction.reply({
                content: `Logs for **${eventType}** will now be sent to <#${channel.id}>.`,
                flags: 64,
            });
        }

        if (subcommand === 'all') {
            const channel = interaction.options.getChannel('channel');

            if (!channel.isTextBased()) {
                return interaction.reply({ content: 'Please select a text-based channel.', flags: 64 });
            }

            const eventTypes = [
                'messageDelete', 'messageUpdate', 'memberJoin', 'memberLeave',
                'roleCreate', 'roleDelete', 'memberBan', 'memberUnban',
                'voiceJoin', 'voiceLeave', 'channelCreate', 'channelDelete',
                'roleAssigned', 'roleRemoved', 'nicknameChange', 'moderationLogs',
            ];

            await Promise.all(
                eventTypes.map(eventType =>
                    logsCollection.updateOne(
                        { guildId, eventType },
                        { $set: { channelId: channel.id } },
                        { upsert: true }
                    )
                )
            );

            return interaction.reply({
                content: `Logs for all events will now be sent to <#${channel.id}>.`,
                flags: 64,
            });
        }

        if (subcommand === 'view') {
            const configs = await logsCollection.find({ guildId }).toArray();

            if (configs.length === 0) {
                return interaction.reply({ content: 'No logging channels have been configured yet.', flags: 64 });
            }

            const embed = new EmbedBuilder()
                .setTitle('Configured Logging Channels')
                .setColor('#00FFFF');

            configs.forEach(config => {
                embed.addFields({
                    name: config.eventType,
                    value: `<#${config.channelId}>`,
                    inline: true,
                });
            });

            return interaction.reply({ embeds: [embed], flags: 64 });
        }

    } else {
        const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon ,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/setup-logs`')
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
