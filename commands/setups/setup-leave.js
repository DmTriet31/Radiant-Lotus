const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const LeaveSettings = require('../../models/leave/LeaveSettings');
const checkPermissions = require('../../utils/checkPermissions');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-leave')
        .setDescription('Configure leave channel and DM settings')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)

        .addSubcommand(sub =>
            sub.setName('setchannel')
                .setDescription('Enable/disable leave message in a channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select leave channel')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable channel leave messages')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('setdm')
                .setDescription('Enable/disable leave DMs')
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable leave DMs')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View current leave configuration')
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

            await LeaveSettings.updateOne(
                { serverId: serverID },
                {
                    $set: {
                        serverId: serverID,
                        leaveChannelId: channel.id,
                        channelStatus: status,
                        ownerId: guild.ownerId
                    }
                },
                { upsert: true }
            );

            return interaction.reply({
                content: `📤 Leave messages in channel have been **${status ? 'enabled' : 'disabled'}** for <#${channel.id}>.`,
                ephemeral: true
            });

        } else if (subcommand === 'setdm') {
            const status = interaction.options.getBoolean('status');

            await LeaveSettings.updateOne(
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
                content: `📩 Leave DM has been **${status ? 'enabled' : 'disabled'}**.`,
                ephemeral: true
            });

        } else if (subcommand === 'view') {
            const config = await LeaveSettings.findOne({ serverId: serverID });

            if (!config) {
                return interaction.reply({
                    content: '⚠ No leave configuration found.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('📋 Leave Settings')
                .addFields(
                    { name: 'Server ID', value: config.serverId, inline: true },
                    { name: 'Channel', value: config.leaveChannelId ? `<#${config.leaveChannelId}>` : 'Not set', inline: true },
                    { name: 'Channel Status', value: config.channelStatus ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Leave DM', value: config.dmStatus ? '✅ Enabled' : '❌ Disabled', inline: true }
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
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-leave`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
