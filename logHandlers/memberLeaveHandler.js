const { logsCollection } = require('../mongodb');
const LeaveSettings = require('../models/leave/LeaveSettings');
const { EmbedBuilder } = require('discord.js');
const createLeaveDMEmbed = require('../data/leave/leavedmembed');
const logHandlersIcons = require('../UI/icons/loghandlers');
module.exports = async function memberLeaveHandler(client) {
    client.on('guildMemberRemove', async (member) => {
        const guildId = member.guild.id;

        // === LOGGING ===
        const config = await logsCollection.findOne({ guildId, eventType: 'memberLeave' });
        if (config?.channelId) {
            const logChannel = client.channels.cache.get(config.channelId);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('🚶 Member Left')
                    .setColor('#FF9900')
                    .addFields(
                        { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                        { name: 'Left At', value: new Date().toLocaleString(), inline: true },
                    )
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                    .setTimestamp();

                logChannel.send({ embeds: [embed] });
            }
        }

        // === LEAVE SETTINGS ===
        const leaveSettings = await LeaveSettings.findOne({ serverId: guildId });

        // Send to channel
        if (leaveSettings?.channelStatus && leaveSettings.leaveChannelId) {
            const channel = member.guild.channels.cache.get(leaveSettings.leaveChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('👋 Member Left')
                    .setColor('#FF9900')
                    .setDescription(`${member.user.tag} has left the server.`)
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            }
        }

        // Send DM
        if (leaveSettings?.dmStatus) {
            try {
                const dmEmbed = createLeaveDMEmbed(member);
                await member.user.send({ embeds: [dmEmbed] });
            } catch (err) {
                console.warn(`❌ Failed to send leave DM to ${member.user.tag}:`, err.message);
            }
        }
    });
};
