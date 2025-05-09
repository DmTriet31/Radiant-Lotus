const { serverStatsCollection } = require('../mongodb');
const { ChannelType } = require('discord.js');
const client = require('../main');
function formatDatePretty(locale = 'en-US') {
    const date = new Date();
    const day = date.getDate();
    const ordinal = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    const months = date.toLocaleString(locale, { month: 'long' });
    const weekday = date.toLocaleString(locale, { weekday: 'short' });
    return `${day}${ordinal(day)} ${months} (${weekday})`;
}

function formatTimePretty(locale = 'en-US') {
    return new Date().toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

async function fetchStats(guild) {
    try {
  
        const members = await guild.members.fetch({ force: true });
        const roles = await guild.roles.fetch();
        const channels = await guild.channels.fetch();

        //console.log(`\n🔍 ${guild.name} - Stats refresh completed`);

        const locale = guild.preferredLocale || 'en-US';

        const stats = {
            all: members.size,
            members: members.filter(m => !m.user.bot).size,
            bots: members.filter(m => m.user.bot).size,
            textchannels: channels.filter(ch => ch.type === ChannelType.GuildText).size,
            voicechannels: channels.filter(ch => ch.type === ChannelType.GuildVoice).size,
            categories: channels.filter(ch => ch.type === ChannelType.GuildCategory).size,
            roles: roles.size,
            date: formatDatePretty(locale),
        };

        //console.log(`📊 Stats for ${guild.name}:`, stats);
        return stats;
    } catch (err) {
        //console.error(`❌ Failed to fetch stats for guild ${guild.id}`, err);
        return null;
    }
}

async function updateStatChannel(guild, stat, statsData, retryCount = 0) {
    try {
        const value = statsData[stat.type] ?? 0;
        const newName = stat.customName.replace('{count}', value);

        let channel = guild.channels.cache.get(stat.channelId);
        if (!channel) {
            try {
                channel = await guild.channels.fetch(stat.channelId); // Force fetch if missing in cache
            } catch (err) {
                //console.log(`🗑️ Channel missing for '${stat.type}', removing stat entry: ${err.message}`);
                await serverStatsCollection.deleteOne({ _id: stat._id });
                return;
            }
        }

        if (!channel || typeof channel.setName !== 'function') {
            console.warn(`⚠️ Invalid channel for stat '${stat.type}'`);
            return;
        }

       
        if (retryCount === 0) {
            const botMember = guild.members.cache.get(client.user.id);
            if (botMember && channel.permissionsFor) {
                const hasPermission = channel.permissionsFor(botMember).has('ManageChannels');
                if (!hasPermission) {
                    //console.error(`❌ Bot lacks ManageChannels permission for "${stat.type}" channel`);
                    return;
                }
            }
        }

        if (channel.name !== newName) {
            //console.log(`🔁 Attempting to update channel: "${channel.name}" → "${newName}" for stat "${stat.type}"`);
            
            try {
                await channel.setName(newName);
                //console.log(`✅ Successfully updated channel name for "${stat.type}": "${newName}"`);
              
                await serverStatsCollection.updateOne(
                    { _id: stat._id },
                    { $set: { lastUpdatedValue: value, lastUpdatedAt: new Date() } }
                );
                
                return true; 
            } catch (err) {
                if (err.code === 30013 || err.message.includes('rate limited')) {
                    //console.warn(`⏱️ Rate limit hit when updating "${stat.type}" channel. ${retryCount < 3 ? "Will retry later." : "Max retries reached."}`);
                    
              
                    if (retryCount < 3) {
                        const delay = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
                        console.log(`⏱️ Scheduling retry #${retryCount + 1} for "${stat.type}" in ${delay/1000}s`);
                        
                        setTimeout(() => {
                            updateStatChannel(guild, stat, statsData, retryCount + 1);
                        }, delay);
                    }
                } else if (err.code === 50013) {
                    //console.error(`❌ Missing permissions to update channel name for "${stat.type}"`);
                } else {
                    //console.error(`❌ Failed to update channel name for "${stat.type}": ${err.message}`);
                    console.error(err); 
                }
                return false; 
            }
        } else {
            return true;
        }
    } catch (err) {
        //console.warn(`⚠️ Error updating stat '${stat.type}' for ${guild.name}:`, err);
        return false; // Failed
    }
}


async function updateAllStats(guild) {
    try {
        const statConfigs = await serverStatsCollection.find({ 
            guildId: guild.id,
            active: true,
            channelId: { $ne: null }
        }).toArray();
        
        if (!statConfigs || statConfigs.length === 0) {
            return;
        }

        const statsData = await fetchStats(guild);
        if (!statsData) return;

      
        let successCount = 0;
        let failCount = 0;
        
 
        for (const stat of statConfigs) {
            const success = await updateStatChannel(guild, stat, statsData);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
            
          
            if (statConfigs.length > 2) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        //console.log(`📊 Stats update for ${guild.name}: ${successCount} succeeded, ${failCount} failed/scheduled for retry`);
    } catch (err) {
        console.error(`❌ Failed updating stats for guild ${guild.id}:`, err);
    }
}

module.exports = (client) => {
    const startStatsUpdater = () => {
      
       
        setTimeout(async () => {
           
            for (const guild of client.guilds.cache.values()) {
                await updateAllStats(guild);
            }
        }, 5000); 

       
        setInterval(async () => {
            for (const guild of client.guilds.cache.values()) {
                await updateAllStats(guild);
            }
        }, 5 * 60 * 1000);
    };

   
    client.on('guildMemberAdd', async (member) => {
        await updateAllStats(member.guild);
    });

    client.on('guildMemberRemove', async (member) => {
        await updateAllStats(member.guild);
    });

    client.on('channelCreate', async (channel) => {
        if (channel.guild) await updateAllStats(channel.guild);
    });

    client.on('channelDelete', async (channel) => {
        if (channel.guild) await updateAllStats(channel.guild);
    });

    client.on('roleCreate', async (role) => {
        await updateAllStats(role.guild);
    });

    client.on('roleDelete', async (role) => {
        await updateAllStats(role.guild);
    });

    if (client.isReady()) {
        startStatsUpdater();
    } else {
        client.once('ready', startStatsUpdater);
    }
};