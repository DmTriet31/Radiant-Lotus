const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { saveGiveaway, getGiveaways, deleteGiveaway } = require('../mongodb');

module.exports = (client) => {
  client.giveaways = [];

  async function loadGiveaways() {
    try {
      client.giveaways = await getGiveaways() || [];
      console.log(`\x1b[36m[ GIVEAWAYS ]\x1b[0m \x1b[32mLoaded ${client.giveaways.length} active giveaways ✅\x1b[0m`);
    } catch (error) {
      console.error('\x1b[31m[ GIVEAWAYS ] Error loading giveaways:', error, '\x1b[0m');
      client.giveaways = [];
    }
  }

  // Load giveaways when bot is ready to ensure MongoDB is connected
  client.once('ready', async () => {
    // Wait a bit to ensure MongoDB connection is established
    setTimeout(async () => {
      await loadGiveaways();
      setInterval(checkGiveaways.bind(null, client), 5000);
    }, 3000);
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
      const giveaway = client.giveaways.find(g => g.messageId === interaction.message.id);
      if (!giveaway) return;

      if (interaction.customId === 'enter_giveaway') {
        await handleEnterGiveaway(interaction, giveaway);
      }
      else if (interaction.customId === 'view_participants') {
        await handleViewParticipants(interaction, giveaway);
      }
    }
  });

  async function handleEnterGiveaway(interaction, giveaway) {
    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      
      if (giveaway.role && !member.roles.cache.has(giveaway.role)) {
        return interaction.reply({ content: 'You do not have the required role to enter this giveaway.', ephemeral: true });
      }
    
      if (!giveaway.entries.includes(interaction.user.id)) {
        giveaway.entries.push(interaction.user.id);
        await saveGiveaway(giveaway);
    
        await interaction.deferUpdate();
    
        await interaction.message.edit({ 
          components: [createGiveawayButtons(giveaway)] 
        });
    
        await interaction.followUp({ 
          content: 'You have entered the giveaway!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: 'You are already entered in this giveaway.', 
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error('Error handling enter giveaway interaction:', error);
      try {
        await interaction.reply({ 
          content: 'There was an error processing your request. Please try again later.', 
          ephemeral: true 
        });
      } catch (replyError) {
        console.error('Failed to reply to interaction:', replyError);
      }
    }
  }

  async function handleViewParticipants(interaction, giveaway) {
    try {
      let participants = 'No participants yet.';
      
      if (giveaway.entries && giveaway.entries.length > 0) {
        // Limit to 30 participants to avoid hitting Discord character limits
        const displayEntries = giveaway.entries.slice(0, 30);
        participants = displayEntries.map(entry => `<@${entry}>`).join('\n');
        
        if (giveaway.entries.length > 30) {
          participants += `\n...and ${giveaway.entries.length - 30} more participants.`;
        }
      }
    
      const embed = new EmbedBuilder()
        .setTitle('Giveaway Participants')
        .setDescription(participants)
        .setColor(0x7289da)
        .setFooter({ text: `Total Participants: ${giveaway.entries.length} | Giveaway ID: ${giveaway.messageId}` });
    
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error handling view participants interaction:', error);
      try {
        await interaction.reply({ 
          content: 'There was an error retrieving the participants list.', 
          ephemeral: true 
        });
      } catch (replyError) {
        console.error('Failed to reply to interaction:', replyError);
      }
    }
  }

  async function checkGiveaways(client) {
    const now = Date.now();
    if (!client.giveaways || client.giveaways.length === 0) return;
  
    const newGiveaways = [];
    for (const giveaway of client.giveaways) {
      if (giveaway.endTime <= now) {
          try {
              await endGiveaway(client, giveaway);
          } catch (error) {
              console.error('Error ending giveaway:', error);
  
            
              if (
                  error.code === 10003 || // Unknown Channel
                  error.code === 50001 || // Missing Access
                  error.message?.includes('Unknown Channel')
              ) {
                  console.log(`❌ Channel not found or no access for giveaway ${giveaway.messageId}. Cleaning up.`);
                  await deleteGiveaway(giveaway.messageId);
              } else {
                  newGiveaways.push(giveaway); // Retry later
              }
          }
      } else {
          newGiveaways.push(giveaway);
      }
  }  
    client.giveaways = newGiveaways;
  }
  
  async function endGiveaway(client, giveaway) {
    const channel = await client.channels.fetch(giveaway.channel);
    if (!channel) throw new Error('Channel not found');

    const winners = [];
    const entries = [...giveaway.entries]; // Create a copy to avoid modifying the original

    while (winners.length < giveaway.winners && entries.length > 0) {
      const winnerIndex = Math.floor(Math.random() * entries.length);
      const winnerId = entries.splice(winnerIndex, 1)[0];
      winners.push(`<@${winnerId}>`);
    }

    // Send winners announcement
    await channel.send({
      embeds: [{
        title: '🎉 Giveaway Ended! 🎉',
        description: `Prize: **${giveaway.prize}**\nWinners: ${winners.length > 0 ? winners.join(', ') : 'No valid entries.'}`,
        color: 0x7289da
      }]
    });

    // Update the original giveaway message to show it's ended
    try {
      const message = await channel.messages.fetch(giveaway.messageId);
      const updatedEmbed = EmbedBuilder.from(message.embeds[0])
        .setDescription(`${giveaway.description || ''}\n\nPrize: **${giveaway.prize}**\n**Giveaway has ended**\nWinners: ${winners.length > 0 ? winners.join(', ') : 'No valid entries.'}`)
        .setColor(0x555555);
      
      await message.edit({ 
        embeds: [updatedEmbed],
        components: [] // Remove buttons
      });
    } catch (error) {
      console.error('Error updating ended giveaway message:', error);
    }

    await deleteGiveaway(giveaway.messageId);
    console.log(`Giveaway ${giveaway.messageId} ended and removed from database.`);
  }

  function createGiveawayButtons(giveaway) {
    const enterButton = new ButtonBuilder()
      .setCustomId('enter_giveaway')
      .setLabel(`🎉 Enter Giveaway (${giveaway.entries.length})`)
      .setStyle(ButtonStyle.Danger);

    const viewButton = new ButtonBuilder()
      .setCustomId('view_participants')
      .setLabel('Participants')
      .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(enterButton, viewButton);
  }

  // Add these to client for use in commands
  client.giveawayFunctions = {
    createGiveawayButtons,
    endGiveaway,
    loadGiveaways
  };
};