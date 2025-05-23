const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { reactionRolesCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-reactionroles')
    .setDescription('Create, manage, or view reaction role messages')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    // Subcommand to create a reaction role message with interactive setup
    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription('Create a new reaction role message')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('The title of the embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('The description of the embed')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send the reaction role message in')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role1')
            .setDescription('The first role to add')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('label1')
            .setDescription('The first button label')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji1')
            .setDescription('The first emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role2')
            .setDescription('The second role to add')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label2')
            .setDescription('The second button label')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji2')
            .setDescription('The second emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role3')
            .setDescription('The third role to add')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label3')
            .setDescription('The third button label')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji3')
            .setDescription('The third emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role4')
            .setDescription('The fourth role to add')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label4')
            .setDescription('The fourth button label')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji4')
            .setDescription('The fourth emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role5')
            .setDescription('The fifth role to add')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label5')
            .setDescription('The fifth button label')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji5')
            .setDescription('The fifth emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('style')
            .setDescription('Button style for the reaction roles')
            .addChoices(
              { name: '🔵 Primary (Blue)', value: 'PRIMARY' },
              { name: '🟢 Success (Green)', value: 'SUCCESS' },
              { name: '⚠️ Danger (Red)', value: 'DANGER' },
              { name: '⚪ Secondary (Grey)', value: 'SECONDARY' }
            )
            .setRequired(false))
        .addBooleanOption(option =>
          option.setName('use_menu')
            .setDescription('Use a dropdown menu instead of buttons? (For more than 5 roles)')
            .setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('menu')
        .setDescription('Create a reaction role dropdown menu (up to 25 roles)')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('The title of the embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('The description of the embed')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send the reaction role message in')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('placeholder')
            .setDescription('Text shown when no option is selected')
            .setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Add roles to an existing reaction role menu')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The message ID of the existing reaction role menu')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel where the reaction role message exists')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to add')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('label')
            .setDescription('The label for this role')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('The emoji (server emoji: \":name:\" or unicode emoji)')
            .setRequired(false))
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Remove a role from an existing reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The message ID of the reaction role')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel where the reaction role message exists')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription('View reaction role setups for this server')
    )
    .addSubcommand(sub =>
      sub
        .setName('delete')
        .setDescription('Delete a reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The message ID of the reaction role')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel where the reaction role message exists')
            .setRequired(true))
    ),

  async execute(interaction) {
    if (interaction.isCommand && interaction.isCommand()) {

    const guild = interaction.guild;
    const serverId = guild.id;
    if (!await checkPermissions(interaction)) return;
    const subcommand = interaction.options.getSubcommand();

  
    const parseEmoji = (emojiInput) => {
      if (!emojiInput) return null;

   
      const customEmojiMatch = emojiInput.match(/<(?:a)?:([a-zA-Z0-9_]+):(\d+)>/);
      if (customEmojiMatch) {
        return {
          name: customEmojiMatch[1],
          id: customEmojiMatch[2],
          animated: emojiInput.startsWith('<a:')
        };
      }

    
      const serverEmojiNameMatch = emojiInput.match(/:([a-zA-Z0-9_]+):/);
      if (serverEmojiNameMatch) {
        const emojiName = serverEmojiNameMatch[1];
        const emoji = guild.emojis.cache.find(e => e.name === emojiName);
        if (emoji) {
          return {
            name: emoji.name,
            id: emoji.id,
            animated: emoji.animated
          };
        }
      }

   
      return {
        name: emojiInput,
        unicode: true
      };
    };

    if (subcommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const channel = interaction.options.getChannel('channel');
      const buttonStyle = interaction.options.getString('style') || 'PRIMARY';
      const useMenu = interaction.options.getBoolean('use_menu') || false;

      const roles = [];
      const labels = [];
      const emojis = [];

   
      for (let i = 1; i <= 5; i++) {
        const role = interaction.options.getRole(`role${i}`);
        const label = interaction.options.getString(`label${i}`);
        const emojiInput = interaction.options.getString(`emoji${i}`);
        
        if (role && label) {
          roles.push(role);
          labels.push(label);
          
          const emoji = parseEmoji(emojiInput);
          emojis.push(emoji);
        }
      }

      if (roles.length === 0) {
        return interaction.reply({ 
          content: '❌ You must provide at least one role and label.', 
          ephemeral: true 
        });
      }

    
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('#6366f1')
        .setFooter({ 
          text: 'Click the buttons below to get or remove the roles', 
          iconURL: guild.iconURL({ dynamic: true }) 
        })
        .setTimestamp();

        if (!useMenu) {
          console.log('buttonStyle:', buttonStyle);
        
       
          const styleKey = buttonStyle.charAt(0).toUpperCase() + buttonStyle.slice(1).toLowerCase();
          const style = ButtonStyle[styleKey] ?? ButtonStyle.Secondary;
        
          const buttons = roles.map((role, i) => {
            const button = new ButtonBuilder()
              .setCustomId(`reaction_role_${role.id}`)
              .setLabel(labels[i])
              .setStyle(style);
        
          
            if (emojis[i]) {
              const emoji = emojis[i];
              if (emoji.unicode) {
                button.setEmoji(emoji.name);
              } else {
                button.setEmoji(emoji.id);
              }
            }
        
            return button;
          });

        const rows = [];
      
        for (let i = 0; i < buttons.length; i += 5) {
          const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
          rows.push(row);
        }

    
        const message = await channel.send({ embeds: [embed], components: rows });

   
        for (let i = 0; i < roles.length; i++) {
          const role = roles[i];
          const label = labels[i];
          const emoji = emojis[i];

          await reactionRolesCollection.insertOne({
            serverId: guild.id,
            channelId: channel.id,
            messageId: message.id,
            roleId: role.id,
            roleName: role.name,
            customId: `reaction_role_${role.id}`,
            label,
            emoji: emoji ? {
              name: emoji.name,
              id: emoji.id,
              animated: emoji.animated,
              unicode: emoji.unicode
            } : null,
            style: ButtonStyle[buttonStyle],
            type: 'button'
          });
        }

        return interaction.reply({ 
          content: `✅ Reaction role buttons have been set up in <#${channel.id}>!`, 
          ephemeral: true 
        });
      } else {
     
        const options = roles.map((role, i) => {
          const option = {
            label: labels[i],
            value: role.id,
            description: `Toggle the ${role.name} role`
          };
          
          if (emojis[i]) {
            if (emojis[i].unicode) {
              option.emoji = emojis[i].name;
            } else {
              option.emoji = { id: emojis[i].id, name: emojis[i].name };
            }
          }
          
          return option;
        });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`reaction_menu_${channel.id}`)
          .setPlaceholder('Select roles to add/remove')
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

      
        const message = await channel.send({ embeds: [embed], components: [row] });

  
        for (let i = 0; i < roles.length; i++) {
          const role = roles[i];
          const label = labels[i];
          const emoji = emojis[i];

          await reactionRolesCollection.insertOne({
            serverId: guild.id,
            channelId: channel.id,
            messageId: message.id,
            roleId: role.id,
            roleName: role.name,
            menuId: `reaction_menu_${channel.id}`,
            label,
            emoji: emoji ? {
              name: emoji.name,
              id: emoji.id,
              animated: emoji.animated,
              unicode: emoji.unicode
            } : null,
            type: 'menu'
          });
        }

        return interaction.reply({ 
          content: `✅ Reaction role dropdown menu has been set up in <#${channel.id}>!`, 
          ephemeral: true 
        });
      }
    } else if (subcommand === 'menu') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const channel = interaction.options.getChannel('channel');
      const placeholder = interaction.options.getString('placeholder');

   
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('#6366f1')
        .setFooter({ 
          text: 'Use the dropdown menu below to get or remove roles', 
          iconURL: guild.iconURL({ dynamic: true }) 
        })
        .setTimestamp();

   
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`reaction_menu_${channel.id}`)
        .setPlaceholder(placeholder)
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(selectMenu);

  
      const message = await channel.send({ embeds: [embed], components: [row] });

   
      await reactionRolesCollection.insertOne({
        serverId: guild.id,
        channelId: channel.id,
        messageId: message.id,
        menuId: `reaction_menu_${channel.id}`,
        placeholder,
        type: 'menu_container',
        roles: []
      });

      return interaction.reply({ 
        content: `✅ Empty reaction role menu has been created in <#${channel.id}>! Use \`/reactionroles add\` to add roles to this menu.`, 
        ephemeral: true 
      });
    } else if (subcommand === 'add') {
      const messageId = interaction.options.getString('message_id');
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emojiInput = interaction.options.getString('emoji');
      
      const emoji = parseEmoji(emojiInput);
      
      try {
  
        const message = await channel.messages.fetch(messageId);
        if (!message) {
          return interaction.reply({ 
            content: '❌ Could not find the specified message.', 
            ephemeral: true 
          });
        }

       
        const existingSetup = await reactionRolesCollection.findOne({ 
          messageId,
          type: { $in: ['menu_container', 'menu'] }  
        });

        if (!existingSetup) {
       
          const buttonSetup = await reactionRolesCollection.findOne({
            messageId,
            type: 'button'
          });

          if (buttonSetup) {
         
            const buttonStyle = buttonSetup.style || ButtonStyle.Secondary;
            
      
            const button = new ButtonBuilder()
              .setCustomId(`reaction_role_${role.id}`)
              .setLabel(label)
              .setStyle(buttonStyle);
            
         
            if (emoji) {
              if (emoji.unicode) {
                button.setEmoji(emoji.name);
              } else {
                button.setEmoji(emoji.id);
              }
            }
            
          
            const components = message.components;
            
        
            let totalButtons = 0;
            components.forEach(row => totalButtons += row.components.length);
            
            if (totalButtons >= 25) {
              return interaction.reply({ 
                content: '❌ Maximum button limit reached (25). Consider using a dropdown menu instead.', 
                ephemeral: true 
              });
            }
            
          
            let targetRow;
            for (const row of components) {
              if (row.components.length < 5) {
                targetRow = row;
                break;
              }
            }
            
            if (!targetRow) {
              if (components.length >= 5) {
                return interaction.reply({ 
                  content: '❌ No more rows available. Maximum of 5 rows reached.', 
                  ephemeral: true 
                });
              }
              
          
              targetRow = new ActionRowBuilder();
              components.push(targetRow);
            }
            
          
            const actionRows = components.map(row => {
              const actionRow = new ActionRowBuilder();
              actionRow.addComponents(row.components.map(c => 
                ButtonBuilder.from(c)
              ));
              return actionRow;
            });
            
           
            if (targetRow.components && targetRow.components.length > 0) {
              actionRows[components.indexOf(targetRow)].addComponents(button);
            } else {
              actionRows.push(new ActionRowBuilder().addComponents(button));
            }
            
        
            await message.edit({ components: actionRows });
            
        
            await reactionRolesCollection.insertOne({
              serverId: guild.id,
              channelId: channel.id,
              messageId: message.id,
              roleId: role.id,
              roleName: role.name,
              customId: `reaction_role_${role.id}`,
              label,
              emoji: emoji ? {
                name: emoji.name,
                id: emoji.id,
                animated: emoji.animated,
                unicode: emoji.unicode
              } : null,
              style: buttonStyle,
              type: 'button'
            });
            
            return interaction.reply({ 
              content: `✅ Added role ${role.name} to the reaction role message.`, 
              ephemeral: true 
            });
          }
          
          return interaction.reply({ 
            content: '❌ This message is not set up as a reaction role menu.', 
            ephemeral: true 
          });
        }

      
        if (existingSetup.type === 'menu_container' || existingSetup.type === 'menu') {
     
          const menuRoles = await reactionRolesCollection.find({ 
            messageId,
            type: 'menu'
          }).toArray();
          
       
          if (menuRoles.length >= 25) {
            return interaction.reply({ 
              content: '❌ Maximum limit of 25 options per dropdown menu reached.', 
              ephemeral: true 
            });
          }
          
          // Check if this role is already in the menu
          const roleExists = menuRoles.some(r => r.roleId === role.id);
          if (roleExists) {
            return interaction.reply({ 
              content: `❌ Role ${role.name} is already in this reaction role menu.`, 
              ephemeral: true 
            });
          }
          
          // Create all options from existing menu roles plus the new one
          const options = [...menuRoles, {
            roleId: role.id,
            roleName: role.name,
            label,
            emoji
          }].map(role => {
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
          
          // Create the updated select menu
          const menuId = existingSetup.menuId || `reaction_menu_${channel.id}`;
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(menuId)
            .setPlaceholder(existingSetup.placeholder || 'Select a role')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options);
          
          const row = new ActionRowBuilder().addComponents(selectMenu);
          
          // Update the message
          await message.edit({ components: [row] });
          
          // Save the new reaction role
          await reactionRolesCollection.insertOne({
            serverId: guild.id,
            channelId: channel.id,
            messageId: message.id,
            roleId: role.id,
            roleName: role.name,
            menuId,
            label,
            emoji: emoji ? {
              name: emoji.name,
              id: emoji.id,
              animated: emoji.animated,
              unicode: emoji.unicode
            } : null,
            type: 'menu'
          });
          
          return interaction.reply({ 
            content: `✅ Added role ${role.name} to the reaction role menu.`, 
            ephemeral: true 
          });
        }
      } catch (error) {
        console.error('Error adding role to reaction message:', error);
        return interaction.reply({ 
          content: '❌ An error occurred while adding the role |  No same roles / ids allowed', 
          ephemeral: true 
        });
      }
    } else if (subcommand === 'remove') {
      const messageId = interaction.options.getString('message_id');
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');
      
      try {
        // Fetch the message
        const message = await channel.messages.fetch(messageId);
        if (!message) {
          return interaction.reply({ 
            content: '❌ Could not find the specified message.', 
            ephemeral: true 
          });
        }
        
        // Find the reaction role configuration for this role
        const reactionRole = await reactionRolesCollection.findOne({ 
          messageId, 
          roleId: role.id 
        });
        
        if (!reactionRole) {
          return interaction.reply({ 
            content: `❌ Role ${role.name} was not found in this reaction role message.`, 
            ephemeral: true 
          });
        }
        
        // Remove from database
        await reactionRolesCollection.deleteOne({ 
          messageId, 
          roleId: role.id 
        });
        
        if (reactionRole.type === 'button') {
          // Update buttons in the message
          const components = message.components;
          let roleRemoved = false;
          
          const updatedRows = [];
          for (const row of components) {
            const updatedComponents = [];
            
            for (const component of row.components) {
              if (component.customId !== `reaction_role_${role.id}`) {
                updatedComponents.push(component);
              } else {
                roleRemoved = true;
              }
            }
            
            if (updatedComponents.length > 0) {
              const actionRow = new ActionRowBuilder();
              actionRow.addComponents(updatedComponents.map(c => ButtonBuilder.from(c)));
              updatedRows.push(actionRow);
            }
          }
          
          if (updatedRows.length > 0) {
            await message.edit({ components: updatedRows });
          } else {
            await message.edit({ components: [] });
          }
          
          return interaction.reply({ 
            content: `✅ Removed role ${role.name} from the reaction role message.`, 
            ephemeral: true 
          });
        } else if (reactionRole.type === 'menu') {
          // Get all remaining roles for this menu
          const menuRoles = await reactionRolesCollection.find({ 
            messageId, 
            type: 'menu',
            roleId: { $ne: role.id }
          }).toArray();
          
          if (menuRoles.length > 0) {
            // Create options from remaining roles
            const options = menuRoles.map(role => {
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
            
            // Create updated select menu
            const menuId = reactionRole.menuId;
            const menuContainer = await reactionRolesCollection.findOne({ 
              messageId, 
              type: 'menu_container' 
            });
            
            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId(menuId)
              .setPlaceholder(menuContainer?.placeholder || 'Select a role')
              .setMinValues(1)
              .setMaxValues(1)
              .addOptions(options);
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            // Update the message
            await message.edit({ components: [row] });
          } else {
            // No roles left, remove the menu
            await message.edit({ components: [] });
            
            // Remove the menu container as well
            await reactionRolesCollection.deleteOne({ 
              messageId, 
              type: 'menu_container' 
            });
          }
          
          return interaction.reply({ 
            content: `✅ Removed role ${role.name} from the reaction role menu.`, 
            ephemeral: true 
          });
        }
      } catch (error) {
        console.error('Error removing role from reaction message:', error);
        return interaction.reply({ 
          content: '❌ An error occurred while removing the role.', 
          ephemeral: true 
        });
      }
    } else if (subcommand === 'view') {
      // Fetch all reaction role configurations for this server
      const allReactionRoles = await reactionRolesCollection.find({ 
        serverId: guild.id 
      }).toArray();
      
      if (allReactionRoles.length === 0) {
        return interaction.reply({ 
          content: '📝 No reaction role setups found for this server.', 
          ephemeral: true 
        });
      }
      
      // Group by message ID
      const groupedByMessage = {};
      for (const rr of allReactionRoles) {
        if (!groupedByMessage[rr.messageId]) {
          groupedByMessage[rr.messageId] = [];
        }
        groupedByMessage[rr.messageId].push(rr);
      }
      
      // Build embeds for each message
      const embeds = [];
      for (const messageId in groupedByMessage) {
        const entries = groupedByMessage[messageId];
        const channelId = entries[0].channelId;
        const channel = guild.channels.cache.get(channelId);
        
        if (!channel) continue;
        
        let description = `**Channel:** <#${channelId}>\n`;
        description += `**Message ID:** ${messageId}\n`;
        description += `**Type:** ${entries[0].type === 'button' ? 'Buttons' : 'Dropdown Menu'}\n\n`;
        description += '**Roles:**\n';
        
        for (const entry of entries) {
          if (entry.type === 'menu_container') continue;
          
          description += `• <@&${entry.roleId}> - ${entry.label}`;
          if (entry.emoji) {
            if (entry.emoji.unicode) {
              description += ` (${entry.emoji.name})`;
            } else {
              description += ` (<:${entry.emoji.name}:${entry.emoji.id}>)`;
            }
          }
          description += '\n';
        }
        
        // Create embed
        const embed = new EmbedBuilder()
          .setColor('#6366f1')
          .setTitle('Reaction Role Setup')
          .setDescription(description);
          
        embeds.push(embed);
      }
      
      // Send the embeds (max 10 per message)
      for (let i = 0; i < embeds.length; i += 10) {
        const embedsChunk = embeds.slice(i, i + 10);
        if (i === 0) {
          await interaction.reply({ 
            embeds: embedsChunk, 
            ephemeral: true 
          });
        } else {
          await interaction.followUp({ 
            embeds: embedsChunk, 
            ephemeral: true 
          });
        }
      }
    } else if (subcommand === 'delete') {
      const messageId = interaction.options.getString('message_id');
      const channel = interaction.options.getChannel('channel');
      
      try {
        // Check if the message exists in the reaction roles collection
        const reactionRoles = await reactionRolesCollection.find({ 
          messageId 
        }).toArray();
        
        if (reactionRoles.length === 0) {
          return interaction.reply({ 
            content: '❌ No reaction role setup found for this message.', 
            ephemeral: true 
          });
        }
        
        // Try to delete the message
        try {
          const message = await channel.messages.fetch(messageId);
          await message.delete();
        } catch (error) {
          // Message might not exist anymore, just continue with database cleanup
        }
        
        // Remove all entries for this message from the database
        await reactionRolesCollection.deleteMany({ messageId });
        
        return interaction.reply({ 
          content: `✅ Reaction role setup for message ID ${messageId} has been deleted.`, 
          ephemeral: true 
        });
      } catch (error) {
        console.error('Error deleting reaction role setup:', error);
        return interaction.reply({ 
          content: '❌ An error occurred while deleting the reaction role setup.', 
          ephemeral: true 
        });
      }
    }
  } else {
    const embed = new EmbedBuilder()
    .setColor('#3498db')
    .setAuthor({ 
        name: "Alert!", 
        iconURL: cmdIcons.dotIcon ,
        url: "https://discord.gg/xQF9f9yUEM"
    })
    .setDescription('- This command can only be used through slash command!\n- Please use `/setup-reactionroles`')
    .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    }  
  }
};