/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/


const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { serverConfigCollection } = require('../../mongodb'); 
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-serverconfig')
    .setDescription('Manage the server-specific configuration')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addSubcommand(sub =>
      sub
        .setName('set')
        .setDescription('Set bot managers and prefix for this server')
        .addStringOption(option =>
          option.setName('botmanagers')
            .setDescription('Comma-separated list of user IDs to add as bot managers')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('prefix')
            .setDescription('Set the server prefix')
            .setRequired(false))
    )

    // Subcommand: View current configuration
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription('View the current server configuration')
    )

    // Subcommand: Edit configuration (Remove managers & Reset prefix)
    .addSubcommand(sub =>
      sub
        .setName('edit')
        .setDescription('Edit the bot managers or prefix')
        .addStringOption(option =>
          option.setName('removebotmanagers')
            .setDescription('Comma-separated list of user IDs to remove from bot managers')
            .setRequired(false))
        .addBooleanOption(option =>
          option.setName('resetprefix')
            .setDescription('Reset the prefix to default')
            .setRequired(false))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const serverId = guild.id;


    let configData = await serverConfigCollection.findOne({ serverId });

  
    const botManagers = configData ? configData.botManagers || [] : [];
    if (!botManagers.includes(interaction.user.id) && interaction.user.id !== guild.ownerId) {
      return interaction.reply({ 
        content: '❌ Only the **server owner** or **bot managers** can use this command.', 
        ephemeral: true 
      });
    }

    // **Subcommand: SET**
    if (subcommand === 'set') {
      const botManagersInput = interaction.options.getString('botmanagers');
      const prefix = interaction.options.getString('prefix');

      let updatedBotManagers = botManagers;

   
      if (botManagersInput) {
        const newManagers = botManagersInput.split(',').map(id => id.trim());
        updatedBotManagers = [...new Set([...botManagers, ...newManagers])]; 
      }

      try {
        await serverConfigCollection.updateOne(
          { serverId },
          { $set: { serverId, botManagers: updatedBotManagers, prefix: prefix || configData?.prefix || '!' } },
          { upsert: true }
        );

        return interaction.reply({ content: `✅ Configuration updated successfully.`, ephemeral: true });
      } catch (error) {
        console.error('Error updating config:', error);
        return interaction.reply({ content: '❌ Error saving configuration.', ephemeral: true });
      }
    }

    // **Subcommand: VIEW**
    if (subcommand === 'view') {
      if (!configData) {
        return interaction.reply({ content: '⚠ No configuration found for this server.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('Server Configuration')
        .setDescription(`**Server ID:** ${configData.serverId}\n**Bot Managers:** ${configData.botManagers.join(', ') || 'None'}\n**Prefix:** ${configData.prefix || '!'}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // **Subcommand: EDIT**
    if (subcommand === 'edit') {
      const removeBotManagersInput = interaction.options.getString('removebotmanagers');
      const resetPrefix = interaction.options.getBoolean('resetprefix');

      let updatedBotManagers = botManagers;

     
      if (removeBotManagersInput) {
        const removeManagers = removeBotManagersInput.split(',').map(id => id.trim());
        updatedBotManagers = botManagers.filter(id => !removeManagers.includes(id)); 
      }

      try {
        await serverConfigCollection.updateOne(
          { serverId },
          { $set: { botManagers: updatedBotManagers, prefix: resetPrefix ? '!' : configData?.prefix } }
        );

        return interaction.reply({ content: '✅ Configuration updated successfully.', ephemeral: true });
      } catch (error) {
        console.error('Error editing config:', error);
        return interaction.reply({ content: '❌ Error updating configuration.', ephemeral: true });
      }
      
    } else {
     
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({
          name: "Alert!",
          iconURL: cmdIcons.dotIcon,
          url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-serverconfig`')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};

/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/
