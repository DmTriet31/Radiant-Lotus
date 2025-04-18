const { logsCollection } = require('../mongodb');
const { EmbedBuilder } = require('discord.js');
const logHandlersIcons = require('../UI/icons/loghandlers');
module.exports = async function memberBanHandler(client) {
    client.on('guildBanAdd', async (ban) => {
        const config = await logsCollection.findOne({ guildId: ban.guild.id, eventType: 'memberBan' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🔨 Member Banned')
                .setColor('#FF0000')
                .addFields(
                    { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                )
                .setThumbnail(ban.user.displayAvatarURL())
                .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    });
};
