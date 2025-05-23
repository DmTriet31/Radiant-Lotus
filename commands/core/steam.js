const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setAccount, getAccount, removeAccount } = require('../../models/gameAccounts');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Manage your Steam account')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Link your Steam ID')
                .addStringOption(opt =>
                    opt.setName('id')
                        .setDescription('Your Steam username or ID')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Unlink your Steam ID'))
        .addSubcommand(sub =>
            sub.setName('info')
                .setDescription('Get your or another user\'s Steam ID')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('User to check')
                        .setRequired(false))),
    
    async execute(interaction) {
        
    if (interaction.isCommand && interaction.isCommand()) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user') || interaction.user;

        if (sub === 'add') {
            const steamID = interaction.options.getString('id');
            await setAccount(interaction.user.id, 'steam', steamID);
            return interaction.reply({ content: `✅ Steam ID set to **${steamID}**.`, ephemeral: true });
        }

        if (sub === 'remove') {
            await removeAccount(interaction.user.id, 'steam');
            return interaction.reply({ content: `🗑️ Your Steam ID has been removed.`, ephemeral: true });
        }

        if (sub === 'info') {
            const steamID = await getAccount(targetUser.id, 'steam');
            const embed = new EmbedBuilder()
                .setColor('#171a21')
                .setTitle('🛠 Steam Info')
                .setDescription(steamID ? `**${targetUser.username}**'s Steam ID: \`${steamID}\`` : `${targetUser.username} has not set a Steam ID.`)
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/steam-info`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
