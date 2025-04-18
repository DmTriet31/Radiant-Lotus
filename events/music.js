const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const lavalinkConfig = require('../lavalink');
const { dynamicCard } = require("../UI/dynamicCard");
const path = require("path");
const axios = require('axios');
const musicIcons = require('../UI/icons/musicicons');
const { Riffy } = require('riffy');
const { autoplayCollection } = require('../mongodb');


const messageManager = {
    trackMessages: new Map(),
    lyricsMessages: new Map(),
    queueMessages: new Map(), 
    lastEmbeds: new Map(),    
    
  
    addMessage: function(guildId, messageId, channelId, type) {
        const messageData = { messageId, channelId, type };
        
        switch(type) {
            case 'track':
                this.trackMessages.set(guildId, messageData);
                break;
            case 'lyrics':
                this.lyricsMessages.set(guildId, messageData);
                break;
            case 'queue':
                this.queueMessages.set(guildId, messageData);
                break;
            case 'lastEmbed':
                this.lastEmbeds.set(guildId, messageData);
                break;
        }
    },
    
    
    async cleanupGuildMessages(client, guildId, types = ['track', 'lyrics', 'queue', 'lastEmbed']) {
        const promises = [];
        const collections = {
            'track': this.trackMessages,
            'lyrics': this.lyricsMessages,
            'queue': this.queueMessages,
            'lastEmbed': this.lastEmbeds
        };
        
      
        for (const type of types) {
            if (collections[type] && collections[type].has(guildId)) {
                const msgData = collections[type].get(guildId);
                promises.push(this.deleteOrDisableMessage(client, msgData));
                collections[type].delete(guildId);
            }
        }
        
        await Promise.allSettled(promises);
    },
    
  
    async deleteOrDisableMessage(client, messageData) {
        if (!messageData) return;
        
        const { messageId, channelId } = messageData;
        const channel = client.channels.cache.get(channelId);
        if (!channel) return;
        
        try {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message) return;
            
            try {
              
                await message.delete();
            } catch (deleteErr) {
               
                if (message.components && message.components.length > 0) {
                    const disabledComponents = message.components.map(row => 
                        new ActionRowBuilder().addComponents(
                            row.components.map(component => 
                                ButtonBuilder.from(component).setDisabled(true)
                            )
                        )
                    );
                    await message.edit({ components: disabledComponents });
                }
            }
        } catch (err) {
            console.warn(`Failed to clean up message: ${err.message}`);
        }
    }
};


const lyricIntervals = new Map();
const queueDisplayTimeouts = new Map(); 

module.exports = (client) => {
    if (lavalinkConfig.enabled) {
        const nodes = [
            {
                host: lavalinkConfig.lavalink.host,
                password: lavalinkConfig.lavalink.password,
                port: lavalinkConfig.lavalink.port,
                secure: lavalinkConfig.lavalink.secure
            }
        ];

        client.riffy = new Riffy(client, nodes, {
            send: (payload) => {
                const guild = client.guilds.cache.get(payload.d.guild_id);
                if (guild) guild.shard.send(payload);
            },
            defaultSearchPlatform: "ytmsearch",
            restVersion: "v4",
        });

        client.riffy.on('nodeConnect', (node) => {
            console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.name}\x1b[0m`);
        });

        client.riffy.on('nodeError', (node, error) => {
            console.error(`\x1b[31m[ LAVALINK ]\x1b[0m Node \x1b[32m${node.name}\x1b[0m had an error: \x1b[33m${error.message}\x1b[0m`);
        });

   
        client.on('voiceStateUpdate', async (oldState, newState) => {
    
            if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
                const player = client.riffy.players.get(oldState.guild.id);
                if (player) {
                  
                    await messageManager.cleanupGuildMessages(client, oldState.guild.id);
                    
                
                    if (lyricIntervals.has(oldState.guild.id)) {
                        clearInterval(lyricIntervals.get(oldState.guild.id));
                        lyricIntervals.delete(oldState.guild.id);
                    }
                    
                
                    if (queueDisplayTimeouts.has(oldState.guild.id)) {
                        clearTimeout(queueDisplayTimeouts.get(oldState.guild.id));
                        queueDisplayTimeouts.delete(oldState.guild.id);
                    }
                    
                
                    player.destroy();
                }
            }
           
            if (
                oldState.channelId && 
                oldState.channelId === newState.guild.me?.voice?.channelId &&
                newState.guild.channels.cache.get(oldState.channelId)?.members.size === 1 &&
                newState.guild.channels.cache.get(oldState.channelId)?.members.has(client.user.id)
            ) {
                const player = client.riffy.players.get(oldState.guild.id);
                if (player) {
                   
                    await messageManager.cleanupGuildMessages(client, oldState.guild.id);
                    
               
                    if (lyricIntervals.has(oldState.guild.id)) {
                        clearInterval(lyricIntervals.get(oldState.guild.id));
                        lyricIntervals.delete(oldState.guild.id);
                    }
                    
                
                    if (queueDisplayTimeouts.has(oldState.guild.id)) {
                        clearTimeout(queueDisplayTimeouts.get(oldState.guild.id));
                        queueDisplayTimeouts.delete(oldState.guild.id);
                    }
                    
                 
                    player.destroy();
                    const channel = client.channels.cache.get(player.textChannel);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setDescription("👋 Left voice channel since everyone left.")
                            .setColor('#ff9900');
                        
                        channel.send({ embeds: [embed] }).then(msg => {
                            setTimeout(() => msg.delete().catch(() => {}), 10000);
                        });
                    }
                }
            }
        });

        client.riffy.on('trackStart', async (player, track) => {
            const channel = client.channels.cache.get(player.textChannel);
            const guildId = player.guildId;
            
      
            await messageManager.cleanupGuildMessages(client, guildId);
            
            function formatTime(ms) {
                if (!ms || ms === 0) return "0:00";
                const totalSeconds = Math.floor(ms / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${hours > 0 ? hours + ":" : ""}${minutes.toString().padStart(hours > 0 ? 2 : 1, "0")}:${seconds.toString().padStart(2, "0")}`;
            }

            try {
             
                const cardImage = await dynamicCard({
                    thumbnailURL: track.info.thumbnail,
                    songTitle: track.info.title,
                    songArtist: track.info.author,
                    trackRequester: track.requester ? track.requester.username : "All In One",
                    fontPath: path.join(__dirname, "../UI", "fonts", "AfacadFlux-Regular.ttf"),
                    backgroundColor: "#FF00FF",
                });
        
                const attachment = new AttachmentBuilder(cardImage, { name: 'songcard.png' });
        
                const description = `- Title: ${track.info.title} \n`+
                ` - Artist: ${track.info.author} \n`+
                ` - Length: ${formatTime(track.info.length)} (\`${track.info.length}ms\`) \n`+
                ` - Stream: ${track.info.stream ? "Yes" : "No"} \n`+
                ` - Seekable: ${track.info.seekable ? "Yes" : "No"} \n`+
                ` - URI: [Link](${track.info.uri}) \n`+
                ` - Source: ${track.info.sourceName} \n`+ 
                ` - Requested by: ${track.requester ? `<@${track.requester.id}>` : "Unknown"}`; 
                
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Now Playing..", iconURL: musicIcons.playerIcon, url: "https://discord.gg/xQF9f9yUEM" })
                    .setDescription(description)
                    .setImage('attachment://songcard.png')
                    .setFooter({ text: 'Let the Beat Drop!', iconURL: musicIcons.footerIcon })
                    .setColor('#00c3ff');
        
              
                let components = [];
                if (track.requester && track.requester.id) {
                    const buttonsRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`volume_up_${track.requester.id}`).setEmoji('🔊').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`volume_down_${track.requester.id}`).setEmoji('🔉').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`pause_${track.requester.id}`).setEmoji('⏸️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`resume_${track.requester.id}`).setEmoji('▶️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`skip_${track.requester.id}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
                    );
        
                    const buttonsRow2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`stop_${track.requester.id}`).setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId(`clear_queue_${track.requester.id}`).setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`show_queue_${track.requester.id}`).setEmoji('📜').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`Lyrics_${track.requester.id}`).setEmoji('🎤').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId(`loop_${track.requester.id}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary)
                    );
        
                    components = [buttonsRow, buttonsRow2];
                }
                
                const message = await channel.send({
                    embeds: [embed],
                    files: [attachment],
                    components: components
                });
                
               
                messageManager.addMessage(guildId, message.id, channel.id, 'track');
                player.currentMessageId = message.id;
            } catch (error) {
                console.error('Error creating or sending song card:', error);
            }
        });
        
      
        client.riffy.on('trackEnd', async (player) => {
            const guildId = player.guildId;
            
           
            await messageManager.cleanupGuildMessages(client, guildId, ['track']);
            
           
            if (lyricIntervals.has(guildId)) {
                clearInterval(lyricIntervals.get(guildId));
                lyricIntervals.delete(guildId);
            }
        });

        client.riffy.on("queueEnd", async (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            const guildId = player.guildId;
            
        
            await messageManager.cleanupGuildMessages(client, guildId);
            
           
            if (lyricIntervals.has(guildId)) {
                clearInterval(lyricIntervals.get(guildId));
                lyricIntervals.delete(guildId);
            }
            
           
            if (queueDisplayTimeouts.has(guildId)) {
                clearTimeout(queueDisplayTimeouts.get(guildId));
                queueDisplayTimeouts.delete(guildId);
            }
            
            const result = await autoplayCollection.findOne({ guildId });
            const autoplay = result ? result.autoplay : false;
            
            if (autoplay) {
                player.autoplay(player);
            } else {
                player.destroy();
                
               
                const queueEndMessage = await channel.send({ 
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("🎵 Queue has ended.")
                            .setColor('#00c3ff')
                    ]
                });
                
              
                messageManager.addMessage(guildId, queueEndMessage.id, channel.id, 'lastEmbed');
                
               
                setTimeout(() => {
                    queueEndMessage.delete().catch(() => {});
                    messageManager.lastEmbeds.delete(guildId);
                }, 10000);
            }
        });

        
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;
        
            const parts = interaction.customId.split('_');
            const userId = parts.pop();        
            const action = parts.join('_');   
        
            const match = interaction.customId.match(/^(volume_up|volume_down|pause|resume|skip|stop|clear_queue|show_queue|Lyrics|loop)_(\d{17,})$/);
            if (!match) return;
        
            if (interaction.user.id !== userId) {
                return interaction.reply({ content: '⚠️ You are not authorized to control this music session.', ephemeral: true });
            }
        
            const player = client.riffy.players.get(interaction.guildId);
            if (!player) {
                try {
                    await interaction.deferReply({ ephemeral: true });
                    await interaction.editReply({ content: '⚠️ Music player not found. The session may have ended.' });
                } catch (err) {
                    if (err.code !== 10062) console.error('Defer error:', err);
                }
                return;
            }
        
            try {
                await interaction.deferReply({ ephemeral: true });
            } catch (err) {
                if (err.code !== 10062) return;
            }
        
            try {
                switch (action) {
                    case 'volume_up':
                        player.setVolume(Math.min(player.volume + 10, 100));
                        await interaction.editReply('🔊 Volume increased!');
                        break;
        
                    case 'volume_down':
                        player.setVolume(Math.max(player.volume - 10, 0));
                        await interaction.editReply('🔉 Volume decreased!');
                        break;
        
                    case 'pause':
                        player.pause(true);
                        await interaction.editReply('⏸️ Player paused.');
                        break;
        
                    case 'resume':
                        player.pause(false);
                        await interaction.editReply('▶️ Player resumed.');
                        break;
        
                    case 'skip':
                     
                        await messageManager.cleanupGuildMessages(client, interaction.guildId);
                        player.stop();
                        await interaction.editReply('⏭️ Skipped to the next track.');
                        break;
        
                    case 'stop': {
                     
                        await messageManager.cleanupGuildMessages(client, interaction.guildId);
                        
                       
                        if (lyricIntervals.has(interaction.guildId)) {
                            clearInterval(lyricIntervals.get(interaction.guildId));
                            lyricIntervals.delete(interaction.guildId);
                        }
                        
                       
                        if (queueDisplayTimeouts.has(interaction.guildId)) {
                            clearTimeout(queueDisplayTimeouts.get(interaction.guildId));
                            queueDisplayTimeouts.delete(interaction.guildId);
                        }
                        
                        player.destroy();
                        
                  
                        const channel = client.channels.cache.get(player.textChannel);
                        if (channel) {
                            const stopMessage = await channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription("⏹️ Music playback stopped.")
                                        .setColor('#ff0000')
                                ]
                            });
                            
                            
                            messageManager.addMessage(interaction.guildId, stopMessage.id, channel.id, 'lastEmbed');
                            
                          
                            setTimeout(() => {
                                stopMessage.delete().catch(() => {});
                                messageManager.lastEmbeds.delete(interaction.guildId);
                            }, 10000);
                        }
                        
                        await interaction.editReply('⏹️ Stopped the music and disconnected.');
                        break;
                    }
        
                    case 'clear_queue':
                        player.queue.clear();
                        await interaction.editReply('🗑️ Queue cleared.');
                        break;
    
                    case 'Lyrics': {
                        const channel = client.channels.cache.get(player.textChannel);
                        if (!channel) {
                            await interaction.editReply('⚠️ Could not find the music text channel.');
                            break;
                        }
                        await showLyrics(client, channel, player);
                        await interaction.editReply('Checking Lyrics...');
                        break;
                    }
        
                    case 'loop':
                        const loopMode = player.loop === 'none' ? 'track' : player.loop === 'track' ? 'queue' : 'none';
                        player.setLoop(loopMode);
                        await interaction.editReply(`🔁 Loop mode set to: **${loopMode}**.`);
                        break;
        
                    case 'show_queue':
                        if (!player.queue || player.queue.length === 0) {
                            await interaction.editReply('❌ The queue is empty.');
                        } else {
                         
                            await messageManager.cleanupGuildMessages(client, interaction.guildId, ['queue']);
                            
                          
                            const channel = client.channels.cache.get(player.textChannel);
                            if (!channel) {
                                await interaction.editReply('⚠️ Could not find the music text channel.');
                                break;
                            }
                            
                            const queueEmbed = new EmbedBuilder()
                                .setTitle("🎵 Current Queue")
                                .setColor('#00c3ff');
                        
                          
                            const queueItems = player.queue.slice(0, 10).map((track, i) => 
                                `${i + 1}. **${track.info.title}** - ${track.info.author}`
                            );
                            
                            if (player.queue.length > 10) {
                                queueItems.push(`... and ${player.queue.length - 10} more tracks`);
                            }
                            
                            queueEmbed.setDescription(queueItems.join('\n'));
                            
                          
                            const queueMessage = await channel.send({ embeds: [queueEmbed] });
                            messageManager.addMessage(interaction.guildId, queueMessage.id, channel.id, 'queue');
                            
                         
                            if (queueDisplayTimeouts.has(interaction.guildId)) {
                                clearTimeout(queueDisplayTimeouts.get(interaction.guildId));
                            }
                            
                            const timeout = setTimeout(() => {
                                queueMessage.delete().catch(() => {});
                                messageManager.queueMessages.delete(interaction.guildId);
                                queueDisplayTimeouts.delete(interaction.guildId);
                            }, 30000);
                            
                            queueDisplayTimeouts.set(interaction.guildId, timeout);
                            
                            await interaction.editReply('📜 Queue displayed in channel.');
                        }
                        break;
        
                    default:
                        await interaction.editReply('❌ Unknown action.');
                        break;
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.editReply('❌ Something went wrong.');
            }
        });
        
       
        client.on('error', async (error) => {
          
            if (error.message.includes('voice') || error.message.includes('connection')) {
             
                for (const [guildId, player] of client.riffy.players) {
                    await messageManager.cleanupGuildMessages(client, guildId);
                    
                  
                    if (lyricIntervals.has(guildId)) {
                        clearInterval(lyricIntervals.get(guildId));
                        lyricIntervals.delete(guildId);
                    }
                   
                    if (queueDisplayTimeouts.has(guildId)) {
                        clearTimeout(queueDisplayTimeouts.get(guildId));
                        queueDisplayTimeouts.delete(guildId);
                    }
                    
                    player.destroy();
                }
            }
        });
        
        async function getLyrics(trackName, artistName, duration) {
            try {
             
                trackName = trackName
                    .replace(/\b(Official|Audio|Video|Lyrics|Theme|Soundtrack|Music|Full Version|HD|4K|Visualizer|Radio Edit|Live|Remix|Mix|Extended|Cover|Parody|Performance|Version|Unplugged|Reupload)\b/gi, "") 
                    .replace(/\s*[-_/|]\s*/g, " ") 
                    .replace(/\s+/g, " ") 
                    .trim();
        
               
                artistName = artistName
                    .replace(/\b(Topic|VEVO|Records|Label|Productions|Entertainment|Ltd|Inc|Band|DJ|Composer|Performer)\b/gi, "")
                    .replace(/ x /gi, " & ") 
                    .replace(/\s+/g, " ") 
                    .trim();
        
               
                let response = await axios.get(`https://lrclib.net/api/get`, {
                    params: { track_name: trackName, artist_name: artistName, duration },
                    timeout: 5000 
                });
        
                if (response.data.syncedLyrics || response.data.plainLyrics) {
                    return response.data.syncedLyrics || response.data.plainLyrics;
                }
        
              
                response = await axios.get(`https://lrclib.net/api/get`, {
                    params: { track_name: trackName, artist_name: artistName },
                    timeout: 5000
                });
        
                return response.data.syncedLyrics || response.data.plainLyrics;
            } catch (error) {
                console.error("❌ Lyrics fetch error:", error.response?.data?.message || error.message);
                return null;
            }
        }
        
        async function showLyrics(client, channel, player) {
            const guildId = player.guildId;
            
          
            await messageManager.cleanupGuildMessages(client, guildId, ['lyrics']);
            
          
            if (lyricIntervals.has(guildId)) {
                clearInterval(lyricIntervals.get(guildId));
                lyricIntervals.delete(guildId);
            }
            
            if (!player || !player.current || !player.current.info) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription("🚫 **No song is currently playing.**")
                    .setColor('#ff0000');
                
                const errorMsg = await channel.send({ embeds: [errorEmbed] });
                
             
                messageManager.addMessage(guildId, errorMsg.id, channel.id, 'lastEmbed');
                
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                    messageManager.lastEmbeds.delete(guildId);
                }, 5000);
                
                return;
            }
        
            const track = player.current.info;
            const lyrics = await getLyrics(track.title, track.author, Math.floor(track.length / 1000));
        
            if (!lyrics) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription("❌ **Lyrics not found!**")
                    .setColor('#ff0000');
                
                const errorMsg = await channel.send({ embeds: [errorEmbed] });
                
                
                messageManager.addMessage(guildId, errorMsg.id, channel.id, 'lastEmbed');
                
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                    messageManager.lastEmbeds.delete(guildId);
                }, 5000);
                
                return;
            }
        
            const lines = lyrics.split('\n').map(line => line.trim()).filter(Boolean);
            const songDuration = Math.floor(track.length / 1000); 
        
            const embed = new EmbedBuilder()
                .setTitle(`🎵 Live Lyrics: ${track.title}`)
                .setDescription("🔄 Syncing lyrics...")
                .setColor('#00c3ff');
        
            const stopButton = new ButtonBuilder()
                .setCustomId("stopLyrics")
                .setLabel("Stop Lyrics")
                .setStyle(ButtonStyle.Danger);
        
            const fullButton = new ButtonBuilder()
                .setCustomId("fullLyrics")
                .setLabel("Full Lyrics")
                .setStyle(ButtonStyle.Primary);
        
            const row = new ActionRowBuilder().addComponents(fullButton, stopButton);
            
            const message = await channel.send({ embeds: [embed], components: [row] });
            
          
            messageManager.addMessage(guildId, message.id, channel.id, 'lyrics');
        
            const updateLyrics = async () => {
                try {
                 
                    if (!client.riffy.players.has(guildId) || !player.current) {
                        if (lyricIntervals.has(guildId)) {
                            clearInterval(lyricIntervals.get(guildId));
                            lyricIntervals.delete(guildId);
                        }
                        await messageManager.cleanupGuildMessages(client, guildId, ['lyrics']);
                        return;
                    }
                    
                    const currentTime = Math.floor(player.position / 1000); 
                    const totalLines = lines.length;
            
                   
                    const linesPerSecond = totalLines / songDuration; 
                    const currentLineIndex = Math.floor(currentTime * linesPerSecond); 
            
                    const start = Math.max(0, currentLineIndex - 3);
                    const end = Math.min(totalLines, currentLineIndex + 4);
                    const visibleLines = lines.slice(start, end).join('\n');
            
                    embed.setDescription(visibleLines);
                    
                    try {
                        const msg = await channel.messages.fetch(message.id);
                        if (msg) {
                            await msg.edit({ embeds: [embed] });
                        } else {
                        
                            if (lyricIntervals.has(guildId)) {
                                clearInterval(lyricIntervals.get(guildId));
                                lyricIntervals.delete(guildId);
                            }
                            messageManager.lyricsMessages.delete(guildId);
                        }
                    } catch (err) {
                     
                        if (lyricIntervals.has(guildId)) {
                            clearInterval(lyricIntervals.get(guildId));
                            lyricIntervals.delete(guildId);
                        }
                        messageManager.lyricsMessages.delete(guildId);
                    }
                } catch (err) {
                    console.error("Error updating lyrics:", err);
                 
                    if (lyricIntervals.has(guildId)) {
                        clearInterval(lyricIntervals.get(guildId));
                        lyricIntervals.delete(guildId);
                    }
                    messageManager.lyricsMessages.delete(guildId);
                }
            };
        
    
            const interval = setInterval(updateLyrics, 3000);
            lyricIntervals.set(guildId, interval);
            
         
            updateLyrics(); 
        
            const collector = message.createMessageComponentCollector({ time: 600000 });
        
            collector.on('collect', async i => {
                await i.deferUpdate();
            
                if (i.customId === "stopLyrics") {
                    if (lyricIntervals.has(guildId)) {
                        clearInterval(lyricIntervals.get(guildId));
                        lyricIntervals.delete(guildId);
                    }
                    await message.delete().catch(() => {});
                    messageManager.lyricsMessages.delete(guildId);
                } else if (i.customId === "fullLyrics") {
                    if (lyricIntervals.has(guildId)) {
                        clearInterval(lyricIntervals.get(guildId));
                        lyricIntervals.delete(guildId);
                    }
                    
                    embed.setDescription(lines.join('\n'));
            
                    const deleteButton = new ButtonBuilder()
                        .setCustomId("deleteLyrics")
                        .setLabel("Delete")
                        .setStyle(ButtonStyle.Danger);
            
                    const deleteRow = new ActionRowBuilder().addComponents(deleteButton);
            
                    await message.edit({ embeds: [embed], components: [deleteRow] });
                } else if (i.customId === "deleteLyrics") {
                    await message.delete().catch(() => {});
                    messageManager.lyricsMessages.delete(guildId);
                }
            });
        
            collector.on('end', () => {
                if (lyricIntervals.has(guildId)) {
                    clearInterval(lyricIntervals.get(guildId));
                    lyricIntervals.delete(guildId);
                }
                message.delete().catch(() => {});
                messageManager.lyricsMessages.delete(guildId);
            });
        }
        
  
        client.riffy.on('playerDestroy', async (player) => {
            const guildId = player.guildId;
            
         
            await messageManager.cleanupGuildMessages(client, guildId);
            
        
            if (lyricIntervals.has(guildId)) {
                clearInterval(lyricIntervals.get(guildId));
                lyricIntervals.delete(guildId);
            }
       
            if (queueDisplayTimeouts.has(guildId)) {
                clearTimeout(queueDisplayTimeouts.get(guildId));
                queueDisplayTimeouts.delete(guildId);
            }
            
           
            if (player.textChannel) {
                const channel = client.channels.cache.get(player.textChannel);
                if (channel && player.wasDestroyed) {
                    const disconnectEmbed = new EmbedBuilder()
                        .setDescription("🔌 Music player disconnected.")
                        .setColor('#ff9900');
                    
                    const disconnectMsg = await channel.send({ embeds: [disconnectEmbed] });
                    
                  
                    setTimeout(() => {
                        disconnectMsg.delete().catch(() => {});
                    }, 10000);
                }
            }
        });
        
    
        client.riffy.on('trackError', async (player, track, error) => {
            console.error(`Track error in guild ${player.guildId}:`, error);
            
            const guildId = player.guildId;
            const channel = client.channels.cache.get(player.textChannel);
            
         
            await messageManager.cleanupGuildMessages(client, guildId);
            
       
            if (lyricIntervals.has(guildId)) {
                clearInterval(lyricIntervals.get(guildId));
                lyricIntervals.delete(guildId);
            }
            
    
            if (channel) {
                const errorEmbed = new EmbedBuilder()
                    .setDescription(`⚠️ Error playing: **${track.info.title}**\n${error.message || "Unknown error"}`)
                    .setColor('#ff0000');
                
                const errorMsg = await channel.send({ embeds: [errorEmbed] });
                
             
                messageManager.addMessage(guildId, errorMsg.id, channel.id, 'lastEmbed');
                
                setTimeout(() => {
                    errorMsg.delete().catch(() => {});
                    messageManager.lastEmbeds.delete(guildId);
                }, 10000);
            }
            
       
            if (player.queue.length > 0) {
                player.stop();
            }
        });
        
    
        client.on('voiceStateUpdate', async (oldState, newState) => {
     
            if (oldState.member.id === client.user.id && 
                oldState.channelId !== newState.channelId && 
                oldState.channelId && newState.channelId) {
                
                const player = client.riffy.players.get(oldState.guild.id);
                if (player) {
           
                    await messageManager.cleanupGuildMessages(client, oldState.guild.id, ['track']);
                    
                  
                    if (player.current) {
                        const channel = client.channels.cache.get(player.textChannel);
                        if (channel) {
                            const moveEmbed = new EmbedBuilder()
                                .setDescription(`🔄 Voice channel changed to <#${newState.channelId}>`)
                                .setColor('#00c3ff');
                            
                            const moveMsg = await channel.send({ embeds: [moveEmbed] });
                            
                           
                            setTimeout(() => {
                                moveMsg.delete().catch(() => {});
                            }, 5000);
                        }
                    }
                }
            }
        });

    
        const cleanupOrphanedResources = async () => {
            try {
            
                const guildsWithResources = new Set([
                    ...messageManager.trackMessages.keys(),
                    ...messageManager.lyricsMessages.keys(),
                    ...messageManager.queueMessages.keys(),
                    ...messageManager.lastEmbeds.keys(),
                    ...lyricIntervals.keys(),
                    ...queueDisplayTimeouts.keys()
                ]);
                
                for (const guildId of guildsWithResources) {
                
                    if (!client.riffy.players.has(guildId)) {
                
                        await messageManager.cleanupGuildMessages(client, guildId);
                       
                        if (lyricIntervals.has(guildId)) {
                            clearInterval(lyricIntervals.get(guildId));
                            lyricIntervals.delete(guildId);
                        }
                        
                        if (queueDisplayTimeouts.has(guildId)) {
                            clearTimeout(queueDisplayTimeouts.get(guildId));
                            queueDisplayTimeouts.delete(guildId);
                        }
                    }
                }
            } catch (error) {
                console.error("Error in cleanup routine:", error);
            }
        };
        
      
        setInterval(cleanupOrphanedResources, 5 * 60 * 1000);

        client.on('raw', d => client.riffy.updateVoiceState(d));
        
        client.once('ready', () => {
            client.riffy.init(client.user.id);
            console.log('\x1b[35m[ MUSIC ]\x1b[0m', '\x1b[32mLavalink Music System Active with Enhanced Cleanup ✅\x1b[0m');
            
          
            setTimeout(async () => {
                for (const guild of client.guilds.cache.values()) {
                    await messageManager.cleanupGuildMessages(client, guild.id);
                }
            }, 5000);
        });
    } else {
        console.log('\x1b[31m[ MUSIC ]\x1b[0m Lavalink Music System Disabled ❌');
    }
};