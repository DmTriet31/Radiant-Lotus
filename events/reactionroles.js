const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const { reactionRolesCollection } = require('../mongodb');
const { DiscordAPIError } = require('discord.js');

module.exports = (client) => {
 
    client.on('interactionCreate', async (interaction) => {
        
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        const { customId, guild, user } = interaction;
        
        try {
            const member = await guild.members.fetch(user.id);
            
            if (interaction.isButton()) {
                
                if (customId.startsWith('reaction_role_')) {
                    const roleId = customId.split('reaction_role_')[1];
                    
                    const role = guild.roles.cache.get(roleId);
                    if (!role) {
                        return interaction.reply({ 
                            content: '❌ This role no longer exists.', 
                            ephemeral: true 
                        });
                    }
                    
                    if (!guild.members.me.permissions.has('ManageRoles')) {
                        return interaction.reply({ 
                            content: '❌ I don\'t have permission to manage roles.', 
                            ephemeral: true 
                        });
                    }
                    
                    if (role.position >= guild.members.me.roles.highest.position) {
                        return interaction.reply({ 
                            content: `❌ I can't manage the role **${role.name}** because it's positioned higher than or equal to my highest role.`, 
                            ephemeral: true 
                        });
                    }
                    
                    try {
                        if (member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            return interaction.reply({ 
                                content: `🗑️ Removed role **${role.name}**`, 
                                ephemeral: true 
                            });
                        } else {
                            await member.roles.add(role);
                            return interaction.reply({ 
                                content: `✅ Added role **${role.name}**`, 
                                ephemeral: true 
                            });
                        }
                    } catch (error) {
                        console.error('Error managing role:', error);
                        return interaction.reply({ 
                            content: `❌ Failed to toggle role **${role.name}**. Please contact an administrator.`, 
                            ephemeral: true 
                        });
                    }
                }
            }
            
            if (interaction.isStringSelectMenu()) {
                if (customId.startsWith('reaction_menu_')) {
                    const selectedValue = interaction.values[0];
                    
                    const reactionRole = await reactionRolesCollection.findOne({ 
                        roleId: selectedValue,
                        menuId: customId,
                        messageId: interaction.message.id
                    });
                    
                    if (!reactionRole) {
                        return interaction.reply({ 
                            content: '❌ This role selection is no longer valid.', 
                            ephemeral: true 
                        });
                    }
                    
                    const role = guild.roles.cache.get(selectedValue);
                    if (!role) {
                        return interaction.reply({ 
                            content: '❌ This role no longer exists.', 
                            ephemeral: true 
                        });
                    }
                    
                    if (!guild.members.me.permissions.has('ManageRoles')) {
                        return interaction.reply({ 
                            content: '❌ I don\'t have permission to manage roles.', 
                            ephemeral: true 
                        });
                    }
                    
                    if (role.position >= guild.members.me.roles.highest.position) {
                        return interaction.reply({ 
                            content: `❌ I can't manage the role **${role.name}** because it's positioned higher than or equal to my highest role.`, 
                            ephemeral: true 
                        });
                    }
                    
                    try {
                        if (member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            return interaction.reply({ 
                                content: `🗑️ Removed role **${role.name}**`, 
                                ephemeral: true 
                            });
                        } else {
                            await member.roles.add(role);
                            return interaction.reply({ 
                                content: `✅ Added role **${role.name}**`, 
                                ephemeral: true 
                            });
                        }
                    } catch (error) {
                        //console.error('Error managing role:', error);
                        return interaction.reply({ 
                            content: `❌ Failed to toggle role **${role.name}**. Please contact an administrator.`, 
                            ephemeral: true 
                        });
                    }
                }
            }
        } catch (err) {
            //console.error('Error in reaction role interaction:', err);
            
            if (err instanceof DiscordAPIError) {
                if (err.code === 50013) {
                    return interaction.reply({ 
                        content: '❌ I don\'t have the required permissions to manage roles.', 
                        ephemeral: true 
                    });
                }
            }
            
            return interaction.reply({ 
                content: '❌ An error occurred while managing the reaction role.', 
                ephemeral: true 
            });
        }
    });

  
    const rebuildReactionRoles = async () => {
        console.log('Setting up reaction role buttons and menus...');
        
        try {
            const reactionRoles = await reactionRolesCollection.find({}).toArray();
            
        
            const groupedByMessage = {};
            for (const rr of reactionRoles) {
                if (!groupedByMessage[rr.messageId]) {
                    groupedByMessage[rr.messageId] = [];
                }
                groupedByMessage[rr.messageId].push(rr);
            }
            
            
            for (const messageId in groupedByMessage) {
                const entries = groupedByMessage[messageId];
                const channelId = entries[0].channelId;
                
                try {
                    const channel = client.channels.cache.get(channelId);
                    if (!channel) {
                        console.log(`Skipping reaction roles for non-existing channel: ${channelId}`);
                        continue;
                    }
                    
                    let message;
                    try {
                        message = await channel.messages.fetch(messageId);
                    } catch (err) {
                        console.log(`Removing reaction roles for non-existing message: ${messageId}`);
                        await reactionRolesCollection.deleteMany({ messageId });
                        continue;
                    }
                    
                    const menuEntries = entries.filter(e => e.type === 'menu');
                    const buttonEntries = entries.filter(e => e.type === 'button');
                    const menuContainer = entries.find(e => e.type === 'menu_container');
                    
                    if (menuEntries.length > 0 || menuContainer) {
                        if (menuEntries.length > 0) {
                            const options = menuEntries.map(role => {
                                const option = {
                                    label: role.label || role.roleName,
                                    value: role.roleId,
                                    description: `Toggle the ${role.roleName} role`
                                };
                                
                                if (role.emoji) {
                                    if (role.emoji.unicode) {
                                        option.emoji = role.emoji.name;
                                    } else {
                                        option.emoji = { id: role.emoji.id, name: role.emoji.name };
                                    }
                                }
                                
                                return option;
                            });
                            
                            const menuId = menuEntries[0].menuId;
                            const placeholder = menuContainer?.placeholder || 'Select a role';
                            
                            const selectMenu = new StringSelectMenuBuilder()
                                .setCustomId(menuId)
                                .setPlaceholder(placeholder)
                                .setMinValues(1)
                                .setMaxValues(1)
                                .addOptions(options);
                            
                            const row = new ActionRowBuilder().addComponents(selectMenu);
                            
                            await message.edit({ components: [row] });
                        }
                    } else if (buttonEntries.length > 0) {
                    
                        const rows = [];
                        let currentRow = new ActionRowBuilder();
                        let buttonsInCurrentRow = 0;
                        
                        for (const entry of buttonEntries) {
                         
                            let style;
                            if (typeof entry.style === 'string') {
                               
                                const styleKey = entry.style.charAt(0).toUpperCase() + entry.style.slice(1).toLowerCase();
                                style = ButtonStyle[styleKey] ?? ButtonStyle.Secondary;
                            } else if (typeof entry.style === 'number') {
                                style = entry.style;
                            } else {
                                style = ButtonStyle.Secondary;
                            }
                            
                        
                            const button = new ButtonBuilder()
                                .setCustomId(entry.customId)
                                .setLabel(entry.label)
                                .setStyle(style);
                            
                        
                            if (entry.emoji) {
                                if (entry.emoji.unicode) {
                                    button.setEmoji(entry.emoji.name);
                                } else {
                                    button.setEmoji(entry.emoji.id);
                                }
                            }
                            
                       
                            if (buttonsInCurrentRow >= 5) {
                                rows.push(currentRow);
                                currentRow = new ActionRowBuilder();
                                buttonsInCurrentRow = 0;
                            }
                            
                         
                            currentRow.addComponents(button);
                            buttonsInCurrentRow++;
                        }
                        
                     
                        if (buttonsInCurrentRow > 0) {
                            rows.push(currentRow);
                        }
                        
                        // Debug log
                        //console.log(`Rebuilding reaction role message ${messageId} with ${buttonEntries.length} buttons across ${rows.length} rows`);
                        
                        // Update the message with correctly constructed rows
                        await message.edit({ components: rows });
                    }
                } catch (err) {
                    //console.error(`Error setting up reaction roles for message ${messageId}:`, err);
                }
            }
            
            console.log('Reaction role setup complete!');
        } catch (err) {
            console.error('Error setting up reaction roles:', err);
        }
    };

    // Call once on startup
    client.once('ready', async () => {
        await rebuildReactionRoles();
        

        setInterval(rebuildReactionRoles, 3 * 60 * 60 * 1000);
    });
    
    // Cleanup handlers
    client.on('guildDelete', async (guild) => {
        try {
            await reactionRolesCollection.deleteMany({ serverId: guild.id });
            //console.log(`Cleaned up reaction roles for deleted guild: ${guild.id}`);
        } catch (err) {
            //console.error(`Error cleaning up reaction roles for guild ${guild.id}:`, err);
        }
    });
    
    client.on('channelDelete', async (channel) => {
        try {
            await reactionRolesCollection.deleteMany({ channelId: channel.id });
            //console.log(`Cleaned up reaction roles for deleted channel: ${channel.id}`);
        } catch (err) {
            //console.error(`Error cleaning up reaction roles for channel ${channel.id}:`, err);
        }
    });
    
    client.on('messageDelete', async (message) => {
        try {
            await reactionRolesCollection.deleteMany({ messageId: message.id });
            //console.log(`Cleaned up reaction roles for deleted message: ${message.id}`);
        } catch (err) {
            //console.error(`Error cleaning up reaction roles for message ${message.id}:`, err);
        }
    });
};