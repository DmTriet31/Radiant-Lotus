const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DisabledCommand = require('../../models/commands/DisabledCommands');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manage-commands')
        .setDescription('Enable, disable, or view command statuses')
        .addSubcommand(sub =>
            sub.setName('toggle')
                .setDescription('Enable or disable a command')
                .addStringOption(opt =>
                    opt.setName('command')
                        .setDescription('Name of the command')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('subcommand')
                        .setDescription('Optional subcommand name')
                        .setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View disabled commands in this server')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            if (!await checkPermissions(interaction)) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'toggle') {
            const commandName = interaction.options.getString('command');
            const subcommandName = interaction.options.getString('subcommand');
            const guildId = interaction.guild.id;

            const existing = await DisabledCommand.findOne({ guildId, commandName, subcommandName });
            if (existing) {
                await existing.deleteOne();
                return interaction.reply({ content: `✅ Command \`${commandName}${subcommandName ? ` ${subcommandName}` : ''}\` has been **enabled**.`, ephemeral: true });
            } else {
                await DisabledCommand.create({ guildId, commandName, subcommandName });
                return interaction.reply({ content: `🚫 Command \`${commandName}${subcommandName ? ` ${subcommandName}` : ''}\` has been **disabled**.`, ephemeral: true });
            }
        }
        if (subcommand === 'view') {
            const disabled = await DisabledCommand.find({ guildId: interaction.guild.id });
        
            const formatted = disabled.map(cmd =>
                `• \`/${cmd.commandName}${cmd.subcommandName ? ` ${cmd.subcommandName}` : ''}\``
            );
        
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('📋 Command Configuration')
                .setTimestamp();
        
            // 🔹 Disabled commands
            if (formatted.length === 0) {
                embed.addFields({ name: '🚫 Disabled Commands', value: '✅ No commands are disabled in this server.' });
            } else {
                const chunks = [];
                let chunk = '';
                for (const line of formatted) {
                    if (chunk.length + line.length + 1 > 1024) {
                        chunks.push(chunk);
                        chunk = '';
                    }
                    chunk += `${line}\n`;
                }
                if (chunk) chunks.push(chunk);
                chunks.forEach((chunk, i) => {
                    embed.addFields({ name: `🚫 Disabled (Page ${i + 1})`, value: chunk });
                });
            }
        
            // 🔹 Excess Commands (prefix folders)
            const excessKeys = Object.keys(config.excessCommands || {});
            const loadedExcess = excessKeys.filter(k => config.excessCommands[k]);
            const unloadedExcess = excessKeys.filter(k => !config.excessCommands[k]);
        
            embed.addFields({
                name: '📁 Excess Command Folders',
                value: `✅ Loaded: ${loadedExcess.join(', ') || 'None'}\n❌ Unloaded: ${unloadedExcess.join(', ') || 'None'}`
            });
        
            // 🔹 Categories (slash command command.category)
            const categoryKeys = Object.keys(config.categories || {});
            const loadedCats = categoryKeys.filter(k => config.categories[k]);
            const unloadedCats = categoryKeys.filter(k => !config.categories[k]);
        
            embed.addFields({
                name: '📂 Slash Command Categories',
                value: `✅ Loaded: ${loadedCats.join(', ') || 'None'}\n❌ Unloaded: ${unloadedCats.join(', ') || 'None'}`
            });
        
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
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
