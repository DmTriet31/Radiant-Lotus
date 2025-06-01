const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { serverConfigCollection, stickyMessageCollection, autoResponderCollection } = require('../mongodb');
const configPath = path.join(__dirname, '..', 'config.json');
const lang = require('./loadLanguage');
const cmdIcons = require('../UI/icons/commandicons');
const { serverLevelingLogsCollection } = require('../mongodb');
const afkHandler = require('./afkHandler');
const { updateXp, getUserData } = require('../models/users');
const { getUserCommands } = require('../models/customCommands');
const { countingCollection } = require('../mongodb');
const stickyTimers = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        try {
            const { handleAFKRemoval, handleMentions } = afkHandler(client);
            await handleAFKRemoval(message);
            await handleMentions(message);
        } catch (afkError) {
            console.error('AFK handler error:', afkError);
        }

        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const content = message.content.toLowerCase().trim(); 
// === +1 legit handler ===
const fixedChannelId = '1376265301225635974'; // Kênh dùng lệnh +1 legit
if (channelId === fixedChannelId) {
    const legitRegex = /^\+1\s+legit\s+.+/i;
    if (legitRegex.test(message.content.trim())) {
        const emojis = ['<a:RL_62802:1376215865036636182>', '<a:RL_purpleheart:1376260413959835649>', '<a:RL_verifyanimated:1376262189077237770>'];
        try {
            for (const emoji of emojis) {
                await message.react(emoji);
            }
        } catch (error) {
            console.error('Lỗi khi thêm emoji +1 legit:', error);
        }
    }
}
// === auto react Locket ảnh/video trong kênh media ===
const mediaChannelId = '1376211397310021762'; // Kênh chứa ảnh/video chung
if (channelId === mediaChannelId) {
    const hasImage = message.attachments.some(att => att.contentType?.startsWith('image/'));
    const hasVideo = message.attachments.some(att => att.contentType?.startsWith('video/'));

    if (hasImage || hasVideo) {
        const mediaEmojis = ['<:RL_pepeiosgrowingheart:1376248392665268245>', '<a:RL_pinkheart:1376249583847477372>', '<a:RL_purpleheart:1376260413959835649>'];
        try {
            for (const emoji of mediaEmojis) {
                await message.react(emoji);
            }
        } catch (err) {
            console.error('Lỗi khi auto react ảnh/video:', err);
        }
    }
}
// === auto react kênh meme ===
const memeChannelId = '1376211393858113547'; // Kênh chứa meme
if (channelId === memeChannelId) {
    // Regex để kiểm tra có URL trong tin nhắn không
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasLink = urlRegex.test(message.content);
    const hasImage = message.attachments.some(att => att.contentType?.startsWith('image/'));
    const hasVideo = message.attachments.some(att => att.contentType?.startsWith('video/'));

    if (hasLink || hasImage || hasVideo) {
        const memeEmojis = ['<a:RL_monkey:1376247148974440571>', '<a:RL_SieuCapChichDien:1376215206765658265>', '<a:RL_Tom:1376234763387535470>'];
        try {
            for (const emoji of memeEmojis) {
                await message.react(emoji);
            }
        } catch (err) {
            console.error('Lỗi khi auto react meme:', err);
        }
    }
}
// === auto react kênh selfie ===
const selfieChannelId = '1376274067362942977'; // Kênh gửi ảnh selfie
if (channelId === selfieChannelId) {
    const isSelfie = message.attachments.some(att => att.contentType?.startsWith('image/'));

    if (isSelfie) {
        const selfieEmojis = ['<a:62802:1210522480901496863>', '<:RL_Ngai:1376217796148596798>', '<a:Yaemommy:1378721324876431361>'];
        try {
            for (const emoji of selfieEmojis) {
                await message.react(emoji);
            }
        } catch (err) {
            console.error('Lỗi khi auto react selfie:', err);
        }
    }
}
        const countingData = await countingCollection.findOne({ guildId });

        if (countingData && countingData.channelId === channelId && countingData.status) {
            const expectedCount = countingData.currentCount + 1;

            if (!/^\d+$/.test(content)) {
                await message.delete();
                return message.channel.send(`${message.author}, please only send numbers!`).then(msg => setTimeout(() => msg.delete(), 3000));
            }

            const userNumber = parseInt(content, 10);
            if (userNumber !== expectedCount) {
                await message.delete();
                return message.channel.send(`${message.author}, please follow the correct sequence! Next number should be **${expectedCount}**.`)
                    .then(msg => setTimeout(() => msg.delete(), 3000));
            }

            await countingCollection.updateOne(
                { guildId },
                { $set: { currentCount: userNumber } }
            );
        }
        try {
            const stickyMessage = await stickyMessageCollection.findOne({ guildId, channelId, active: true });

            if (stickyMessage) {
                if (!stickyTimers.has(channelId)) {
                    stickyTimers.set(channelId, true);
                    setTimeout(() => stickyTimers.delete(channelId), 3000);

                    if (stickyMessage.lastMessageId) {
                        try {
                            const oldMessage = await message.channel.messages.fetch(stickyMessage.lastMessageId);
                            if (oldMessage) await oldMessage.delete();
                        } catch (err) {
                            console.warn(`⚠️ Could not delete old sticky message in ${message.guild.name}.`);
                        }
                    }

                    let sentMessage;
                    if (stickyMessage.embed) {
                        const embed = EmbedBuilder.from(stickyMessage.embed);
                        sentMessage = await message.channel.send({ content: stickyMessage.content, embeds: [embed] });
                    } else {
                        sentMessage = await message.channel.send(stickyMessage.content);
                    }

                    await stickyMessageCollection.updateOne(
                        { guildId, channelId },
                        { $set: { lastMessageId: sentMessage.id } }
                    );
                }
            }
        } catch (stickyError) {
            console.error('Sticky message error:', stickyError);
        }
     
        try {
            const autoResponders = await autoResponderCollection.find({ guildId: message.guild.id }).toArray();

            if (autoResponders.length > 0) {

                for (const responder of autoResponders) {
                    if (!responder.status) continue;
                    if (!responder.channels.includes('all') && !responder.channels.includes(channelId)) continue;

                    let match = false;
                    if (responder.matchType === 'exact' && content === responder.trigger.toLowerCase()) match = true;
                    else if (responder.matchType === 'partial' && content.includes(responder.trigger.toLowerCase())) match = true;
                    else if (responder.matchType === 'whole' && content.trim() === responder.trigger.toLowerCase()) match = true;

                    if (match) {

                        if (responder.embedData) {
                            try {
                                const embed = new EmbedBuilder()
                                    .setTitle(responder.embedData.title || 'AutoResponder')
                                    .setDescription(responder.embedData.description || 'No description provided.')
                                    .setColor(responder.embedData.color || '#3498db');

                                if (responder.embedData.footer) embed.setFooter({ text: responder.embedData.footer });
                                if (responder.embedData.thumbnail) embed.setThumbnail(responder.embedData.thumbnail);
                                if (responder.embedData.image) embed.setImage(responder.embedData.image);

                                await message.reply({ embeds: [embed] });
                            } catch (embedError) {
                                console.error('AutoResponder Embed Error:', embedError);
                                await message.reply('❌ Invalid embed format. Please check your response settings.');
                            }
                        } else {
                            await message.reply(responder.textResponse || '✅ AutoResponder triggered!');
                        }
                    }
                }
            } else {
                //console.log('[DEBUG] No AutoResponders found.');
            }
        } catch (autoResponderError) {
            //console.error('AutoResponder error:', autoResponderError);
        }
   
        try {
            if (message.author.bot) return;
            const serverLevelingConfig = await serverLevelingLogsCollection.findOne({ serverId: guildId });

            if (serverLevelingConfig && serverLevelingConfig.levelingEnabled) {
                let xpGain = 10;
                if (message.attachments.size > 0) xpGain += 5;
                if (/(https?:\/\/[^\s]+)/g.test(message.content)) xpGain += 5;

                const { xp, level } = await updateXp(message.author.id, xpGain);
                const oldLevel = Math.floor(0.1 * Math.sqrt(xp - xpGain));

                if (level > oldLevel) {
                    const logChannelId = serverLevelingConfig.levelLogsChannelId;
                    const logChannel = message.guild.channels.cache.get(logChannelId);

                    const embed = new EmbedBuilder()
                        .setColor('#1E90FF')
                        .setAuthor({ name: 'Level Up!', iconURL: cmdIcons.rippleIcon })
                        .setDescription(`🎉 **Congratulations, ${message.author}!**\nYou've reached **Level ${level}**!`)
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: '📊 Current Level', value: `**${level}**`, inline: true },
                            { name: '💫 XP Gained This Week', value: `**${(await getUserData(message.author.id)).weeklyXp || 0} XP**`, inline: true },
                            { name: '📈 Total XP', value: `**${xp} XP**`, inline: true },
                            { name: '✨ XP to Next Level', value: `**${Math.ceil(Math.pow((level + 1) / 0.1, 2) - xp)} XP**`, inline: true }
                        )
                        .setFooter({ text: 'Keep chatting to climb the leaderboard!', iconURL: cmdIcons.levelUpIcon })
                        .setTimestamp();

                    if (logChannel) {
                        await logChannel.send({ content: `${message.author}, you leveled up to **level ${level}!** 🎉`, embeds: [embed] });
                    } else {
                        await message.channel.send({ content: `🎉 **${message.author}, you leveled up to level ${level}!**`, embeds: [embed] });
                    }
                }
            }
        } catch (levelingError) {
            console.error('Leveling system error:', levelingError);
        }

        try {
            let config;
            try {
                const data = fs.readFileSync(configPath, 'utf8');
                config = JSON.parse(data);
            } catch (err) {
                return message.reply(lang.error);
            }

            const serverConfig = await serverConfigCollection.findOne({ serverId: guildId });
            const prefix = (serverConfig && serverConfig.prefix) || config.prefix;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const customCommands = await getUserCommands(message.author.id);
            const customCommand = customCommands.find(cmd => cmd.commandName === commandName);

            if (customCommand) {
                await message.reply(customCommand.response);
            }

            const command = client.commands.get(commandName);
            if (command) {
                await command.execute(message, args, client);
            }
        } catch (commandError) {
            //console.error('Custom command error:', commandError);
        }
    },
};
