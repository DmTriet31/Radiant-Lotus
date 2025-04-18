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

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { updateXp, getUserData, getLeaderboard } = require('../../models/users');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Manage and view XP & levels.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('givexp')
                .setDescription('Give XP to a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to give XP to.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to give.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removexp')
                .setDescription('Remove XP from a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove XP from.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Displays the XP leaderboard.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rank')
                .setDescription('Show your rank or another user\'s rank.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to check the rank for.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weeklyxp')
                .setDescription('Shows how much XP you earned this week.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('xpforlevel')
                .setDescription('Shows how much XP is needed for the next level.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {

        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user') || interaction.user;
        const amount = interaction.options.getInteger('amount');

        if (subcommand === 'givexp') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({ content: '❌ You do not have permission to use this command.', flags: 64 });
            }
            if (amount <= 0) return interaction.editReply({ content: '❌ XP amount must be greater than 0.', flags: 64 });

            await updateXp(user.id, amount);
            return interaction.editReply(`✅ Gave **${amount} XP** to **${user.username}**.`);

        } else if (subcommand === 'removexp') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({ content: '❌ You do not have permission to use this command.', flags: 64 });
            }
            if (amount <= 0) return interaction.editReply({ content: '❌ XP amount must be greater than 0.', flags: 64 });

            const userData = await getUserData(user.id);
            if (!userData) return interaction.editReply({ content: '❌ User not found in the database.', flags: 64 });

            await updateXp(user.id, -amount);
            return interaction.editReply(`✅ Removed **${amount} XP** from **${user.username}**.`);

        }else if (subcommand === 'leaderboard') {
            // Fetch the top 10 leaderboard data
            let leaderboardData = await getLeaderboard(1, 10);
        
            // Filter out the bot's own ID and users not in the current guild
            leaderboardData = leaderboardData.filter(user => {
                const member = interaction.guild.members.cache.get(user.userId);
                return user.userId !== interaction.client.user.id && member;
            });
        
            // If no data remains after filtering, inform the user
            if (!leaderboardData.length) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ No Leaderboard Data')
                    .setDescription('There is no leaderboard data available for this server.')
                    .setTimestamp();
        
                const reply = await interaction.editReply({ embeds: [noDataEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
        
            // Map the leaderboard entries for display
            const leaderboardEntries = leaderboardData.map((user, index) => {
                const member = interaction.guild.members.cache.get(user.userId);
                return `**${index + 1}.** ${member} - Level **${user.level}**, XP: **${user.xp}**`;
            });
        
            // Create and send the leaderboard embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 XP Leaderboard')
                .setDescription(leaderboardEntries.join('\n'))
                .setTimestamp();
        
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'rank') {
            const userData = await getUserData(user.id);
            if (!userData) return interaction.editReply(`❌ **${user.username}** has no rank data.`);

            const requiredXp = Math.ceil((userData.level + 1) ** 2 * 100);
            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setAuthor({ name: `${user.username}'s Rank`, iconURL: user.displayAvatarURL() })
                .setDescription('🏆 **Rank & XP Details**')
                .addFields(
                    { name: '📊 Level', value: `**${userData.level}**`, inline: true },
                    { name: '💫 XP', value: `**${userData.xp} / ${requiredXp}**`, inline: true },
                    { name: '✨ XP Needed', value: `**${requiredXp - userData.xp} XP**`, inline: false }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'weeklyxp') {
            const userData = await getUserData(interaction.user.id);
            if (!userData) return interaction.editReply('❌ Could not retrieve XP data.');

            return interaction.editReply(`📅 **${interaction.user.username}** earned **${userData.weeklyXp} XP** this week.`);

        } else if (subcommand === 'xpforlevel') {
            const userData = await getUserData(interaction.user.id);
            if (!userData) return interaction.editReply('❌ Could not retrieve XP data.');

            const xpForNextLevel = (userData.level + 1) ** 2 * 100;
            const xpNeeded = xpForNextLevel - userData.xp;

            return interaction.editReply(`✨ **${interaction.user.username}** needs **${xpNeeded} XP** to reach the next level.`);
        }
        
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/level`')
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