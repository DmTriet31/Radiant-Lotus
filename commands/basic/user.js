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


const cmdIcons = require('../../UI/icons/commandicons');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription(lang.userinfoDescription || 'Get user information.')
    // Subcommand: info (detailed information)
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription(lang.userinfoInfoDescription || 'Display detailed user information.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription(lang.userinfoTargetDescription || 'Select a user')
            .setRequired(false)
        )
    )
    // Subcommand: avatar (display the avatar)
    .addSubcommand(subcommand =>
      subcommand
        .setName('avatar')
        .setDescription(lang.userinfoAvatarDescription || 'Display the user\'s avatar.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription(lang.userinfoTargetDescription || 'Select a user')
            .setRequired(false)
        )
    )
    // Subcommand: banner (display the banner)
    .addSubcommand(subcommand =>
      subcommand
        .setName('banner')
        .setDescription(lang.userinfoBannerDescription || 'Display the user\'s banner.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription(lang.userinfoTargetDescription || 'Select a user')
            .setRequired(false)
        )
    ),
  async execute(interaction) {
    if (interaction.isCommand && interaction.isCommand()) {

    const subcommand = interaction.options.getSubcommand();


    let targetUser = interaction.options.getUser('target') || interaction.user;
    

    if (subcommand === 'banner') {
      try {
        targetUser = await interaction.client.users.fetch(targetUser.id, { force: true });
      } catch (error) {
        console.error('Failed to fetch user for banner:', error);
      }
    }

    if (subcommand === 'info') {
      // Fetch the member for guild-specific info
      const member = await interaction.guild.members.fetch(targetUser.id);
      const roles = member.roles.cache.filter(role => role.name !== '@everyone');
      const highestRole = member.roles.highest;
  
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(lang.userinfoTitle || 'User Information')
        .setThumbnail(targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .setDescription(`
**${lang.userinfoUsername || 'Username'}:** ${targetUser.tag}
**${lang.userinfoUserID || 'User ID'}:** ${targetUser.id}
**${lang.userinfoJoinedDiscord || 'Joined Discord'}:** ${targetUser.createdAt.toUTCString()}
**${lang.userinfoJoinedServer || 'Joined Server'}:** ${member.joinedAt.toUTCString()}
**${lang.userinfoRoles || 'Roles'}:** ${roles.map(role => role.name).join(', ') || lang.userinfoNone || 'None'}
**${lang.userinfoHighestRole || 'Highest Role'}:** ${highestRole.name}
**${lang.userinfoIsBot || 'Bot'}:** ${targetUser.bot ? lang.userinfoYes || 'Yes' : lang.userinfoNo || 'No'}
        `)
        .setTimestamp();
  
      await interaction.reply({ embeds: [embed] });
    } 
    else if (subcommand === 'avatar') {
    
      const avatarURL = targetUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(lang.userinfoAvatarTitle || `${targetUser.tag}'s Avatar`)
        .setImage(avatarURL)
        .setTimestamp();
  
      await interaction.reply({ embeds: [embed] });
    } 
    else if (subcommand === 'banner') {
  
      const bannerURL = targetUser.bannerURL({ format: 'png', dynamic: true, size: 1024 });
      if (!bannerURL) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription(lang.userinfoNoBanner || 'This user does not have a banner set.');
        return await interaction.reply({ embeds: [embed] });
      }
  
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(lang.userinfoBannerTitle || `${targetUser.tag}'s Banner`)
        .setImage(bannerURL)
        .setTimestamp();
  
      await interaction.reply({ embeds: [embed] });
    }
  } else {
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/user`')
        .setTimestamp();
  
    await interaction.reply({ embeds: [embed] });
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