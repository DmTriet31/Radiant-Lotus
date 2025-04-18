const { serverStatsCollection } = require('../mongodb');
const { ChannelType } = require('discord.js');

/**
 * Returns a formatted date string with ordinal suffix
 * @returns {string} Formatted date (e.g., "11th April (Thu)")
 */
function formatDatePretty() {
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
    
    // Full month names for better readability
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return `${day}${ordinal(day)} ${months[date.getMonth()]} (${days[date.getDay()]})`;
}

/**
 * Returns a formatted time string
 * @returns {string} Formatted time (e.g., "3:45 PM")
 */
function formatTimePretty() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Fetches all guild statistics
 * @param {Guild} guild - Discord.js Guild object
 * @returns {Object|null} Object containing all statistics or null if error
 */
async function fetchStats(guild) {
    try {
        await guild.members.fetch();
        await guild.channels.fetch();
        const roles = await guild.roles.fetch();

        return {
            all: guild.memberCount,
            members: guild.members.cache.filter(m => !m.user.bot).size,
            bots: guild.members.cache.filter(m => m.user.bot).size,
            textchannels: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size,
            voicechannels: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size,
            categories: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).size,
            roles: roles.size,
            date: formatDatePretty(),
            time: formatTimePretty()
        };
    } catch (error) {
        console.error(`Error fetching stats for guild: ${guild.id}`, error);
        return null;
    }
}

/**
 * Updates a specific stat channel for a guild
 * @param {Guild} guild - Discord.js Guild object
 * @param {Object} stat - Stat document from database
 * @param {Object} statsData - Object containing current statistics
 * @returns {Promise<boolean>} Success state of the update
 */
async function updateStatChannel(guild, stat, statsData) {
    try {
        const channel = guild.channels.cache.get(stat.channelId);
        
        // If the channel is missing (deleted), clean up the DB entry
        if (!channel) {
            await serverStatsCollection.deleteOne({ _id: stat._id });
            console.log(`🗑️ Removed stat '${stat.type}' for guild '${guild.id}' due to missing channel.`);
            return false;
        }

        let value = statsData[stat.type];
        if (typeof value === 'undefined') value = 0;

        const newName = stat.customName.replace('{count}', value);

        if (channel.name !== newName) {
            await channel.setName(newName).catch(err => {
                console.warn(`⚠️ Failed to rename channel '${channel.id}' in guild '${guild.id}':`, err.message);
            });
        }
        return true;
    } catch (error) {
        console.error(`Error updating stat channel for guild ${guild.id}, stat ${stat.type}:`, error);
        return false;
    }
}

/**
 * Updates all stats for a guild
 * @param {Guild} guild - Discord.js Guild object
 * @param {string[]} [specificTypes] - Optional array of specific stat types to update
 */
async function updateServerStats(guild, specificTypes = null) {
    const statsData = await fetchStats(guild);
    if (!statsData) return;

    try {
        const query = { guildId: guild.id, active: true };
        if (specificTypes && specificTypes.length > 0) {
            query.type = { $in: specificTypes };
        }
        
        const stats = await serverStatsCollection.find(query).toArray();

        for (const stat of stats) {
            await updateStatChannel(guild, stat, statsData);
        }
    } catch (error) {
        console.error(`Error updating server stats for guild: ${guild.id}`, error);
    }
}

module.exports = async (client) => {
    // Event listeners for dynamic stat updates
    client.on('guildMemberAdd', async (member) => await updateServerStats(member.guild));
    client.on('guildMemberRemove', async (member) => await updateServerStats(member.guild));
    client.on('channelCreate', async (channel) => await updateServerStats(channel.guild));
    client.on('channelDelete', async (channel) => await updateServerStats(channel.guild));
    client.on('roleCreate', async (role) => await updateServerStats(role.guild));
    client.on('roleDelete', async (role) => await updateServerStats(role.guild));

    client.on('ready', async () => {
        console.log('📊 Initializing server stats module...');

        // Initial update for all guilds
        for (const guild of client.guilds.cache.values()) {
            await updateServerStats(guild);
        }

        // Update all stats every 5 minutes
        setInterval(async () => {
            console.log('📊 Running regular stats update for all guilds');
            for (const guild of client.guilds.cache.values()) {
                await updateServerStats(guild, ['members', 'bots', 'textchannels', 'voicechannels', 'categories', 'roles']);
            }
        }, 5 * 60 * 1000);
        
        // Update time every 10 minutes for more accuracy
        setInterval(async () => {
            console.log('⏰ Updating time stats for all guilds');
            for (const guild of client.guilds.cache.values()) {
                await updateServerStats(guild, ['time']);
            }
        }, 10 * 60 * 1000);
        
        // Update date every hour (to catch day changes)
        setInterval(async () => {
            console.log('📊 Updating date stats for all guilds');
            for (const guild of client.guilds.cache.values()) {
                await updateServerStats(guild, ['date']);
            }
        }, 60 * 60 * 1000);
    });
};