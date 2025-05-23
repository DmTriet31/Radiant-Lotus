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

const { SlashCommandBuilder } = require('@discordjs/builders');
const { setTimeout } = require('timers/promises');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Manage timers and reminders.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('timer')
                .setDescription('Set a countdown timer.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the timer in minutes.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remind')
                .setDescription('Set a reminder for a task.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the reminder in minutes.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('Task to be reminded about.')
                        .setRequired(true))),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'timer') {
            // Handle Timer
            const minutes = interaction.options.getInteger('minutes');
            const duration = minutes * 60000;

            await interaction.reply(`⏳ Timer set for **${minutes} minutes**.`);

            await setTimeout(duration);

            await interaction.followUp(`⏰ **Time's up!** ${interaction.user}, your **${minutes}-minute** timer is over.`);
        
        } else if (subcommand === 'remind') {
            // Handle Reminder
            const minutes = interaction.options.getInteger('minutes');
            const task = interaction.options.getString('task');
            const duration = minutes * 60000;

            await interaction.reply(`✅ Reminder set: **"${task}"** in **${minutes} minutes**.`);

            await setTimeout(duration);

            await interaction.followUp(`🔔 **Reminder:** ${interaction.user}, it's time for **"${task}"**!`);
        }
    } else {
        const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon ,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/time`')
        .setTimestamp();
    
        await interaction.reply({ embeds: [embed] });
    
        } 
    },
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
