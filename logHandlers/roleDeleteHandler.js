const { logsCollection } = require('../mongodb');
const { EmbedBuilder } = require('discord.js');
const logHandlersIcons = require('../UI/icons/loghandlers');
module.exports = async function roleDeleteHandler(client) {
    client.on('roleDelete', async (role) => {
        const config = await logsCollection.findOne({ guildId: role.guild.id, eventType: 'roleDelete' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🔴 Role Deleted')
                .setColor('#FF0000')
                .setThumbnail(logHandlersIcons.badgeIcon)
                .addFields(
                    { name: 'Role', value: `${role.name} (${role.id})`, inline: true },
                )
                .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    });
};
