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



const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBirthday, setBirthday, removeBirthday, getAllBirthdays } = require('../../models/birthday');
const moment = require('moment');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('🎂 Manage birthdays with different options.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your birthday.')
                .addStringOption(option =>
                    option.setName('date')
                        .setDescription('Your birthday in MM-DD format (e.g., 12-25 for December 25th).')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check your birthday or someone else\'s.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose birthday you want to check.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your birthday from the system.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('upcoming')
                .setDescription('Check upcoming birthdays in the next 30 days.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommand === 'set') {
            // **Set Birthday**
            const birthday = interaction.options.getString('date');

            if (!/^\d{2}-\d{2}$/.test(birthday)) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Invalid Format')
                        .setDescription('Please provide your birthday in **MM-DD** format (e.g., **12-25** for December 25th).')]
                });
            }

            await setBirthday(userId, birthday);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Birthday Set')
                    .setDescription(`✅ Your birthday has been set to **${birthday}**.`)]
            });

        } else if (subcommand === 'check') {
            // **Check Birthday**
            const user = interaction.options.getUser('user') || interaction.user;
            const birthdayProfile = await getBirthday(user.id);

            if (!birthdayProfile) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Birthday Not Set')
                        .setDescription(`${user.username} has not set their birthday.`)]
                });
            }

            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle(`${user.username}'s Birthday`)
                    .setDescription(`🎂 **${user.username}**'s birthday is on **${birthdayProfile.birthday}**.`)]
            });

        } else if (subcommand === 'remove') {
            // **Remove Birthday**
            await removeBirthday(userId);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Birthday Removed')
                    .setDescription('🚫 Your birthday has been removed from the system.')]
            });

        } else if (subcommand === 'upcoming') {
            // **Upcoming Birthdays**
            const birthdays = await getAllBirthdays();
            const upcomingBirthdays = [];
            const now = moment();

            birthdays.forEach(({ userId, birthday }) => {
                const [month, day] = birthday.split('-');
                const birthdayDate = moment(`${now.year()}-${month}-${day}`, 'YYYY-MM-DD');

                if (birthdayDate.isBefore(now)) {
                    birthdayDate.add(1, 'year');
                }

                if (birthdayDate.diff(now, 'days') <= 30) {
                    upcomingBirthdays.push({
                        userId,
                        birthday,
                        daysUntil: birthdayDate.diff(now, 'days'),
                    });
                }
            });

            if (upcomingBirthdays.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('No Upcoming Birthdays')
                        .setDescription('No upcoming birthdays in the next 30 days.')]
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎉 Upcoming Birthdays')
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            for (const { userId, birthday, daysUntil } of upcomingBirthdays) {
                const user = await interaction.client.users.fetch(userId);
                embed.addFields({ name: user.username, value: `🎂 ${birthday} (**${daysUntil} days left!**)` });
            }

            return interaction.editReply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/birthday`')
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
