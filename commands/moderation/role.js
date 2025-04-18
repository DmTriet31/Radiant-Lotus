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
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage roles in the server.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to give the role to.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to be added.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove the role from.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to be removed.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role with predefined settings.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of role (moderator, staff, friendly).')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Moderator', value: 'moderator' },
                            { name: 'Staff', value: 'staff' },
                            { name: 'Friendly', value: 'friendly' }
                        ))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the new role.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('(hex format or names: red, blue, green, pink, purple, cyan..).')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about a role.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to get information about.')
                        .setRequired(true))),
    
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ You do not have permission to manage roles.');
            return interaction.reply({ embeds: [embed],  flags: 64 });
        }

        if (subcommand === 'add') {
            // Add Role
            const target = interaction.options.getUser('target');
            const role = interaction.options.getRole('role');
            const member = interaction.guild.members.cache.get(target.id);

            if (member.roles.cache.has(role.id)) {
                return interaction.reply({ content: `⚠️ ${target.tag} already has the **${role.name}** role.`,  flags: 64 });
            }

            await member.roles.add(role);
            await interaction.reply({ content: `✅ Added **${role.name}** role to ${target.tag}.` });

        } else if (subcommand === 'remove') {
            // Remove Role
            const target = interaction.options.getUser('target');
            const role = interaction.options.getRole('role');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({ content: `⚠️ ${target.tag} does not have the **${role.name}** role.`,  flags: 64 });
            }

            await member.roles.remove(role);
            await interaction.reply({ content: `✅ Removed **${role.name}** role from ${target.tag}.` });

        } else if (subcommand === 'create') {
            // Create Role
            const roleType = interaction.options.getString('type');
            const roleName = interaction.options.getString('name');
            let roleColor = interaction.options.getString('color');

            const colorOptions = {
                red: '#FF0000',
                blue: '#0000FF',
                green: '#008000',
                yellow: '#FFFF00',
                purple: '#800080',
                orange: '#FFA500',
                cyan: '#00FFFF',
                pink: '#FFC0CB',
                white: '#FFFFFF',
                black: '#000000'
            };

            if (colorOptions[roleColor.toLowerCase()]) {
                roleColor = colorOptions[roleColor.toLowerCase()];
            } else if (!/^#([0-9A-F]{3}){1,2}$/i.test(roleColor)) {
                return interaction.reply({ content: '⚠️ Invalid color. Use a hex code or a valid color name.',  flags: 64 });
            }

            let rolePermissions = [];
            if (roleType === 'moderator') {
                rolePermissions = [
                    PermissionFlagsBits.KickMembers,
                    PermissionFlagsBits.BanMembers,
                    PermissionFlagsBits.ModerateMembers
                ];
            } else if (roleType === 'staff') {
                rolePermissions = [
                    PermissionFlagsBits.ModerateMembers
                ];
            }

            const role = await interaction.guild.roles.create({
                name: roleName,
                color: roleColor,
                permissions: rolePermissions,
                reason: `Created by ${interaction.user.tag} using /role create`
            });

            await interaction.reply({ content: `✅ Created **${role.name}** role with type **${roleType}**.` });

        } else if (subcommand === 'info') {
            // Role Info
            const role = interaction.options.getRole('role');

            const embed = new EmbedBuilder()
                .setColor(role.color || '#3498db')
                .setTitle(`Role Info: ${role.name}`)
                .addFields(
                    { name: '🆔 Role ID', value: role.id, inline: true },
                    { name: '🎨 Color', value: role.hexColor, inline: true },
                    { name: '👥 Members', value: `${role.members.size}`, inline: true },
                    { name: '🔒 Permissions', value: role.permissions.toArray().join(', ') || 'None' },
                    { name: '📅 Created On', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/role`')
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

