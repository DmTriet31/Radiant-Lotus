const { 
    SlashCommandBuilder, 
    SlashCommandSubcommandGroupBuilder, 
    SlashCommandSubcommandBuilder, 
    PermissionsBitField, 
    ChannelType, 
    EmbedBuilder 
} = require('discord.js');
const ModMailConfig = require('../../models/modmail/ModMailConfig');
const checkPermissions = require('../../utils/checkPermissions');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-modmail')
        .setDescription('Manage the mod mail system configuration')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('configure')
                .setDescription('Set up or update mod mail configuration')
                .addChannelOption(opt =>
                    opt.setName('log_channel')
                        .setDescription('Channel for forwarding mod mail')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addRoleOption(opt =>
                    opt.setName('admin_role')
                        .setDescription('Admin role for managing mod mail')
                        .setRequired(true))
                .addBooleanOption(opt =>
                    opt.setName('status')
                        .setDescription('Enable or disable mod mail')
                        .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View current mod mail configuration')
        )
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit mod mail settings')
                .addChannelOption(opt =>
                    opt.setName('log_channel')
                        .setDescription('New log channel (optional)')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addRoleOption(opt =>
                    opt.setName('admin_role')
                        .setDescription('New admin role (optional)')
                        .setRequired(false))
                .addBooleanOption(opt =>
                    opt.setName('status')
                        .setDescription('Enable or disable mod mail (optional)')
                        .setRequired(false))
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        if (!await checkPermissions(interaction)) return;
        if (subcommand === 'configure') {
            const logChannel = interaction.options.getChannel('log_channel');
            const adminRole = interaction.options.getRole('admin_role');
            const status = interaction.options.getBoolean('status');

            await ModMailConfig.findOneAndUpdate(
                { guildId },
                {
                    guildId,
                    logChannelId: logChannel.id,
                    adminRoleId: adminRole.id,
                    status,
                    ownerId: interaction.guild.ownerId
                },
                { upsert: true }
            );

            return interaction.reply({
                content: `📬 Mod mail configured: **${status ? 'enabled' : 'disabled'}**.\n📨 Logs: ${logChannel}\n👮 Admin Role: ${adminRole}`,
                ephemeral: true
            });

        } else if (subcommand === 'view') {
            const config = await ModMailConfig.findOne({ guildId });
            if (!config) {
                return interaction.reply({ content: '❌ No mod mail config found for this server.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('📬 Mod Mail Configuration')
                .setColor('#2f3136')
                .addFields(
                    { name: 'Status', value: config.status ? 'Enabled' : 'Disabled', inline: true },
                    { name: 'Log Channel', value: `<#${config.logChannelId}>`, inline: true },
                    { name: 'Admin Role', value: `<@&${config.adminRoleId}>`, inline: true }
                );

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'edit') {
            const updates = {};
            const logChannel = interaction.options.getChannel('log_channel');
            const adminRole = interaction.options.getRole('admin_role');
            const status = interaction.options.getBoolean('status');

            if (logChannel) updates.logChannelId = logChannel.id;
            if (adminRole) updates.adminRoleId = adminRole.id;
            if (status !== null) updates.status = status;

            const result = await ModMailConfig.findOneAndUpdate({ guildId }, updates, { new: true });
            if (!result) {
                return interaction.reply({ content: '❌ No mod mail configuration to edit. Please run `/setup-modmail configure` first.', ephemeral: true });
            }

            return interaction.reply({
                content: `✅ Mod mail configuration updated.`,
                ephemeral: true
            });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-modmail`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
