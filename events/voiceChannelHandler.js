const { Client, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { VoiceChannelModel, TemporaryChannelModel, CentralizedControlModel } = require('../models/autoVoice/schema');
const setupBanners = require('../UI/banners/SetupBanners');
let config = {};

async function loadConfig() {
  try {
    const voiceChannels = await VoiceChannelModel.find({});
    config.voiceChannelSetup = voiceChannels.reduce((acc, channel) => {
      acc[channel.serverId] = {
        voiceChannelId: channel.voiceChannelId,
        managerChannelId: channel.managerChannelId,
        allowedRoleIds: channel.allowedRoleIds,
        status: channel.status
      };
      return acc;
    }, {});
  } catch (err) {
    console.error('Error loading config from MongoDB:', err);
    config.voiceChannelSetup = {};
  }
}

function setupIntervals(client) {

  setInterval(loadConfig, 5000);

  
  setInterval(async () => {
    try {
      const now = Date.now();
      const outdatedChannels = await TemporaryChannelModel.find({
        isTemporary: true,
        createdAt: { $lt: new Date(now - 6 * 60 * 60 * 1000) }
      });

      for (const channel of outdatedChannels) {
        const guild = client.guilds.cache.get(channel.guildId);
        if (!guild) continue;

        const channelObj = guild.channels.cache.get(channel.channelId);
        if (channelObj) {
          await channelObj.delete();
        }
        await TemporaryChannelModel.deleteOne({ channelId: channel.channelId });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 5000);
}

const deleteChannelAfterTimeout = (client, channelId, timeout) => {
  setTimeout(async () => {
    try {
      const channelData = await TemporaryChannelModel.findOne({ channelId });
      if (channelData) {
        const guild = client.guilds.cache.get(channelData.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          await channel.delete();
          await TemporaryChannelModel.deleteOne({ channelId });
        }
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  }, timeout);
};

const sendOrUpdateCentralizedEmbed = async (client, guild) => {
  const guildConfig = config.voiceChannelSetup[guild.id];
  if (!guildConfig) return;

  const managerChannelId = guildConfig.managerChannelId;
  const managerChannel = guild.channels.cache.get(managerChannelId);

  if (!managerChannel) {
    console.log(`Manager channel not found for guild: ${guild.id}`);
    return;
  }

  try {
    const existingControl = await CentralizedControlModel.findOne({ guildId: guild.id });
    
    // Enhanced embed with better styling and organization
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Dynamic Voice Channel Manager",
        iconURL: "https://cdn.discordapp.com/emojis/1092879273712435262.gif",
        url: "https://discord.gg/"
      })
      .setDescription('**Create and manage your own voice channels!**\n\nJoin the creation channel to get started. Use these controls to customize your experience.')
      .setColor('#5865F2') 
      .addFields([
        {
          name: '🔒 Privacy Controls',
          value: `> \`🔒\` Lock channel - Prevent others from joining\n> \`🔓\` Unlock channel - Allow others to join\n> \`👻\` Hide channel - Make it invisible to others\n> \`👁️\` Show channel - Make it visible to everyone`
        },
        {
          name: '⚙️ Channel Settings',
          value: `> \`✏️\` Rename - Change channel name/description\n> \`👑\` Transfer - Give ownership to another user\n> \`🧢\` User Limit - Adjust maximum capacity\n> \`🔊\` Bitrate - Adjust audio quality`
        },
        {
          name: '🛠️ Moderation Tools',
          value: `> \`🚫\` Disconnect - Remove users from your channel\n> \`ℹ️\` Info - View detailed channel statistics\n> \`🌎\` Region - Change voice server location`
        }
      ])
      .setImage(setupBanners.autovcBanner)
      .setFooter({ text: 'Your voice channel will automatically delete after 6 hours of inactivity' })
      .setTimestamp();

    // Row 1: Privacy controls
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice_control_lock_channel')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('voice_control_unlock_channel')
          .setEmoji('🔓')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('voice_control_ghost_channel')
          .setEmoji('👻')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('voice_control_reveal_channel')
          .setEmoji('👁️')
          .setStyle(ButtonStyle.Primary)
      );

    // Row 2: Settings and controls
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice_control_edit_channel')
          .setEmoji('✏️')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('voice_control_increase_limit')
          .setEmoji('➕')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('voice_control_decrease_limit')
          .setEmoji('➖')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('voice_control_view_channel_info')
          .setEmoji('ℹ️')
          .setStyle(ButtonStyle.Success)
      );

    // Row 3: Additional controls
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice_control_disconnect_member')
          .setEmoji('🚫')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('voice_control_change_bitrate')
          .setEmoji('🔊')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('voice_control_change_region')
          .setEmoji('🌏')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('voice_control_transfer_ownership')
          .setEmoji('👑')
          .setStyle(ButtonStyle.Secondary)
      );

    if (existingControl) {
      try {
        const message = await managerChannel.messages.fetch(existingControl.messageId);

        if (message.author.id === client.user.id) {
          await message.edit({ embeds: [embed], components: [row1, row2, row3] });
        } else {
          await message.delete();
          const newMessage = await managerChannel.send({ embeds: [embed], components: [row1, row2, row3] });
          await CentralizedControlModel.updateOne(
            { guildId: guild.id },
            { $set: { messageId: newMessage.id } }
          );
        }
      } catch (fetchError) {
        if (fetchError.code === 10008) {
          console.error(`Message not found for guild ${guild.id}. Removing outdated record.`);
          await CentralizedControlModel.deleteOne({ guildId: guild.id });
          const newMessage = await managerChannel.send({ embeds: [embed], components: [row1, row2, row3] });
          await CentralizedControlModel.create({
            guildId: guild.id,
            messageId: newMessage.id,
          });
        } else {
          console.error(`Error fetching message for guild ${guild.id}:`, fetchError);
        }
      }
    } else {
      const newMessage = await managerChannel.send({ embeds: [embed], components: [row1, row2, row3] });
      await CentralizedControlModel.create({
        guildId: guild.id,
        messageId: newMessage.id,
      });
    }
  } catch (error) {
    console.error(`Error handling centralized embed for guild: ${guild.id}`, error);
  }
};

const checkOutdatedCentralizedControls = async (client) => {
  try {
    const records = await CentralizedControlModel.find({});
    for (const record of records) {
      const guild = client.guilds.cache.get(record.guildId);
      if (!guild) continue;

      const guildConfig = config.voiceChannelSetup[record.guildId];
      if (!guildConfig) continue;

      const managerChannel = guild.channels.cache.get(guildConfig.managerChannelId);
      if (!managerChannel) {
        await CentralizedControlModel.deleteOne({ guildId: record.guildId });
        continue;
      }

      try {
        await managerChannel.messages.fetch(record.messageId);
      } catch (fetchError) {
        if (fetchError.code === 10008) {
          console.error(`Message not found for guild ${record.guildId}. Removing outdated record.`);
          await CentralizedControlModel.deleteOne({ guildId: record.guildId });
          continue;
        } else {
          console.error(`Error fetching message for guild ${record.guildId}:`, fetchError);
        }
      }
    }
  } catch (error) {
    console.error('Error checking outdated centralized controls:', error);
  }
};

const handleVoiceStateUpdate = async (client, oldState, newState) => {
  // Handle user leaving a temporary voice channel
  if (oldState.channelId && !newState.channelId) {
    const oldChannel = oldState.channel;
    const voiceChannel = await TemporaryChannelModel.findOne({ channelId: oldChannel.id, isTemporary: true });

    if (voiceChannel && oldChannel.members.size === 0) {
      try {
        await oldChannel.delete();
        await TemporaryChannelModel.deleteOne({ channelId: oldChannel.id });
      } catch (error) {
        console.error(`Error deleting channel or record for channel ${oldChannel.id}:`, error);
      }
    }
  }

  // Don't proceed if the user is just moving within the same channel
  if (oldState.channelId === newState.channelId) return;

  // Handle user joining the creation channel
  const guildId = newState.guild.id;
  const settings = config.voiceChannelSetup[guildId];
  if (!settings || !settings.status) return;

  const { voiceChannelId, allowedRoleIds } = settings;
  const member = newState.member;

  // Check if user joined the main voice channel
  if (newState.channelId === voiceChannelId) {
    // Check if role is required and if user has the required role
    if (allowedRoleIds && allowedRoleIds.length > 0) {
      const hasAllowedRole = member.roles.cache.some(role => allowedRoleIds.includes(role.id));
      if (!hasAllowedRole) {
        // If user doesn't have the required role, move them back or disconnect them
        if (oldState.channelId) {
          try {
            await member.voice.setChannel(oldState.channelId);
          } catch (error) {
            await member.voice.disconnect();
          }
        } else {
          await member.voice.disconnect();
        }
        try {
          await member.send('You do not have the required role to create a voice channel.');
        } catch (dmError) {
          // Ignore if we can't DM the user
        }
        return;
      }
    }

    try {
      // Create new voice channel
      const newChannel = await newState.guild.channels.create({
        name: `${member.user.username}'s channel`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parentId,
        permissionOverwrites: [
          {
            id: member.user.id,
            allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]
          },
          {
            id: newState.guild.roles.everyone,
            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      
      await member.voice.setChannel(newChannel);

   
      await TemporaryChannelModel.create({
        channelId: newChannel.id,
        guildId,
        userId: member.user.id,
        createdAt: new Date(),
        isTemporary: true,
        name: `${member.user.username}'s channel`,
        description: ''
      });

     
      deleteChannelAfterTimeout(client, newChannel.id, 6 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Error creating voice channel:', error);
    }
  }
};

const handleButtonInteraction = async (interaction) => {
  if (!interaction.isButton()) return;

  const PREFIX = 'voice_control_';
  if (!interaction.customId.startsWith(PREFIX)) return;

  const guild = interaction.guild;
  const userId = interaction.user.id;
  const member = guild.members.cache.get(userId);
  const currentVoiceChannel = member?.voice.channel;

  if (!currentVoiceChannel) {
    return interaction.reply({ content: 'You must be in a voice channel to perform this action.', ephemeral: true });
  }

  const channelId = currentVoiceChannel.id;
  const voiceChannel = await TemporaryChannelModel.findOne({ channelId });

  if (!voiceChannel) {
    return interaction.reply({ content: 'This channel is not managed by the bot.', ephemeral: true });
  }

  if (voiceChannel.userId !== userId) {
    return interaction.reply({ content: 'You do not have permission to manage this channel.', ephemeral: true });
  }

  try {
    const action = interaction.customId.replace(PREFIX, '');

    switch (action) {
      case 'lock_channel':
        await currentVoiceChannel.permissionOverwrites.edit(
          guild.roles.everyone,
          { Connect: false }
        );
        await interaction.reply({ content: 'Your channel is now locked. No one else can join.', ephemeral: true });
        break;

      case 'unlock_channel':
        await currentVoiceChannel.permissionOverwrites.edit(
          guild.roles.everyone,
          { Connect: true }
        );
        await interaction.reply({ content: 'Your channel is now unlocked. Anyone can join.', ephemeral: true });
        break;

      case 'ghost_channel':
        await currentVoiceChannel.permissionOverwrites.edit(
          guild.roles.everyone,
          { ViewChannel: false }
        );
        await interaction.reply({ content: 'Your channel is now ghosted. Only members already in the channel can see it.', ephemeral: true });
        break;

      case 'reveal_channel':
        await currentVoiceChannel.permissionOverwrites.edit(
          guild.roles.everyone,
          { ViewChannel: true }
        );
        await interaction.reply({ content: 'Your channel is now revealed. Everyone can see it.', ephemeral: true });
        break;

      case 'edit_channel':
        // Create and show a modal for editing channel name/description
        const modal = new ModalBuilder()
          .setCustomId(`edit_channel_modal_${channelId}`)
          .setTitle('Edit Voice Channel');

        const nameInput = new TextInputBuilder()
          .setCustomId('channel_name')
          .setLabel('Channel Name')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter new channel name')
          .setValue(currentVoiceChannel.name)
          .setRequired(true)
          .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
          .setCustomId('channel_description')
          .setLabel('Channel Description')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Enter channel description (optional)')
          .setValue(voiceChannel.description || '')
          .setRequired(false)
          .setMaxLength(1000);

        const nameActionRow = new ActionRowBuilder().addComponents(nameInput);
        const descActionRow = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(nameActionRow, descActionRow);
        await interaction.showModal(modal);
        break;

      case 'disconnect_member':
        // Show a list of members to disconnect
        if (currentVoiceChannel.members.size <= 1) {
          return interaction.reply({ content: 'There are no other members to disconnect.', ephemeral: true });
        }

        const memberOptions = currentVoiceChannel.members
          .filter(m => m.id !== userId)
          .map(m => ({
            label: m.user.username,
            value: m.id
          }));

        // Create select menu for members
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`disconnect_select_${channelId}`)
            .setPlaceholder('Select a member to disconnect')
            .addOptions(memberOptions)
        );

        await interaction.reply({
          content: 'Select a member to disconnect from the voice channel:',
          components: [row],
          ephemeral: true
        });
        break;

      case 'view_channel_info':
        const creationTime = new Date(voiceChannel.createdAt).toLocaleString();
        const userLimit = currentVoiceChannel.userLimit === 0 ? 'No limit' : currentVoiceChannel.userLimit;
        const memberCount = currentVoiceChannel.members.size;
        const owner = guild.members.cache.get(voiceChannel.userId)?.user.username || 'Unknown';

        const infoEmbed = new EmbedBuilder()
          .setTitle('Voice Channel Information')
          .setColor('#00FF00')
          .addFields(
            { name: 'Channel Name', value: currentVoiceChannel.name, inline: true },
            { name: 'Channel ID', value: channelId, inline: true },
            { name: 'Owner', value: owner, inline: true },
            { name: 'Created At', value: creationTime, inline: true },
            { name: 'Member Count', value: memberCount.toString(), inline: true },
            { name: 'User Limit', value: userLimit.toString(), inline: true },
            { name: 'Description', value: voiceChannel.description || 'No description set', inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        break;

      case 'increase_limit':
        if (currentVoiceChannel.userLimit < 99) {
          const newLimit = currentVoiceChannel.userLimit === 0 ? 2 : currentVoiceChannel.userLimit + 1;
          await currentVoiceChannel.setUserLimit(newLimit);
          await interaction.reply({ content: `User limit increased to ${newLimit}.`, ephemeral: true });
        } else {
          await interaction.reply({ content: 'Maximum user limit (99) reached.', ephemeral: true });
        }
        break;

      case 'decrease_limit':
        if (currentVoiceChannel.userLimit > 0) {
          const newLimit = currentVoiceChannel.userLimit - 1;
          await currentVoiceChannel.setUserLimit(newLimit);
          const limitMsg = newLimit === 0 ? 'removed (unlimited)' : `decreased to ${newLimit}`;
          await interaction.reply({ content: `User limit ${limitMsg}.`, ephemeral: true });
        } else {
          await interaction.reply({ content: 'User limit is already unlimited.', ephemeral: true });
        }
        break;

        case 'change_bitrate':
          const bitrateOptions = [
            { label: '8 kbps', value: '8000' },
            { label: '16 kbps', value: '16000' },
            { label: '32 kbps', value: '32000' },
            { label: '64 kbps', value: '64000' },
            { label: '96 kbps', value: '96000' },
            { label: '128 kbps', value: '128000' }
          ];
          
          const bitrateRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`set_bitrate_${channelId}`)
              .setPlaceholder('Select bitrate')
              .addOptions(bitrateOptions)
          );
          
          await interaction.reply({
            content: 'Select a bitrate for your voice channel:',
            components: [bitrateRow],
            ephemeral: true
          });
          break;
  
        case 'change_region':
          const regionOptions = [
            { label: 'Automatic', value: 'auto' },
            { label: 'Brazil', value: 'brazil' },
            { label: 'Europe', value: 'europe' },
            { label: 'Hong Kong', value: 'hongkong' },
            { label: 'India', value: 'india' },
            { label: 'Japan', value: 'japan' },
            { label: 'Russia', value: 'russia' },
            { label: 'Singapore', value: 'singapore' },
            { label: 'South Africa', value: 'southafrica' },
            { label: 'Sydney', value: 'sydney' },
            { label: 'US Central', value: 'us-central' },
            { label: 'US East', value: 'us-east' },
            { label: 'US South', value: 'us-south' },
            { label: 'US West', value: 'us-west' }
          ];
          
          const regionRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`set_region_${channelId}`)
              .setPlaceholder('Select region')
              .addOptions(regionOptions)
          );
          
          await interaction.reply({
            content: 'Select a region for your voice channel:',
            components: [regionRow],
            ephemeral: true
          });
          break;
  
        case 'transfer_ownership':
          if (currentVoiceChannel.members.size <= 1) {
            return interaction.reply({ content: 'There are no other members to transfer ownership to.', ephemeral: true });
          }
          
          const ownerOptions = currentVoiceChannel.members
            .filter(m => m.id !== userId)
            .map(m => ({
              label: m.user.username,
              value: m.id
            }));
          
          const ownerRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`transfer_to_${channelId}`)
              .setPlaceholder('Select new owner')
              .addOptions(ownerOptions)
          );
          
          await interaction.reply({
            content: 'Select a member to transfer ownership to:',
            components: [ownerRow],
            ephemeral: true
          });
          break;

      default:
        //await interaction.reply({ content: 'Invalid button pressed.', ephemeral: true });
    }
  } catch (error) {
    console.error('Error handling button interaction:', error);
    await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
  }
};

const handleModalSubmit = async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  
  if (interaction.customId.startsWith('edit_channel_modal_')) {
    const channelId = interaction.customId.replace('edit_channel_modal_', '');
    const newName = interaction.fields.getTextInputValue('channel_name');
    const newDescription = interaction.fields.getTextInputValue('channel_description');
    
    try {
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      }
      
      await channel.setName(newName);
      await TemporaryChannelModel.updateOne(
        { channelId },
        { $set: { name: newName, description: newDescription } }
      );
      
      await interaction.reply({ content: 'Channel name and description updated successfully!', ephemeral: true });
    } catch (error) {
      console.error('Error updating channel:', error);
      await interaction.reply({ content: 'An error occurred while updating the channel.', ephemeral: true });
    }
  }
};


const handleSelectMenu = async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith('disconnect_select_')) {
    const channelId = interaction.customId.replace('disconnect_select_', '');
    const selectedUserId = interaction.values[0];
    
    try {
      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      }
      
      const memberToDisconnect = channel.members.get(selectedUserId);
      if (!memberToDisconnect) {
        return interaction.reply({ content: 'Member not found in the channel.', ephemeral: true });
      }
      
      await memberToDisconnect.voice.disconnect();
      await interaction.reply({ content: `Disconnected ${memberToDisconnect.user.username} from the voice channel.`, ephemeral: true });
    } catch (error) {
      //console.error('Error disconnecting member:', error);
      await interaction.reply({ content: 'An error occurred while disconnecting the member.', ephemeral: true });
    }
  }
  if (interaction.customId.startsWith('set_bitrate_')) {
    const channelId = interaction.customId.replace('set_bitrate_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    const bitrate = parseInt(interaction.values[0]);
    
    if (!channel) {
      return interaction.reply({ content: 'Channel not found.', ephemeral: true });
    }
    
    await channel.setBitrate(bitrate);
    return interaction.reply({ 
      content: `Voice channel bitrate set to ${bitrate / 1000} kbps.`, 
      ephemeral: true 
    });
  }
  
 
  if (interaction.customId.startsWith('set_region_')) {
    const channelId = interaction.customId.replace('set_region_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    const region = interaction.values[0];
    
    if (!channel) {
      return interaction.reply({ content: 'Channel not found.', ephemeral: true });
    }
    
    try {
      await channel.setRTCRegion(region === 'auto' ? null : region);
      return interaction.reply({ 
        content: `Voice channel region set to ${region === 'auto' ? 'Automatic' : region}.`, 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error setting region:', error);
      return interaction.reply({ 
        content: 'An error occurred while setting the region.', 
        ephemeral: true 
      });
    }
  }
  
  // Handle ownership transfer selection
  if (interaction.customId.startsWith('transfer_to_')) {
    const channelId = interaction.customId.replace('transfer_to_', '');
    const newOwnerId = interaction.values[0];
    
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: 'Channel not found.', ephemeral: true });
    }
    
    const newOwner = channel.members.get(newOwnerId);
    if (!newOwner) {
      return interaction.reply({ content: 'Selected member is no longer in the channel.', ephemeral: true });
    }
    
    await channel.permissionOverwrites.edit(
      interaction.user.id,
      { ManageChannels: false }
    );
    
    await channel.permissionOverwrites.edit(
      newOwnerId,
      { ManageChannels: true, Connect: true, Speak: true }
    );
    
    await TemporaryChannelModel.updateOne(
      { channelId },
      { $set: { userId: newOwnerId } }
    );
    
    return interaction.reply({
      content: `Channel ownership transferred to ${newOwner.user.username}.`,
      ephemeral: true
    });
  }

  // Handle disconnect member selection
  if (interaction.customId.startsWith('disconnect_select_')) {
    // Your existing disconnect member code would go here
  }
};


module.exports = (client) => {
  setupIntervals(client);
  
  client.on('ready', async () => {
    try {
      await loadConfig();
      await checkOutdatedCentralizedControls(client);
      client.guilds.cache.forEach(guild => sendOrUpdateCentralizedEmbed(client, guild));
    } catch (error) {
      console.error('Error during ready event:', error);
    }
  });

  client.on('voiceStateUpdate', (oldState, newState) => handleVoiceStateUpdate(client, oldState, newState));

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  });
};

module.exports.loadConfig = loadConfig;
module.exports.sendOrUpdateCentralizedEmbed = sendOrUpdateCentralizedEmbed;