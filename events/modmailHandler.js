const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField,
    ChannelType,
    AttachmentBuilder
} = require('discord.js');
const ModMailConfig = require('../models/modmail/ModMailConfig');
const OpenModMail = require('../models/modmail/OpenModMail');
const fs = require('fs').promises;
const path = require('path');


let configCache = {};
let lastConfigLoad = null;
const CONFIG_REFRESH_INTERVAL = 60000;


async function loadConfig() {
    try {
        const modmails = await ModMailConfig.find({});
        const newCache = {};

        for (const modmail of modmails) {
            newCache[modmail.guildId] = {
                logChannelId: modmail.logChannelId,
                adminRoleId: modmail.adminRoleId,
                status: modmail.status,
                ownerId: modmail.ownerId
            };
        }

        configCache = newCache;
        lastConfigLoad = Date.now();
        return configCache;
    } catch (err) {
        console.error('Error loading modmail configs:', err);
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
        console.log('Initializing modmail system...');
        await loadConfig();


        setInterval(() => loadConfig(), 15 * 60 * 1000);


        setInterval(() => cleanupStaleModMails(client), 30 * 60 * 1000);
    });


    client.on('messageCreate', async (message) => {

        if (message.author.bot) return;


        if (message.channel.type !== ChannelType.DM) return;

        await handleDmMessage(message, client);
    });


    client.on('interactionCreate', async (interaction) => {

        if (interaction.isStringSelectMenu() && interaction.customId === 'select_modmail_guild') {
            await handleGuildSelection(interaction, client);
        }

        else if (interaction.isButton() && interaction.customId.startsWith('close_modmail_')) {
            await handleModMailClose(interaction, client);
        }

        else if (interaction.isButton() && interaction.customId.startsWith('anon_reply_')) {
            await handleAnonymousReply(interaction, client);
        }
    });


    client.on('guildDelete', async (guild) => {
        try {

            await ModMailConfig.deleteOne({ guildId: guild.id });
            await OpenModMail.deleteMany({ guildId: guild.id });


            const config = await getConfig(true);
            delete config[guild.id];

            console.log(`Cleaned up modmail data for deleted guild: ${guild.name} (${guild.id})`);
        } catch (err) {
            console.error(`Error cleaning up data for deleted guild ${guild.id}:`, err);
        }
    });


    client.on('messageCreate', async (message) => {

        if (message.author.bot || !message.channel.isThread()) return;


        const modmail = await OpenModMail.findOne({ threadChannelId: message.channel.id });
        if (!modmail) return;


        await handleStaffReply(message, client, modmail);
    });
};


async function handleDmMessage(message, client) {
    const { author, content, attachments } = message;


    const userModMails = await OpenModMail.find({ userId: author.id });


    if (userModMails.length > 0) {
        for (const modmail of userModMails) {
            const guild = client.guilds.cache.get(modmail.guildId);
            if (!guild) continue;

            const threadChannel = guild.channels.cache.get(modmail.threadChannelId);
            if (!threadChannel) {

                await OpenModMail.deleteOne({ _id: modmail._id });
                continue;
            }


            await forwardMessageToStaff(message, threadChannel, author);
        }
        return;
    }


    const sharedGuilds = client.guilds.cache.filter(guild =>
        guild.members.cache.has(author.id) ||
        guild.members.fetch(author.id).catch(() => null)
    );

    if (sharedGuilds.size === 0) {

        return message.reply("❌ I couldn't find any servers we share. You need to be in a server with me to use ModMail.");
    }


    const config = await getConfig();
    const validGuilds = sharedGuilds.filter(guild =>
        config[guild.id] && config[guild.id].status === true
    );

    if (validGuilds.size === 0) {
        return message.reply("❌ ModMail is not enabled in any servers we share.");
    } else if (validGuilds.size === 1) {

        const guild = validGuilds.first();
        await createModMailThread(message, client, guild.id);
    } else {

        await sendGuildSelectionMenu(message, validGuilds);
    }
}


async function sendGuildSelectionMenu(message, validGuilds) {
    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📬 ModMail Server Selection')
        .setDescription('You are in multiple servers with me. Please select which server you want to contact:')
        .setFooter({ text: 'Your message will be sent after you select a server' })
        .setTimestamp();

    const options = validGuilds.map(guild => ({
        label: guild.name,
        description: `Send ModMail to ${guild.name}`,
        value: guild.id
    }));

    const menu = new StringSelectMenuBuilder()
        .setCustomId('select_modmail_guild')
        .setPlaceholder('Choose a server')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    try {
        await message.reply({ embeds: [embed], components: [row] });
    } catch (err) {
        console.error('Error sending guild selection menu:', err);
        await message.reply('❌ There was an error processing your request. Please try again later.');
    }
}


async function handleGuildSelection(interaction, client) {
    await interaction.deferUpdate();

    const guildId = interaction.values[0];
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        return interaction.followUp({
            content: '❌ Selected server not found. Please try again.',
            ephemeral: true
        });
    }


    const originalMessage = interaction.message.reference?.messageId;
    if (!originalMessage) {
        return interaction.followUp({
            content: "❌ Couldn't find your original message. Please send a new message.",
            ephemeral: true
        });
    }

    try {
        const dmChannel = await interaction.user.createDM();
        const originalDmMessage = await dmChannel.messages.fetch(originalMessage);


        await createModMailThread(originalDmMessage, client, guildId);


        const updatedEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ ModMail Sent')
            .setDescription(`Your message has been sent to the staff of **${guild.name}**`)
            .setTimestamp();

        await interaction.message.edit({
            embeds: [updatedEmbed],
            components: []
        });
    } catch (err) {
        console.error('Error handling guild selection:', err);
        return interaction.followUp({
            content: '❌ Failed to create your ModMail. Please try again later.',
            ephemeral: true
        });
    }
}


async function createModMailThread(message, client, guildId) {
    const { author, content, attachments } = message;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        return message.reply('❌ Server not found. Please try again.');
    }


    const config = await getConfig();
    const guildConfig = config[guildId];

    if (!guildConfig || !guildConfig.status) {
        return message.reply('❌ ModMail is not enabled in this server.');
    }


    const existingModMail = await OpenModMail.findOne({
        userId: author.id,
        guildId: guildId
    });

    if (existingModMail) {
        const existingThread = guild.channels.cache.get(existingModMail.threadChannelId);
        if (existingThread) {

            await forwardMessageToStaff(message, existingThread, author);
            return message.reply('✅ Your message has been forwarded to the staff team.');
        } else {

            await OpenModMail.deleteOne({ _id: existingModMail._id });
        }
    }


    const logChannel = guild.channels.cache.get(guildConfig.logChannelId);
    if (!logChannel) {
        return message.reply('❌ ModMail log channel not found. Please contact a server admin.');
    }

    try {

        const threadEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({
                name: `${author.tag} (${author.id})`,
                iconURL: author.displayAvatarURL()
            })
            .setTitle('📬 New ModMail')
            .setDescription('A new ModMail thread has been opened.')
            .addFields(
                { name: 'User', value: `<@${author.id}>`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(author.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'Reply in this thread to respond' })
            .setTimestamp();


        try {
            const member = await guild.members.fetch(author.id);
            if (member) {
                threadEmbed.addFields(
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    {
                        name: 'Roles', value: member.roles.cache.size > 1
                            ? member.roles.cache.filter(r => r.id !== guild.id).sort((a, b) => b.position - a.position).map(r => `<@&${r.id}>`).join(', ').substring(0, 1024)
                            : 'None',
                        inline: false
                    }
                );
            }
        } catch (err) {
            console.warn(`Couldn't fetch member data for ${author.id}:`, err.message);
        }


        const thread = await logChannel.threads.create({
            name: `modmail-${author.username}`,
            autoArchiveDuration: 4320,
            reason: `ModMail from ${author.tag} (${author.id})`
        });


        const closeButton = new ButtonBuilder()
            .setCustomId(`close_modmail_${author.id}_${guildId}`)
            .setLabel('Close ModMail')
            .setStyle(ButtonStyle.Danger);

        const anonReplyButton = new ButtonBuilder()
            .setCustomId(`anon_reply_${author.id}_${guildId}`)
            .setLabel('Anonymous Reply')
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().addComponents(closeButton, anonReplyButton);


        await thread.send({
            embeds: [threadEmbed],
            components: [actionRow]
        });


        await forwardMessageToStaff(message, thread, author);

        await OpenModMail.create({
            userId: author.id,
            guildId: guildId,
            threadChannelId: thread.id,
            openedAt: new Date()
        });


        await thread.send({
            content: `<@&${guildConfig.adminRoleId}>`
        });


        return message.reply('✅ Your message has been sent to the server staff. You will receive a reply here when they respond.');
    } catch (err) {
        console.error(`Error creating ModMail thread for ${author.tag}:`, err);
        return message.reply('❌ Failed to create ModMail. Please try again later.');
    }
}


async function forwardMessageToStaff(message, threadChannel, author) {

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({
            name: `${author.tag}`,
            iconURL: author.displayAvatarURL()
        })
        .setDescription(message.content || '*No message content*')
        .setFooter({ text: `User ID: ${author.id}` })
        .setTimestamp(message.createdAt);


    const files = [];
    message.attachments.forEach(attachment => {
        files.push(attachment.url);
    });


    try {
        await threadChannel.send({
            embeds: [embed],
            files: files.length > 0 ? files : undefined
        });
    } catch (err) {
        console.error(`Error forwarding message to staff thread:`, err);
    }
}


async function handleStaffReply(message, client, modmail) {

    if (message.author.id === modmail.userId) return;


    const guild = message.guild;
    const guildConfig = (await getConfig())[guild.id];

    if (!guildConfig) return;

    const member = message.member;
    const isAdmin = member.roles.cache.has(guildConfig.adminRoleId) ||
        member.id === guildConfig.ownerId ||
        member.permissions.has(PermissionsBitField.Flags.ManageGuild);

    if (!isAdmin) {
        return message.reply('❌ Only staff members can reply to ModMail threads.');
    }


    try {
        const user = await client.users.fetch(modmail.userId);


        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({
                name: `${message.member.displayName} (Staff)`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(message.content || '*No message content*')
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
            .setTimestamp();


        const files = [];
        message.attachments.forEach(attachment => {
            files.push(attachment.url);
        });


        await user.send({
            embeds: [embed],
            files: files.length > 0 ? files : undefined
        });


        await message.react('✅');
    } catch (err) {
        console.error(`Error forwarding staff reply to user:`, err);
        await message.reply('❌ Failed to send your reply to the user. They may have blocked the bot or closed their DMs.');
    }
}


async function handleAnonymousReply(interaction, client) {
    await interaction.showModal({
        title: 'Anonymous Reply',
        customId: `anon_reply_modal_${interaction.customId.replace('anon_reply_', '')}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customId: 'anon_reply_content',
                        label: 'Message',
                        style: 2,
                        placeholder: 'Enter your anonymous reply here...',
                        required: true,
                        min_length: 1,
                        max_length: 4000
                    }
                ]
            }
        ]
    });


    const filter = i => i.customId.startsWith('anon_reply_modal_');
    try {
        const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300000 });
        await modalInteraction.deferUpdate();

        const [userId, guildId] = interaction.customId.replace('anon_reply_', '').split('_');
        const content = modalInteraction.fields.getTextInputValue('anon_reply_content');

        const user = await client.users.fetch(userId);
        const guild = client.guilds.cache.get(guildId);

        if (!user || !guild) {
            return modalInteraction.followUp({
                content: '❌ User or guild not found.',
                ephemeral: true
            });
        }


        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({
                name: 'Server Staff',
                iconURL: guild.iconURL()
            })
            .setDescription(content)
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
            .setTimestamp();

        await user.send({ embeds: [embed] });


        const confirmEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({
                name: `Anonymous Reply from ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(content)
            .setFooter({ text: 'This message was sent anonymously' })
            .setTimestamp();

        await interaction.message.channel.send({ embeds: [confirmEmbed] });

        return modalInteraction.followUp({
            content: '✅ Anonymous reply sent.',
            ephemeral: true
        });
    } catch (err) {
        console.error('Error handling anonymous reply:', err);
        if (err.name === 'Error [InteractionCollectorError]') return;

        return interaction.followUp({
            content: '❌ Failed to send anonymous reply. Please try again.',
            ephemeral: true
        }).catch(() => { });
    }
}


async function handleModMailClose(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const [userId, guildId] = interaction.customId.replace('close_modmail_', '').split('_');
    const { guild, channel, member } = interaction;


    const config = await ModMailConfig.findOne({ guildId: guild.id });

    if (!config) {
        return interaction.followUp({
            content: '❌ ModMail configuration not found.',
            ephemeral: true
        });
    }

    const isAdmin = member.roles.cache.has(config.adminRoleId) ||
        member.id === config.ownerId ||
        member.permissions.has(PermissionsBitField.Flags.ManageGuild);

    if (!isAdmin) {
        return interaction.followUp({
            content: '❌ You do not have permission to close this ModMail.',
            ephemeral: true
        });
    }


    try {

        const modmailData = await OpenModMail.findOne({
            userId,
            guildId: guild.id
        });

        if (!modmailData) {
            return interaction.followUp({
                content: '❌ ModMail data not found.',
                ephemeral: true
            });
        }


        const messages = await channel.messages.fetch({ limit: 100 });
        const transcript = Array.from(messages.values())
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            .map(m => {
                let content = m.content;


                if (m.embeds.length > 0) {
                    const embedsContent = m.embeds.map(e => {
                        let text = '';
                        if (e.author?.name) text += `**${e.author.name}**\n`;
                        if (e.description) text += `${e.description}\n`;
                        return text;
                    }).join('\n');

                    if (embedsContent.trim()) {
                        content += (content ? '\n' : '') + embedsContent;
                    }
                }


                return `[${m.createdAt.toISOString()}] ${m.author.tag}${m.author.bot ? ' [BOT]' : ''}: ${content}`;
            })
            .join('\n\n');


        const transcriptPath = path.join(__dirname, '..', 'temp', `modmail-${userId}-${Date.now()}.txt`);
        await fs.mkdir(path.dirname(transcriptPath), { recursive: true });
        await fs.writeFile(transcriptPath, transcript);

        const transcriptAttachment = new AttachmentBuilder()
            .setFile(transcriptPath)
            .setName(`modmail-transcript-${userId}.txt`);


        try {
            const user = await client.users.fetch(userId);
            const closedEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('📬 ModMail Closed')
                .setDescription(`Your ModMail with **${guild.name}** has been closed by a staff member.`)
                .setFooter({ text: 'You can send a new message to create another ModMail.' })
                .setTimestamp();

            await user.send({
                embeds: [closedEmbed],
                files: [transcriptAttachment]
            });
        } catch (err) {
            console.warn(`Could not notify user ${userId} of ModMail closure:`, err.message);
        }


        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📬 ModMail Closed')
            .addFields(
                { name: 'User', value: `<@${userId}>`, inline: true },
                { name: 'Closed By', value: member.user.tag, inline: true },
                { name: 'Thread', value: channel.name, inline: true }
            )
            .setTimestamp();

        await channel.send({
            embeds: [logEmbed],
            files: [transcriptAttachment]
        });


        await OpenModMail.deleteOne({ _id: modmailData._id });

        await interaction.followUp({
            content: '✅ ModMail closed successfully. Thread will be archived.',
            ephemeral: true
        });


        await channel.setArchived(true, 'ModMail closed');


        setTimeout(async () => {
            try {
                await fs.unlink(transcriptPath);
            } catch (err) {
                console.warn("Failed to delete transcript file:", err.message);
            }
        }, 5000);

    } catch (err) {
        console.error("Error closing modmail:", err);
        return interaction.followUp({
            content: '❌ Failed to close ModMail. Please try again.',
            ephemeral: true
        });
    }
}


async function cleanupStaleModMails(client) {
    const allModMails = await OpenModMail.find({});

    for (const modmail of allModMails) {
        const guild = client.guilds.cache.get(modmail.guildId);
        if (!guild) {
            await OpenModMail.deleteOne({ _id: modmail._id });
            console.log(`Cleaned up modmail for deleted guild: ${modmail.guildId}`);
            continue;
        }

        const threadChannel = guild.channels.cache.get(modmail.threadChannelId);
        if (!threadChannel) {
            await OpenModMail.deleteOne({ _id: modmail._id });
            console.log(`Cleaned up stale modmail thread for user ${modmail.userId} in guild ${modmail.guildId}`);
        }
    }
}