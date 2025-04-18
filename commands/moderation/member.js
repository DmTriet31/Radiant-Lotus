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
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('member')
        .setDescription('Manage server members.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Ban a user from the server.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to ban.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unban a user via their ID.')
                .addStringOption(option =>
                    option.setName('userid')
                        .setDescription('User ID to unban.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kick a user from the server.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to kick.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeout')
                .setDescription('Put a user in timeout.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to timeout.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('Duration of the timeout in minutes.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removetimeout')
                .setDescription('Remove timeout from a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove timeout from.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nickname')
                .setDescription('Change a user\'s nickname.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to rename.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('New nickname.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Warn a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to warn.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the warning.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dm')
                .setDescription('Send a private message to a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to message.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to send.')
                        .setRequired(true))),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMembers)) {
            return interaction.reply({ content: '❌ You do not have permission to manage members.',  flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ban') {
            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.bannable) {
                return interaction.reply({ content: `❌ Cannot ban **${target.tag}**.`,  flags: 64 });
            }

            await member.ban();
            return interaction.reply({ content: `✅ **${target.tag}** has been banned.` });

        } else if (subcommand === 'unban') {
            const userId = interaction.options.getString('userid');

            try {
                await interaction.guild.members.unban(userId);
                return interaction.reply({ content: `✅ Unbanned user with ID **${userId}**.` });
            } catch {
                return interaction.reply({ content: `❌ No user found with ID **${userId}**.`,  flags: 64 });
            }

        } else if (subcommand === 'kick') {
            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.kickable) {
                return interaction.reply({ content: `❌ Cannot kick **${target.tag}**.`,  flags: 64 });
            }

            await member.kick();
            return interaction.reply({ content: `✅ **${target.tag}** has been kicked.` });

        } else if (subcommand === 'timeout') {
            const target = interaction.options.getUser('target');
            const duration = interaction.options.getInteger('duration');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.moderatable) {
                return interaction.reply({ content: `❌ Cannot timeout **${target.tag}**.`,  flags: 64 });
            }

            await member.timeout(duration * 60 * 1000);
            return interaction.reply({ content: `✅ **${target.tag}** has been put in timeout for **${duration} minutes**.` });

        } else if (subcommand === 'removetimeout') {
            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.communicationDisabledUntilTimestamp) {
                return interaction.reply({ content: `❌ **${target.tag}** is not in timeout.`,  flags: 64 });
            }

            await member.timeout(null);
            return interaction.reply({ content: `✅ **${target.tag}** timeout has been removed.` });

        } else if (subcommand === 'nickname') {
            const target = interaction.options.getUser('target');
            const newName = interaction.options.getString('name');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.manageable) {
                return interaction.reply({ content: `❌ Cannot change nickname for **${target.tag}**.`,  flags: 64 });
            }

            await member.setNickname(newName);
            return interaction.reply({ content: `✅ Changed nickname for **${target.tag}** to **${newName}**.` });

        } else if (subcommand === 'warn') {
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');

            const warnEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('⚠️ You have been warned')
                .setDescription(`**Reason:** ${reason}`)
                .setFooter({ text: `Issued by ${interaction.user.tag}` });

            try {
                await target.send({ embeds: [warnEmbed] });
                return interaction.reply({ content: `✅ **${target.tag}** has been warned for **${reason}**.` });
            } catch {
                return interaction.reply({ content: `⚠️ **${target.tag}** was warned, but their DMs are closed.` });
            }

        } else if (subcommand === 'dm') {
            const target = interaction.options.getUser('target');
            const message = interaction.options.getString('message');

            const dmEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📩 You have a new message')
                .setDescription(message)
                .setFooter({ text: `Sent by ${interaction.user.tag}` });

            try {
                await target.send({ embeds: [dmEmbed] });
                return interaction.reply({ content: `✅ DM sent to **${target.tag}**.` });
            } catch {
                return interaction.reply({ content: `❌ Could not DM **${target.tag}**. They may have DMs disabled.`,  flags: 64 });
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
            .setDescription('- This command can only be used through slash commands!\n- Please use `/member`')
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
