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
const { addReport, getReports, clearReports, removeReport } = require('../../models/reports');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('📋 Manage user reports.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Report a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to report.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for reporting.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Show all reports for a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose reports you want to view.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all reports for a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose reports you want to clear.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a specific report by index.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose report you want to remove.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The index of the report to remove.')
                        .setRequired(true))),
    
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply({  flags: 64 });

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        if (subcommand === 'add') {
            const reason = interaction.options.getString('reason');

            await addReport(user.id, interaction.user.id, reason);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('📢 Report Submitted')
                .setDescription(`User **${user.tag}** has been reported for:\n\n📌 **Reason:** ${reason}`)
                .setFooter({ text: `Reported by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'list') {
            const reports = await getReports(user.id);

            if (!reports || reports.reports.length === 0) {
                return interaction.editReply({ content: `✅ **${user.tag}** has no reports.` });
            }

            const reportDetails = await Promise.all(
                reports.reports.map(async (r, index) => {
                    const reporter = await interaction.client.users.fetch(r.reporterId);
                    return `\`#${index + 1}\` **Reported by ${reporter.tag}** on ${new Date(r.timestamp).toLocaleString()}\n📌 **Reason:** ${r.reason}`;
                })
            );

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`📋 Reports for ${user.tag}`)
                .setDescription(reportDetails.join('\n\n'))
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'clear') {
            await clearReports(user.id);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🗑️ Reports Cleared')
                .setDescription(`All reports for **${user.tag}** have been cleared.`)
                .setFooter({ text: `Action by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'remove') {
            const index = interaction.options.getInteger('index') - 1; 

            const reports = await getReports(user.id);
            if (!reports || reports.reports.length === 0) {
                return interaction.editReply({ content: `✅ **${user.tag}** has no reports to remove.` });
            }

            if (index < 0 || index >= reports.reports.length) {
                return interaction.editReply({ content: `❌ Invalid index. Use **/report list** to view valid report indexes.` });
            }

            await removeReport(user.id, index);

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🗑️ Report Removed')
                .setDescription(`Removed **report #${index + 1}** for **${user.tag}**.`)
                .setFooter({ text: `Action by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/report`')
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

