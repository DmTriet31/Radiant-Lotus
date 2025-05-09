const { logsCollection } = require('../mongodb');
const { EmbedBuilder } = require('discord.js');
const logHandlersIcons = require('../UI/icons/loghandlers');
module.exports = async function messageDeleteHandler(client) {
    client.on('messageDelete', async (message) => {
        if (!message.guild || message.partial) return;

        const config = await logsCollection.findOne({ guildId: message.guild.id, eventType: 'messageDelete' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Message Deleted')
                .setColor('#FF0000')
                .setThumbnail(logHandlersIcons.msgIcon)
                .addFields(
                    { name: 'Author', value: message.author?.tag || 'Unknown', inline: true },
                    { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'Content', value: message.content || '*No content*' },
                )
                .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    });
};
