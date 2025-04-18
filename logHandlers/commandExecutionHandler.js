// File: commandExecutionHandler.js
const { commandLogsCollection } = require('../mongodb');
const { EmbedBuilder } = require('discord.js');

module.exports = async function commandExecutionHandler(client) {
  client.on('interactionCreate', async (interaction) => {
 
    if (!interaction.isCommand()) return;

    const { commandName, user, guild, channel } = interaction;

   
    const logData = {
      commandName,
      userId: user.id,
      userName: user.tag,
      guildId: guild?.id || null,
      channelId: channel.id,
      timestamp: new Date(),
      isConfig: false, 
    };


    await commandLogsCollection.insertOne(logData);

   
    if (!guild) return;

    try {
   
      const config = await commandLogsCollection.findOne({ guildId: guild.id, isConfig: true });

    
      if (!config || !config.enabled || !config.channelId) return;

     
      const logChannel = client.channels.cache.get(config.channelId);
      if (!logChannel) return; 

    
      const embed = new EmbedBuilder()
        .setTitle('📜 Command Executed')
        .setColor('#3498db')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Command', value: `/${commandName}`, inline: true },
          { name: 'Channel', value: `<#${channel.id}>`, inline: true }
        )
        .setTimestamp();

      
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending command log:', error);
    }
  });
};
