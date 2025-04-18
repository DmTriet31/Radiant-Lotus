// utils/checkPermissions.js
const { serverConfigCollection } = require('../mongodb'); 
const { EmbedBuilder } = require('discord.js');
const cmdIcons = require('../UI/icons/commandicons');

module.exports = async function checkPermissions(interaction) {
    const guild = interaction.guild;
    const serverId = guild.id;
    
    const configMangerData = await serverConfigCollection.findOne({ serverId });
    const botManagers = configMangerData?.botManagers || [];

    const isOwner = interaction.user.id === guild.ownerId;
    const isBotManager = botManagers.includes(interaction.user.id);

    if (!isOwner && !isBotManager) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({
                name: 'Permission Denied',
                iconURL: cmdIcons.rippleIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription(
                '- Only the **server owner** or **bot managers** can use this command.\n' +
                '- If you believe this is a mistake, please contact the server owner or a bot manager.\n' +
                '- If you are the server owner, please add User ID by running **/setup-serverconfig**.'
            );

        await interaction.reply({
            embeds: [embed],
            flags : 64
        });

        setTimeout(() => {
            interaction.deleteReply().catch(() => {});
        }, 5000);

        return false;
    }

    return true;
};
