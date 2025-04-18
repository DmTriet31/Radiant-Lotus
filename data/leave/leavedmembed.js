const { EmbedBuilder } = require('discord.js');

module.exports = function createLeaveDMEmbed(member) {
    return new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('👋 You left a server')
        .setDescription(`Goodbye from **${member.guild.name}**.\nWe hope to see you again!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
};
