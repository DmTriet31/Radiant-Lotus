const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField,
    ChannelType, AttachmentBuilder
} = require('discord.js');
const ticketIcons = require('../UI/icons/ticketicons');
const TicketConfig = require('../models/ticket/TicketConfig');
const TicketUserData = require('../models/ticket/TicketUserData');
const generateTranscript = require('../utils/generateTranscript');
const fs = require('fs').promises;
const path = require('path');
const setupBanners = require('../UI/banners/SetupBanners');

let configCache = {};
let lastConfigLoad = null;
const CONFIG_REFRESH_INTERVAL = 60000; 


async function loadConfig() {
    try {
        const tickets = await TicketConfig.find({});
        const newCache = {};
        
        for (const ticket of tickets) {
            newCache[ticket.serverId] = {
                ticketChannelId: ticket.ticketChannelId,
                transcriptChannelId: ticket.transcriptChannelId,
                adminRoleId: ticket.adminRoleId,
                status: ticket.status,
                categoryId: ticket.categoryId,
                ownerId: ticket.ownerId
            };
        }
        
        configCache = newCache;
        lastConfigLoad = Date.now();
        return configCache;
    } catch (err) {
        console.error('Error loading ticket configs:', err);
        return configCache; 
    }
}


async function getConfig(force = false) {
    if (force || !lastConfigLoad || (Date.now() - lastConfigLoad > CONFIG_REFRESH_INTERVAL)) {
        await loadConfig();
    }
    return configCache;
}

module.exports = (client) => {
  
    client.on('ready', async () => {
        console.log('Initializing ticket system...');
        await loadConfig();
        
     
        setTimeout(() => setupTicketChannels(client), 5000);
        
       
        //setInterval(() => syncTicketChannels(client), 30 * 60 * 1000); 
        
       
        setInterval(() => cleanupStaleTickets(client), 15 * 60 * 1000); 
    });

 
    client.on('interactionCreate', async (interaction) => {
   
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
            await handleTicketCreation(interaction, client);
        } 
      
        else if (interaction.isButton() && interaction.customId.startsWith('close_ticket_')) {
            await handleTicketClose(interaction, client);
        } 
    
        else if (interaction.isButton() && interaction.customId.startsWith('ping_staff_')) {
            await handleStaffPing(interaction, client);
        }
    });

   
    client.on('guildDelete', async (guild) => {
        try {
         
            await TicketConfig.deleteOne({ serverId: guild.id });
            await TicketUserData.deleteMany({ guildId: guild.id });
            
           
            const config = await getConfig(true);
            delete config[guild.id];
            
            console.log(`Cleaned up ticket data for deleted guild: ${guild.name} (${guild.id})`);
        } catch (err) {
            console.error(`Error cleaning up data for deleted guild ${guild.id}:`, err);
        }
    });
};


async function setupTicketChannels(client) {
    const config = await getConfig(true);
    
    for (const [guildId, settings] of Object.entries(config)) {
        if (settings.status && settings.ticketChannelId) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;
            
            const ticketChannel = guild.channels.cache.get(settings.ticketChannelId);
            if (!ticketChannel) continue;
            
           
            try {
                const messages = await ticketChannel.messages.fetch({ limit: 10 });
                const botMessages = messages.filter(m => 
                    m.author.bot && 
                    m.embeds.length > 0 && 
                    m.embeds[0].data.author?.name === "Welcome to Ticket Support"
                );
                
                if (botMessages.size === 0) {
                   
                    await sendTicketEmbed(ticketChannel);
                    console.log(`Initialized ticket embed in channel ${ticketChannel.name} (${ticketChannel.id})`);
                }
            } catch (err) {
                console.error(`Error checking for ticket embeds in guild ${guildId}:`, err);
            }
        }
    }
}


async function sendTicketEmbed(channel) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Welcome to Ticket Support", iconURL: ticketIcons.mainIcon })
        .setDescription(
            '- Please click below menu to create a new ticket.\n\n' +
            '**Ticket Guidelines:**\n' +
            '- Empty tickets are not permitted.\n' +
            '- Please be patient while waiting for a response from our support team.'
        )

        .setFooter({ text: 'We are here to Help!', iconURL: ticketIcons.modIcon })
        .setColor('#00FF00')
        .setImage(setupBanners.ticketBanner)
        .setTimestamp();

    const menu = new StringSelectMenuBuilder()
        .setCustomId('select_ticket_type')
        .setPlaceholder('Choose ticket type')
        .addOptions([
            { label: '🆘 Support', value: 'support' },
            { label: '📂 Suggestion', value: 'suggestion' },
            { label: '💜 Feedback', value: 'feedback' },
            { label: '⚠️ Report', value: 'report' }
        ]);

    const row = new ActionRowBuilder().addComponents(menu);

    try {
        return await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
        console.error(`Error sending ticket embed to channel ${channel.id}:`, err);
        return null;
    }
}


async function handleTicketCreation(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const { guild, user, values } = interaction;
    const ticketType = values[0];

  
    const config = await TicketConfig.findOne({ serverId: guild.id });
    if (!config || !config.status) {
        return interaction.followUp({ 
            content: '⚠️ Ticket system is not configured or is disabled.',
            ephemeral: true 
        });
    }

    
    const existingTicket = await TicketUserData.findOne({ 
        userId: user.id, 
        guildId: guild.id 
    });
    
    if (existingTicket) {
        const existingChannel = guild.channels.cache.get(existingTicket.ticketChannelId);
        if (existingChannel) {
            return interaction.followUp({
                content: `❌ You already have an open ticket: ${existingChannel}`,
                ephemeral: true
            });
        } else {
          
            await TicketUserData.deleteOne({ _id: existingTicket._id });
        }
    }

  
    try {
        const ticketChannel = await guild.channels.create({
            name: `${user.username}-${ticketType}`,
            type: ChannelType.GuildText,
            parent: config.categoryId || null,
            permissionOverwrites: [
                { 
                    id: guild.roles.everyone, 
                    deny: [PermissionsBitField.Flags.ViewChannel] 
                },
                { 
                    id: user.id, 
                    allow: [
                        PermissionsBitField.Flags.ViewChannel, 
                        PermissionsBitField.Flags.SendMessages, 
                        PermissionsBitField.Flags.ReadMessageHistory
                    ] 
                },
                { 
                    id: config.adminRoleId, 
                    allow: [
                        PermissionsBitField.Flags.ViewChannel, 
                        PermissionsBitField.Flags.SendMessages, 
                        PermissionsBitField.Flags.ReadMessageHistory
                    ] 
                }
            ]
        });

        
        await TicketUserData.create({
            userId: user.id,
            guildId: guild.id,
            ticketChannelId: ticketChannel.id
        });

      
        const ticketId = `${user.id}-${ticketChannel.id}`;
        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ name: `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket`, iconURL: ticketIcons.modIcon })
            .setDescription(`Hello ${user}, welcome to our support!\nPlease describe your issue in detail.`)
            .setFooter({ text: 'Your satisfaction is our priority', iconURL: ticketIcons.heartIcon })
            .setColor('#00FF00')
            .setTimestamp();

        const closeButton = new ButtonBuilder()
            .setCustomId(`close_ticket_${ticketId}`)
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger);

        const pingButton = new ButtonBuilder()
            .setCustomId(`ping_staff_${ticketId}`)
            .setLabel('Ping Staff')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(closeButton, pingButton);

        await ticketChannel.send({ 
            content: `${user}`, 
            embeds: [ticketEmbed], 
            components: [actionRow] 
        });

      
        try {
            const confirmEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setAuthor({ name: "Ticket Created!", iconURL: ticketIcons.correctIcon })
                .setDescription(`Your **${ticketType}** ticket has been created.`)
                .addFields({ name: 'Ticket Channel', value: `${ticketChannel.url}` })
                .setFooter({ text: 'Thank you for reaching out!', iconURL: ticketIcons.modIcon })
                .setTimestamp();

            await user.send({ embeds: [confirmEmbed] });
        } catch (err) {
            console.log(`Could not send DM to user ${user.tag}`);
        }

        return interaction.followUp({ 
            content: `✅ Your ticket has been created: ${ticketChannel}`,
            ephemeral: true 
        });
    } catch (err) {
        console.error(`Error creating ticket for ${user.tag}:`, err);
        return interaction.followUp({ 
            content: '❌ Failed to create your ticket. Please try again later.',
            ephemeral: true 
        });
    }
}


async function handleTicketClose(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const ticketId = interaction.customId.replace('close_ticket_', '');
    const [userId, channelId] = ticketId.split('-');
    const { guild, user } = interaction;

  
    const isTicketOwner = userId === user.id;
    const config = await TicketConfig.findOne({ serverId: guild.id });
    
    if (!config) {
        return interaction.followUp({ 
            content: '❌ Ticket configuration not found.',
            ephemeral: true 
        });
    }

    const isAdmin = interaction.member.roles.cache.has(config.adminRoleId) || 
                   user.id === config.ownerId || 
                   interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels);

    if (!isTicketOwner && !isAdmin) {
        return interaction.followUp({ 
            content: '❌ You do not have permission to close this ticket.',
            ephemeral: true 
        });
    }


    try {
        const transcriptAttachment = await generateTranscript(interaction.channel, client);
        
   
        const ticketOwner = await client.users.fetch(userId).catch(() => null);
        if (ticketOwner) {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setAuthor({ name: "Ticket Closed", iconURL: ticketIcons.correctIcon })
                .setDescription(`Your ticket in **${guild.name}** has been closed.`)
                .setTimestamp()
                .setFooter({ text: 'Thanks for using our support system!', iconURL: ticketIcons.modIcon });

            try {
                await ticketOwner.send({
                    content: 'Here is your ticket transcript:',
                    embeds: [dmEmbed],
                    files: [transcriptAttachment]
                });
            } catch (err) {
                console.warn(`Could not DM user ${ticketOwner.tag}:`, err.message);
            }
        }

       
        if (config.transcriptChannelId) {
            const logChannel = guild.channels.cache.get(config.transcriptChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('Ticket Closed')
                    .addFields(
                        { name: 'Ticket', value: interaction.channel.name, inline: true },
                        { name: 'Closed By', value: user.tag, inline: true },
                        { name: 'Original Owner', value: ticketOwner?.tag || 'Unknown', inline: true }
                    )
                    .setTimestamp();
                
                await logChannel.send({ 
                    content: `📩 Transcript from ticket ${interaction.channel.name}`,
                    embeds: [logEmbed],
                    files: [transcriptAttachment] 
                });
            }
        }

        await interaction.followUp({ 
            content: '✅ Ticket closing in 5 seconds...',
            ephemeral: true 
        });


setTimeout(async () => {
    try {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (channel) {
            await channel.delete();
            console.log(`Deleted ticket channel: ${channel.id}`);
        } else {
            console.warn(`Channel ${channelId} not found. Possibly already deleted.`);
        }

        await TicketUserData.deleteOne({ userId, guildId: guild.id });

     
        try {
            await fs.unlink(transcriptAttachment.attachment);
        } catch (err) {
            console.warn("Failed to delete transcript file:", err.message);
        }
    } catch (err) {
        console.error("Error while closing ticket:", err);
    }
}, 5000);

    } catch (err) {
        console.error("Error generating transcript:", err);
        return interaction.followUp({ 
            content: '❌ Failed to close ticket. Please try again.',
            ephemeral: true 
        });
    }
}
async function handleStaffPing(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const { guild, channel, member } = interaction;
    const configEntry = await TicketConfig.findOne({ serverId: guild.id });

    if (!configEntry || !configEntry.adminRoleId) {
        return interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('⚠️ Staff Role Not Configured')
                    .setDescription('Unable to ping staff as no admin role is set for tickets.')
            ],
            ephemeral: true
        });
    }

    const userData = await TicketUserData.findOne({ userId: member.id, guildId: guild.id });
    const now = new Date();

    if (userData?.lastPing && (now - userData.lastPing < 6 * 60 * 60 * 1000)) {
        const nextPing = new Date(userData.lastPing.getTime() + 6 * 60 * 60 * 1000);
        return interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🕒 Cooldown Active')
                    .setDescription(`You can ping staff again <t:${Math.floor(nextPing.getTime() / 1000)}:R>.`)
            ],
            ephemeral: true
        });
    }

    const staffPingEmbed = new EmbedBuilder()
    .setColor('Orange')
    .setAuthor({ name: "Staff Assistance Requested", iconURL: ticketIcons.pingIcon })
    .setDescription(`${member} has requested support in this ticket.`)
    .setFooter({ text: 'Notification sent via the ticket system', iconURL: member.displayAvatarURL() })
    .setTimestamp();


    await channel.send({
        content: `<@&${configEntry.adminRoleId}>`,
        embeds: [staffPingEmbed]
    });

    await TicketUserData.updateOne(
        { userId: member.id, guildId: guild.id },
        { $set: { lastPing: now } },
        { upsert: true }
    );

    const confirmationEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Staff Notified')
        .setDescription('A support team member has been notified and will assist you shortly.');

    await interaction.followUp({ embeds: [confirmationEmbed], ephemeral: true });
}
async function cleanupStaleTickets(client) {
    const allTickets = await TicketUserData.find({});
    for (const ticket of allTickets) {
        const guild = client.guilds.cache.get(ticket.guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(ticket.ticketChannelId);
        if (!channel) {
            await TicketUserData.deleteOne({ _id: ticket._id });
            console.log(`Cleaned up stale ticket for user ${ticket.userId} in guild ${ticket.guildId}`);
        }
    }
}
