
async function resolveYouTubeChannelId(identifier) {
    try {
    
        
   
        if (identifier.startsWith('UC') && identifier.length >= 20) {
            return identifier;
        }
        
     
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(identifier)}&part=snippet&type=channel&maxResults=1`;
        const searchResponse = await axios.get(searchUrl);
        
        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            return searchResponse.data.items[0].id.channelId;
        }
        
       
        if (!identifier.startsWith('@')) {
            identifier = '@' + identifier;
        }
        
        const customUrlSearchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(identifier)}&part=snippet&type=channel&maxResults=1`;
        const customUrlResponse = await axios.get(customUrlSearchUrl);
        
        if (customUrlResponse.data.items && customUrlResponse.data.items.length > 0) {
            return customUrlResponse.data.items[0].id.channelId;
        }
        
     
        return null;
    } catch (error) {
        //console.error(`Failed to resolve YouTube identifier "${identifier}":`, error.message);
        return null;
    }
}
const axios = require('axios');
const { notificationsCollection } = require('../mongodb');
const { EmbedBuilder } = require('discord.js');
const cmdIcons = require('../UI/icons/commandicons'); 
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const POLL_INTERVAL = 600000; 
const FALLBACK_THUMBNAIL = 'https://i.ibb.co/8Nq8kKr/youtube-thumbnails.jpg';
const MAX_RECENT_VIDEOS = 5; 

async function fetchLatestVideos(client) {
    const configs = await notificationsCollection.find({ type: 'youtube' }).toArray();

    for (const config of configs) {
        const { platformId, discordChannelId, guildId, lastNotifiedId, notifiedVideos = [], mentionRoles } = config;

     
        if (!platformId || !discordChannelId || !guildId) {
            console.error(`Missing essential data in YouTube notification config: ${JSON.stringify({platformId, discordChannelId, guildId})}`);
            continue;
        }

      
        let actualChannelId = platformId;
        if (!platformId.startsWith('UC') || platformId.length < 20) {
            //console.log(`"${platformId}" doesn't look like a valid channel ID, attempting to resolve...`);
            actualChannelId = await resolveYouTubeChannelId(platformId);
            
            if (!actualChannelId) {
                //console.error(`Could not resolve YouTube identifier "${platformId}" to a valid channel ID`);
                continue;
            } else if (actualChannelId !== platformId) {
                //console.log(`Resolved "${platformId}" to channel ID "${actualChannelId}"`);
                
               
                try {
                    await notificationsCollection.updateOne(
                        { guildId, type: 'youtube', platformId },
                        { $set: { 
                            platformId: actualChannelId,
                            lastResolvedAt: new Date()
                        }}
                    );
                    //console.log(`Updated database with resolved channel ID for "${platformId}"`);
                } catch (dbError) {
                    //console.error(`Failed to update resolved channel ID:`, dbError.message);
                }
            }
        }

        try {
            
            console.log(`Fetching videos for channel ID: ${actualChannelId}`);
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${actualChannelId}&part=snippet&type=video&order=date&maxResults=3`;
            
            const response = await axios.get(apiUrl);
            
            if (!response.data || !response.data.items) {
                //console.error(`Invalid response from YouTube API for channel: ${actualChannelId}`);
                continue;
            }

            const videos = response.data.items;
            if (!videos || videos.length === 0) continue;

       
            const sortedVideos = videos.sort((a, b) => 
                new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt)
            );

       
            const newNotifiedVideos = [...(notifiedVideos || [])];
            let updatedLastNotifiedId = lastNotifiedId;

            for (const video of sortedVideos) {
                const videoId = video.id.videoId;
                
               
                if (videoId === lastNotifiedId || notifiedVideos.includes(videoId)) {
                    continue;
                }

               
                const publishedAt = new Date(video.snippet.publishedAt);
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                
              
                if (publishedAt < oneDayAgo) {
                 
                    if (!newNotifiedVideos.includes(videoId)) {
                        newNotifiedVideos.push(videoId);
                    }
                    continue;
                }

                const channel = client.channels.cache.get(discordChannelId);
                if (channel) {
                    const thumbnailUrl = video.snippet.thumbnails?.high?.url || FALLBACK_THUMBNAIL;

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: 'New Video Uploaded!',
                            iconURL: cmdIcons.YouTubeIcon,
                            url: 'https://discord.gg/xQF9f9yUEM', 
                        })
                        .setDescription(`Check out the new Video : [${video.snippet.title}](https://www.youtube.com/watch?v=${videoId})`)
                        .setURL(`https://www.youtube.com/watch?v=${videoId}`)
                        .setColor('#FF0000')
                        .setImage(thumbnailUrl)
                        .addFields(
                            { name: 'Channel', value: video.snippet.channelTitle, inline: true },
                            {
                                name: 'Published At',
                                value: new Date(video.snippet.publishedAt).toLocaleString(),
                                inline: true,
                            }
                        )
                        .setFooter({
                            text: video.snippet.channelTitle,
                            iconURL: cmdIcons.msgIcon,
                        })
                        .setTimestamp();

                    const mentionText = mentionRoles && mentionRoles.length > 0
                        ? mentionRoles.map(roleId => `<@&${roleId}>`).join(' ')
                        : '';

                    try {
                        await channel.send({
                            content: mentionText,
                            embeds: [embed],
                        });
                        
                
                        updatedLastNotifiedId = videoId;
                        if (!newNotifiedVideos.includes(videoId)) {
                            newNotifiedVideos.push(videoId);
                        }
                        
                    
                        while (newNotifiedVideos.length > MAX_RECENT_VIDEOS) {
                            newNotifiedVideos.shift();
                        }
                        
                        //console.log(`Sent notification for video ${videoId} in channel ${discordChannelId}`);
                    } catch (error) {
                        //console.error(`Failed to send notification to channel ${discordChannelId}:`, error.message);
                    }
                }
            }

        
            if (updatedLastNotifiedId !== lastNotifiedId || newNotifiedVideos.length !== notifiedVideos.length) {
                try {
                    await notificationsCollection.updateOne(
                        { guildId, type: 'youtube', platformId },
                        { $set: { 
                            lastNotifiedId: updatedLastNotifiedId,
                            notifiedVideos: newNotifiedVideos
                        }}
                    );
                    //console.log(`Updated notification tracking for ${platformId}`);
                } catch (dbError) {
                    //console.error(`Failed to update notification tracking:`, dbError.message);
                }
            }
        } catch (error) {
            //console.error(`Error fetching YouTube videos for ${platformId}:`, error.message);
            
        }
    }
}


async function validateYouTubeConfigs(client) {
    console.log('Validating all YouTube notification configurations...');
    const configs = await notificationsCollection.find({ type: 'youtube' }).toArray();
    
    let validCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const config of configs) {
        const { platformId, guildId } = config;
        
        if (!platformId || !platformId.startsWith('UC') || platformId.length < 20) {
          //  console.log(`Checking invalid channel ID: "${platformId}" for guild ${guildId}`);
            
            const resolvedId = await resolveYouTubeChannelId(platformId);
            
            if (resolvedId) {
                try {
                    await notificationsCollection.updateOne(
                        { guildId, type: 'youtube', platformId },
                        { $set: { 
                            platformId: resolvedId,
                            lastResolvedAt: new Date() 
                        }}
                    );
                    //console.log(`✅ Updated config for guild ${guildId}: "${platformId}" → "${resolvedId}"`);
                    updatedCount++;
                } catch (error) {
                    //console.error(`❌ Failed to update config for guild ${guildId}:`, error.message);
                    errorCount++;
                }
            } else {
                //console.error(`❌ Could not resolve "${platformId}" to a valid channel ID for guild ${guildId}`);
                errorCount++;
            }
        } else {
        
            try {
                const testUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${platformId}&part=snippet&maxResults=1`;
                const response = await axios.get(testUrl);
                
                if (response.data.items && response.data.items.length > 0) {
                    console.log(`✅ Verified valid channel ID "${platformId}" for guild ${guildId}`);
                    validCount++;
                } else {
        //            console.error(`❌ Channel ID "${platformId}" for guild ${guildId} returned no results`);
                    errorCount++;
                }
            } catch (error) {
      //          console.error(`❌ Failed to verify channel ID "${platformId}" for guild ${guildId}:`, error.message);
                errorCount++;
            }
        }
    }
    
    //console.log(`Validation complete. Valid: ${validCount}, Updated: ${updatedCount}, Errors: ${errorCount}`);
    return { validCount, updatedCount, errorCount };
}

function startYouTubeNotifications(client) {
    //console.log('Starting YouTube notification service');
    
 
    const updateIncorrectChannelId = async (oldId, newId, guildId) => {
        try {
            if (oldId && newId && oldId !== newId) {
                await notificationsCollection.updateOne(
                    { guildId, type: 'youtube', platformId: oldId },
                    { $set: { platformId: newId, lastNotifiedId: null, notifiedVideos: [] }}
                );
            //    console.log(`Updated incorrect channel ID from ${oldId} to ${newId} for guild ${guildId}`);
                return true;
            }
        } catch (error) {
          //  console.error(`Failed to update channel ID:`, error.message);
        }
        return false;
    };
    
   
    fetchLatestVideos(client).catch(err => {
        //console.error('Error in initial YouTube notification fetch:', err);
    });
    

    const intervalId = setInterval(() => {
        fetchLatestVideos(client).catch(err => {
            //console.error('Error in YouTube notification interval:', err);
        });
    }, POLL_INTERVAL);
    

    return intervalId;
}

module.exports = startYouTubeNotifications;
