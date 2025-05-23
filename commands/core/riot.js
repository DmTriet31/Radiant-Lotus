// commands/game/riot.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setAccount, getAccount, removeAccount } = require('../../models/gameAccounts');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('riot')
        .setDescription('Manage your Riot Games account (Valorant, LoL, etc.)')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Link your Riot ID (e.g. PlayerName#1234)')
                .addStringOption(opt =>
                    opt.setName('id')
                        .setDescription('Your Riot ID')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Unlink your Riot ID'))
        .addSubcommand(sub =>
            sub.setName('info')
                .setDescription('Get your or another user\'s Riot ID')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('User to check')
                        .setRequired(false))),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user') || interaction.user;

        if (sub === 'add') {
            const riotID = interaction.options.getString('id');
            await setAccount(interaction.user.id, 'riot', riotID);
            return interaction.reply({ content: `✅ Riot ID set to **${riotID}**.`, ephemeral: true });
        }

        if (sub === 'remove') {
            await removeAccount(interaction.user.id, 'riot');
            return interaction.reply({ content: `🗑️ Your Riot ID has been removed.`, ephemeral: true });
        }

        if (sub === 'info') {
            const riotID = await getAccount(targetUser.id, 'riot');
            const embed = new EmbedBuilder()
                .setColor('#e53935')
                .setTitle('🎮 Riot Games Info')
                .setDescription(riotID ? `**${targetUser.username}**'s Riot ID: \`${riotID}\`` : `${targetUser.username} has not set a Riot ID.`)
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
            .setDescription('- This command can only be used through slash commands!\n- Please use `/riot-info`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
