const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const { saveGiveaway, getGiveaways, deleteGiveaway } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');
const checkPermissions = require('../../utils/checkPermissions');
const giveawayCommand = new SlashCommandBuilder()
  .setName('setup-giveaway')
  .setDescription(lang.giveawayDescription)
  .addSubcommand(subcommand =>
    subcommand
      .setName('start')
      .setDescription('Start a giveaway')
      .addStringOption(option => option.setName('title').setDescription('Giveaway title').setRequired(true))
      .addStringOption(option => option.setName('description').setDescription('Giveaway description').setRequired(true))
      .addStringOption(option => option.setName('prize').setDescription('Prize description').setRequired(true))
      .addStringOption(option => option.setName('duration').setDescription('Giveaway duration (e.g., 1m, 24h, 3d, 1 week)').setRequired(true))
      .addIntegerOption(option => option.setName('winners').setDescription('Number of winners').setRequired(false))
      .addChannelOption(option => option.setName('channel').setDescription('Channel for the giveaway').setRequired(false))
      .addRoleOption(option => option.setName('roles').setDescription('Role requirement to enter').setRequired(false))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('edit')
      .setDescription('Edit an existing giveaway')
      .addStringOption(option => option.setName('message_id').setDescription('ID of the giveaway message').setRequired(true))
      .addStringOption(option => option.setName('title').setDescription('New giveaway title').setRequired(false))
      .addStringOption(option => option.setName('description').setDescription('New giveaway description').setRequired(false))
      .addStringOption(option => option.setName('prize').setDescription('New prize description').setRequired(false))
      .addStringOption(option => option.setName('duration').setDescription('New duration (e.g., 1m, 24h, 3d)').setRequired(false))
      .addIntegerOption(option => option.setName('winners').setDescription('New number of winners').setRequired(false))
      .addRoleOption(option => option.setName('roles').setDescription('New role requirement to enter').setRequired(false))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('end')
      .setDescription('End a giveaway early')
      .addStringOption(option => option.setName('message_id').setDescription('ID of the giveaway message').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('reroll')
      .setDescription('Reroll a finished giveaway')
      .addStringOption(option => option.setName('message_id').setDescription('ID of the finished giveaway message').setRequired(true))
      .addIntegerOption(option => option.setName('winners').setDescription('Number of winners to reroll').setRequired(false))
  );

module.exports = {
  data: giveawayCommand,
  async execute(interaction) {
    if (interaction.isCommand && interaction.isCommand()) {
    if (!await checkPermissions(interaction)) return;
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(lang.giveawayNoPermissions);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'start':
        await handleStartGiveaway(interaction);
        break;
      case 'edit':
        await handleEditGiveaway(interaction);
        break;
      case 'end':
        await handleEndGiveaway(interaction);
        break;
      case 'reroll':
        await handleRerollGiveaway(interaction);
        break;
    }
  } else {
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-giveaway`')
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
  }
};

async function handleStartGiveaway(interaction) {
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const prize = interaction.options.getString('prize');
  const duration = interaction.options.getString('duration');
  const winners = interaction.options.getInteger('winners') || 1;
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const role = interaction.options.getRole('roles');

  const giveawayEndTime = Date.now() + ms(duration);

  const giveawayEmbed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`${description}\n\nPrize: **${prize}**\nEnds: <t:${Math.floor(giveawayEndTime / 1000)}:R>\nWinners: ${winners}`)
    .setColor(0x7289da);

  const message = await channel.send({ embeds: [giveawayEmbed], components: [createGiveawayButtons({ entries: [] })] });

  const giveaway = {
    messageId: message.id,
    title,
    description,
    prize,
    endTime: giveawayEndTime,
    winners,
    channel: channel.id,
    role: role ? role.id : null,
    entries: [],
  };

  if (!interaction.client.giveaways) {
    interaction.client.giveaways = [];
  }

  interaction.client.giveaways.push(giveaway);
  await saveGiveaway(giveaway);

  await interaction.reply({ content: lang.giveawayStarted, ephemeral: true });
}

async function handleEditGiveaway(interaction) {
  const messageId = interaction.options.getString('message_id');
  const giveaway = interaction.client.giveaways.find(g => g.messageId === messageId);

  if (!giveaway) {
    return interaction.reply({ content: 'Giveaway not found. Please check the message ID.', ephemeral: true });
  }

  // Get updated values
  const title = interaction.options.getString('title') || giveaway.title;
  const description = interaction.options.getString('description') || giveaway.description;
  const prize = interaction.options.getString('prize') || giveaway.prize;
  const durationString = interaction.options.getString('duration');
  const winners = interaction.options.getInteger('winners') || giveaway.winners;
  const role = interaction.options.getRole('roles');

  // Update end time if duration is provided
  let endTime = giveaway.endTime;
  if (durationString) {
    endTime = Date.now() + ms(durationString);
  }

  // Update giveaway object
  giveaway.title = title;
  giveaway.description = description;
  giveaway.prize = prize;
  giveaway.endTime = endTime;
  giveaway.winners = winners;
  giveaway.role = role ? role.id : giveaway.role;

  // Update embed
  try {
    const channel = await interaction.client.channels.fetch(giveaway.channel);
    const message = await channel.messages.fetch(messageId);

    const updatedEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`${description}\n\nPrize: **${prize}**\nEnds: <t:${Math.floor(endTime / 1000)}:R>\nWinners: ${winners}`)
      .setColor(0x7289da);

    await message.edit({
      embeds: [updatedEmbed],
      components: [createGiveawayButtons(giveaway)]
    });

    // Save to database
    await saveGiveaway(giveaway);

    return interaction.reply({ content: 'Giveaway updated successfully!', ephemeral: true });
  } catch (error) {
    console.error('Error updating giveaway:', error);
    return interaction.reply({ content: 'Failed to update the giveaway. Please check if the message still exists.', ephemeral: true });
  }
}

async function handleEndGiveaway(interaction) {
  const messageId = interaction.options.getString('message_id');
  const giveaway = interaction.client.giveaways.find(g => g.messageId === messageId);

  if (!giveaway) {
    return interaction.reply({ content: 'Giveaway not found. Please check the message ID.', ephemeral: true });
  }

  try {
    await interaction.deferReply({ ephemeral: true });
    
    // End the giveaway immediately
    const channel = await interaction.client.channels.fetch(giveaway.channel);
    
    // Draw winners
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
      const message = await channel.messages.fetch(messageId);
      const updatedEmbed = EmbedBuilder.from(message.embeds[0])
        .setDescription(`${giveaway.description}\n\nPrize: **${giveaway.prize}**\n**Giveaway has ended**\nWinners: ${winners.length > 0 ? winners.join(', ') : 'No valid entries.'}`)
        .setColor(0x555555);
      
      await message.edit({ 
        embeds: [updatedEmbed],
        components: [] // Remove buttons
      });
    } catch (error) {
      console.error('Error updating ended giveaway message:', error);
    }

    // Remove from client and database
    interaction.client.giveaways = interaction.client.giveaways.filter(g => g.messageId !== messageId);
    await deleteGiveaway(messageId);

    return interaction.editReply({ content: 'Giveaway ended successfully!', ephemeral: true });
  } catch (error) {
    console.error('Error ending giveaway:', error);
    return interaction.editReply({ content: 'Failed to end the giveaway. Please check if the message still exists.', ephemeral: true });
  }
}

async function handleRerollGiveaway(interaction) {
  const messageId = interaction.options.getString('message_id');
  const winnerCount = interaction.options.getInteger('winners') || 1;

  try {
    await interaction.deferReply({ ephemeral: true });

    // Try to find the giveaway in database first (it might be already ended)
    const allGiveaways = await getGiveaways();
    let giveaway = allGiveaways.find(g => g.messageId === messageId);
    
    // If not in database, check active giveaways
    if (!giveaway) {
      giveaway = interaction.client.giveaways.find(g => g.messageId === messageId);
    }

    if (!giveaway) {
      // If still not found, try to fetch message to check if it was a giveaway
      try {
        const channel = interaction.channel;
        const message = await channel.messages.fetch(messageId);
        
        if (!message.embeds.length || !message.embeds[0].title || !message.embeds[0].description.includes('Prize:')) {
          return interaction.editReply({ content: 'That message does not appear to be a giveaway.', ephemeral: true });
        }
        
        // Extract entries from message if possible
        // This is a fallback if the giveaway isn't in the database
        giveaway = {
          messageId: messageId,
          channel: channel.id,
          entries: []
        };
        
        // Try to fetch entries from reactions if available
        if (message.reactions.cache.size > 0) {
          const reaction = message.reactions.cache.first();
          const users = await reaction.users.fetch();
          giveaway.entries = users.filter(user => !user.bot).map(user => user.id);
        }
      } catch (error) {
        console.error('Error fetching message for reroll:', error);
        return interaction.editReply({ content: 'Failed to find the giveaway message. Please check if the message still exists.', ephemeral: true });
      }
    }

    if (!giveaway.entries || giveaway.entries.length === 0) {
      return interaction.editReply({ content: 'This giveaway has no entries to reroll.', ephemeral: true });
    }

    // Draw new winners
    const winners = [];
    const entries = [...giveaway.entries]; // Copy array to avoid modifying original
    
    while (winners.length < winnerCount && entries.length > 0) {
      const winnerIndex = Math.floor(Math.random() * entries.length);
      const winnerId = entries.splice(winnerIndex, 1)[0];
      winners.push(`<@${winnerId}>`);
    }

    // Send reroll announcement
    const channel = await interaction.client.channels.fetch(giveaway.channel);
    await channel.send({
      embeds: [{
        title: '🎉 Giveaway Rerolled! 🎉',
        description: `New winners for ${giveaway.prize || 'the giveaway'}: ${winners.length > 0 ? winners.join(', ') : 'No valid entries.'}`,
        color: 0x7289da
      }]
    });

    return interaction.editReply({ content: 'Giveaway rerolled successfully!', ephemeral: true });
  } catch (error) {
    console.error('Error rerolling giveaway:', error);
    return interaction.editReply({ content: 'Failed to reroll the giveaway. Please check if the message still exists.', ephemeral: true });
  }
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