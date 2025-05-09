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
const { autoroleCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-autorole')
        .setDescription('Set or view the auto-role for a server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        // Subcommand for setting the auto-role configuration
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Configure the auto-role for the server')
                .addStringOption(option =>
                    option.setName('serverid')
                        .setDescription('The ID of the server')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('roleid')
                        .setDescription('The ID of the role to be assigned')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('The status of the auto-role')
                        .setRequired(true))
        )
        // Subcommand for viewing the auto-role configuration
        .addSubcommand(sub =>
            sub
                .setName('view')
                .setDescription('View the auto-role configuration for the server')
                .addStringOption(option =>
                    option.setName('serverid')
                        .setDescription('The ID of the server')
                        .setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const subcommand = interaction.options.getSubcommand();
      
            const serverIdInput = interaction.options.getString('serverid');

            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
            if (serverIdInput !== guild.id) {
                return interaction.reply({
                    content: 'The server ID provided does not match the server ID of this server.',
                    flags: 64
                });
            }

            if (subcommand === 'set') {
                // Check if the user has permission to manage channels.
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('You do not have permission to use this command.');
                    return interaction.reply({ embeds: [embed], flags: 64 });
                }

                const roleId = interaction.options.getString('roleid');
                const status = interaction.options.getBoolean('status');

                // Optional: Additional input validation.
                if (!serverIdInput || !roleId || status === null) {
                    return interaction.reply({
                        content: 'Invalid input. Please provide valid server ID, role ID, and status.',
                        flags: 64
                    });
                }

                // Retrieve the server owner ID.
                const serverOwnerId = guild.ownerId;
                const memberId = interaction.user.id;
                const storedConfig = await autoroleCollection.findOne({ serverId: serverIdInput });
                const designatedOwnerId = storedConfig?.ownerId;

                // Only allow the server owner or designated owner to configure.
                if (memberId !== serverOwnerId && memberId !== designatedOwnerId) {
                    return interaction.reply({
                        content: 'Only the server owner or specified owners can use this command.',
                        flags: 64
                    });
                }

                await autoroleCollection.updateOne(
                    { serverId: serverIdInput },
                    {
                        $set: {
                            serverId: serverIdInput,
                            roleId,
                            status,
                            ownerId: serverOwnerId
                        }
                    },
                    { upsert: true }
                );

                return interaction.reply({
                    content: `Auto-role updated successfully for server ID ${serverIdInput}.`,
                    flags: 64
                });
            } else if (subcommand === 'view') {
                // View the current auto-role configuration.
                const configData = await autoroleCollection.findOne({ serverId: serverIdInput });
                let description;
                if (configData) {
                    description = `**Status:** ${configData.status ? 'Enabled' : 'Disabled'}\n**Role ID:** ${configData.roleId}\n**Owner ID:** ${configData.ownerId}`;
                } else {
                    description = 'No auto-role configuration found for this server. Please set it up using `/setautorole set`.';
                }

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Auto-Role Configuration')
                    .setDescription(description)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
        } else {
            // If not used as a slash command, alert the user.
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "Alert!", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-autorole`')
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
