const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const WelcomeSettings = require('../../models/welcome/WelcomeSettings');
const checkPermissions = require('../../utils/checkPermissions');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-welcome')
        .setDescription('Set or view welcome message and DM settings for this server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)

        .addSubcommand(sub =>
            sub.setName('setchannel')
                .setDescription('Enable/Disable welcome messages in a channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select the welcome channel')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable channel welcome messages')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('setdm')
                .setDescription('Enable/Disable welcome DMs')
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable welcome DMs')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View current welcome setup')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const guild = interaction.guild;
        const serverID = guild.id;
        if (!await checkPermissions(interaction)) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setchannel') {
            const channel = interaction.options.getChannel('channel');
            const status = interaction.options.getBoolean('status');

            await WelcomeSettings.updateOne(
                { serverId: serverID },
                {
                    $set: {
                        serverId: serverID,
                        welcomeChannelId: channel.id,
                        channelStatus: status,
                        ownerId: guild.ownerId
                    }
                },
                { upsert: true }
            );

            return interaction.reply({
                content: `📢 Welcome messages in channel have been **${status ? 'enabled' : 'disabled'}** for <#${channel.id}>.`,
                ephemeral: true
            });

        } else if (subcommand === 'setdm') {
            const status = interaction.options.getBoolean('status');

            await WelcomeSettings.updateOne(
                { serverId: serverID },
                {
                    $set: {
                        serverId: serverID,
                        dmStatus: status,
                        ownerId: guild.ownerId
                    }
                },
                { upsert: true }
            );

            return interaction.reply({
                content: `📩 Welcome DM has been **${status ? 'enabled' : 'disabled'}**.`,
                ephemeral: true
            });

        } else if (subcommand === 'view') {
            const config = await WelcomeSettings.findOne({ serverId: serverID });

            if (!config) {
                return interaction.reply({
                    content: '⚠ No welcome configuration found for this server.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('📋 Welcome Settings')
                .addFields(
                    { name: 'Server ID', value: config.serverId, inline: true },
                    { name: 'Channel', value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : 'Not set', inline: true },
                    { name: 'Channel Status', value: config.channelStatus ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Welcome DM', value: config.dmStatus ? '✅ Enabled' : '❌ Disabled', inline: true }
                )
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
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-welcome`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
