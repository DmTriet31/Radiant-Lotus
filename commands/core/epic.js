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
const fortniteApiKey = process.env.FORTNITE_API_KEY;
const { getEpic, setEpic, removeEpic } = require('../../models/epicData');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('epic')
        .setDescription('Manage Epic Games accounts and check Fortnite stats.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('account')
                .setDescription('Get your or another user\'s Epic Games account name.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Mention a user to check their Epic Games name.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setname')
                .setDescription('Set your Epic Games account name.')
                .addStringOption(option =>
                    option.setName('epicname')
                        .setDescription('Your Epic Games name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removename')
                .setDescription('Remove your Epic Games account name.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('fortnitestats')
                .setDescription('Get Fortnite Battle Royale stats.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Mention a user to check their stats.')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('epicname')
                        .setDescription('Enter an Epic Games name to check stats.')
                        .setRequired(false))),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user') || interaction.user;
        let epicName = interaction.options.getString('epicname');

        if (subcommand === 'account') {
            const epic = await getEpic(user.id);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎮 Epic Games Account')
                .setTimestamp()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            if (epic) {
                embed.setDescription(`**${user.username}**'s Epic Games name: **${epic}**.`);
            } else {
                embed.setDescription(`${user.username} has not set their Epic Games name yet. Use \`/epic setname\` to set it.`);
            }

            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'setname') {
            await setEpic(interaction.user.id, epicName);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎮 Epic Games Name Set')
                .setDescription(`Your Epic Games name has been updated to **${epicName}**.`)
                .setTimestamp()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'removename') {
            const existingEpic = await getEpic(interaction.user.id);
            if (!existingEpic) {
                return interaction.editReply('❌ You don\'t have an Epic Games name set.');
            }

            await removeEpic(interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Epic Games Name Removed')
                .setDescription(`Your Epic Games name **${existingEpic}** has been removed.`)
                .setTimestamp()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'fortnitestats') {
            if (!epicName) {
                epicName = await getEpic(user.id);
                if (!epicName) {
                    return interaction.editReply(`${user.username} has not set their Epic Games name. Use \`/epic setname\` to set it.`);
                }
            }

            try {
                const response = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${epicName}&accountType=epic`, {
                    headers: { 'Authorization': fortniteApiKey }
                });

                const data = await response.json();
                if (data.status !== 200 || !data.data) {
                    return interaction.editReply('❌ Error fetching Fortnite stats. Please ensure the Epic Games name is correct.');
                }

                const stats = data.data.stats.all.overall;
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎮 Fortnite BR Stats')
                    .setDescription(`${user.username}'s Fortnite stats for Epic Games name \`${epicName}\`:`)
                    .addFields(
                        { name: '🏆 Wins', value: String(stats.wins ?? 'N/A'), inline: true },
                        { name: '🔫 Kills', value: String(stats.kills ?? 'N/A'), inline: true },
                        { name: '🎯 K/D Ratio', value: String(stats.kd ?? 'N/A'), inline: true },
                        { name: '🎮 Matches Played', value: String(stats.matches ?? 'N/A'), inline: true },
                        { name: '🏅 Win Rate', value: stats.winRate ? `${stats.winRate.toFixed(2)}%` : 'N/A', inline: true },
                        { name: '⏳ Minutes Played', value: String(stats.minutesPlayed ?? 'N/A'), inline: true }
                    )
                    .setTimestamp()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

                return interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('Error fetching Fortnite stats:', error);
                return interaction.editReply('❌ An error occurred while fetching Fortnite stats. Please try again later.');
            }
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/epic`')
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