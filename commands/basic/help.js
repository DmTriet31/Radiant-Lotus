const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const cmdIcons = require('../../UI/icons/commandicons');
const { helpBanner } = require('../../UI/banners/SetupBanners');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the command list and bot information'),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            // Constants for styling
            const BOT_ICON = "https://cdn.discordapp.com/attachments/1316896145393586227/1357331068688011365/standard_1.gif?ex=67efd090&is=67ee7f10&hm=4250dfedab995219647a7ff3509637d1ed2c9b841abf21b54cf2d87544c2c901&";
            const EMBED_COLOR = "#5865F2"; // Discord blurple for a more modern look
            const FOOTER_TEXT = "Radiant Lotus | The Discord Operating System • Created by DmTriet";
            const COMMANDS_DIR = path.join(__dirname, '../../commands');
            const EXCESS_COMMANDS_DIR = path.join(__dirname, '../../excesscommands');

            // Safe category icons using standard Discord emojis
            const CATEGORY_ICONS = {
                utility: "🛠️",
                moderation: "🛡️",
                fun: "🎮",
                music: "🎵",
                economy: "💰",
                admin: "⚙️",
                info: "ℹ️",
                games: "🎲",
                settings: "🔧",
                misc: "📦"
                // Add more category-specific icons as needed
            };
        
            const getEnabledCategories = (configSet) =>
                Object.entries(configSet)
                    .filter(([_, enabled]) => enabled)
                    .map(([name]) => name);

        
            const readCommands = (basePath, categories) => {
                const commandData = {};
                for (const [category, enabled] of Object.entries(categories)) {
                    if (!enabled) continue;
                    const categoryPath = path.join(basePath, category);

                    try {
                        if (!fs.existsSync(categoryPath)) {
                            continue;
                        }

                        const commands = fs.readdirSync(categoryPath)
                            .filter(file => file.endsWith('.js'))
                            .map(file => {
                                try {
                                    const cmd = require(path.join(categoryPath, file));
                                  
                                    let subcommands = [];
                                    if (cmd.data?.toJSON) {
                                        const dataJSON = cmd.data.toJSON();
                                        if (dataJSON.options && Array.isArray(dataJSON.options)) {
                                            for (const option of dataJSON.options) {
                                               
                                                if (option.type === 1) {
                                                    subcommands.push(option.name);
                                                } else if (option.type === 2 && option.options) {
                                                    const groupSubs = option.options
                                                        .filter(opt => opt.type === 1)
                                                        .map(opt => opt.name);
                                                    subcommands.push(`${option.name}: ${groupSubs.join(', ')}`);
                                                }
                                            }
                                        }
                                    }
                                    return {
                                        name: cmd.data?.name || cmd.name || 'unnamed-command',
                                        description: cmd.data?.description || cmd.description || 'No description provided',
                                        subcommands: subcommands
                                    };
                                } catch (error) {
                                    console.error(`Error loading command ${file} in ${category}:`, error);
                                    return null;
                                }
                            })
                            .filter(cmd => cmd !== null);

                        if (commands.length > 0) {
                            commandData[category] = commands;
                        }
                    } catch (error) {
                        console.error(`Error loading ${category} commands:`, error);
                    }
                }
                return commandData;
            };

            // Create Pages for the help embed with enhanced styling
            const createPages = (commandSet, type) => {
                const pages = [];
                const prefixCount = Object.values(prefixCommands).reduce((acc, cmds) => acc + cmds.length, 0);
                const totalCommandsLoaded = Object.values(commandSet).reduce((acc, cmds) => acc + cmds.length, 0);
                let masterCount = 0;
                let subCount = 0;
                for (const category in commandSet) {
                    const cmds = commandSet[category];
                    masterCount += cmds.length;
                    for (const cmd of cmds) {
                        subCount += (cmd.subcommands ? cmd.subcommands.length : 0);
                    }
                }
                const totalCount = masterCount + subCount + prefixCount;

                // Enhanced Info Page
                pages.push({
                    title: '✨ Radiant Lotus',
                    description: [
                        '### THE DISCORD OPERATING SYSTEM',
                        '',
                        '> The ultimate Discord bot for all your server needs',
                        '',
                        '**BOT STATISTICS**',
                        `\`🧠\` **Version:** 1.2.2`,
                        `\`🛠️\` **Total Commands:** ${totalCount}`,
                        `\`⚙️\` **Commands Loaded:** ${totalCommandsLoaded}`,
                        `\`📌\` **Master Commands:** ${masterCount}`,
                        `\`📎\` **Sub Commands:** ${subCount}`,
                        `\`💻\` **Prefix Commands:** ${Object.values(config.excessCommands).some(v => v) ? '`Enabled`' : '`Disabled`'}`,
                        '',
                    ].join('\n'),
                    author: { name: 'Radiant Lotus • COMMAND CENTER' },
                    icon: '📚' // Safe icon for dropdown
                });

                // Enhanced Command Pages for each category
                for (const [category, commands] of Object.entries(commandSet)) {
                    if (commands.length === 0) continue;

                    // Calculate the total subcommands in this category
                    const totalSubcommands = commands.reduce((acc, cmd) => {
                        return acc + (cmd.subcommands ? cmd.subcommands.length : 0);
                    }, 0);
                    const totalNoOfCommands = commands.length + totalSubcommands;
                    
                    // Get category icon or use a default
                    const categoryIcon = CATEGORY_ICONS[category.toLowerCase()] || "📁";
                    
                    const commandLines = commands.map(cmd => {
                        let line = `\`${cmd.name}\` • ${cmd.description}`;
                        if (cmd.subcommands && cmd.subcommands.length > 0) {
                            // Improved subcommands formatting
                            line += `\n> **Subcommands (${cmd.subcommands.length}):**\n`;
                            cmd.subcommands.forEach(subcmd => {
                                line += `> • \`${subcmd}\`\n`;
                            });
                        }
                        return line;
                    });

                    pages.push({
                        title: `${categoryIcon} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                        description: [
                            `### ${category.toUpperCase()} COMMAND MODULE`,
                            '',
                            '**MODULE STATISTICS**',
                            `\`📊\` **Total Commands:** ${totalNoOfCommands}`,
                            `\`🔍\` **Master Commands:** ${commands.length}`,
                            `\`🔗\` **Integrated Subcommands:** ${totalSubcommands}`,
                            `\`⌨️\` **Usage Type:** ${type === 'slash' ? '`Slash Commands`' : `\`Prefix: ${config.prefix}\``}`,
                            ''
                        ].join('\n'),
                        commands: commandLines,
                        author: { name: `${category.toUpperCase()} • COMMAND MODULE` },
                        icon: categoryIcon // Safe icon for dropdown
                    });
                }

                return pages;
            };

            // Generate Command Sets
            const slashCommands = readCommands(COMMANDS_DIR, config.categories);
            const prefixCommands = readCommands(EXCESS_COMMANDS_DIR, config.excessCommands);

            const slashPages = createPages(slashCommands, 'slash');
            const prefixPages = createPages(prefixCommands, 'prefix');

            // Interaction Handling Variables
            let currentPage = 0;
            let currentSet = slashPages;
            let isPrefix = false;

            // Function to create the embed for the current page
            const createEmbed = () => {
                const page = currentSet[currentPage];
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle(page.title)
                    .setDescription(page.description)
                    .setAuthor({
                        name: page.author.name,
                        iconURL: BOT_ICON,
                        url: "https://discord.gg/tWeNVsxzRN"
                    })
                    .setImage(helpBanner)
                    .setFooter({ text: `${FOOTER_TEXT} • Page ${currentPage + 1}/${currentSet.length}` })
                    .setTimestamp();

                // Handle command list fields with improved formatting
                if (page.commands && page.commands.length > 0) {
                    const joinedCommands = page.commands.join('\n\n');
                    if (joinedCommands.length > 1024) {
                        const fields = [];
                        let fieldValue = '';
                        let fieldCount = 1;

                        for (const line of page.commands) {
                            // +2 for double newline character
                            if (fieldValue.length + line.length + 2 > 1024) {
                                fields.push({ 
                                    name: `Command List (Part ${fieldCount})`, 
                                    value: fieldValue.trim() 
                                });
                                fieldCount++;
                                fieldValue = line + '\n\n';
                            } else {
                                fieldValue += line + '\n\n';
                            }
                        }
                        if (fieldValue) {
                            fields.push({ 
                                name: `Command List ${fieldCount > 1 ? `(Part ${fieldCount})` : ''}`, 
                                value: fieldValue.trim() 
                            });
                        }
                        embed.setFields(fields);
                    } else {
                        embed.setFields([{ name: '💎 Available Commands', value: joinedCommands }]);
                    }
                }
                return embed;
            };

            // Function to create action rows with fixed dropdown menu
            const createComponents = () => {
                // Fixed dropdown - using predefined emoji strings instead of extracted ones
                const row1 = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('pageSelect')
                        .setPlaceholder('📋 Select a category...')
                        .addOptions(currentSet.map((page, i) => {
                            return {
                                label: page.title.replace(/^[^\w\s]\s*/, ''), // Remove any leading emoji
                                value: i.toString(),
                                description: `View ${page.title.replace(/^[^\w\s]\s*/, '')} section`,
                                emoji: page.icon // Use predefined safe emoji
                            };
                        }))
                );

                // Better styled buttons
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === currentSet.length - 1),
                    new ButtonBuilder()
                        .setCustomId('switchMode')
                        .setLabel(isPrefix ? 'Slash Commands' : 'Prefix Commands')
                        .setEmoji('🔄')
                        .setStyle(ButtonStyle.Primary)
                );

                return [row1, row2];
            };

            // Send initial reply
            const reply = await interaction.reply({
                embeds: [createEmbed()],
                components: createComponents(),
                fetchReply: true
            });

            // Collector Setup to handle interactions
            const collector = reply.createMessageComponentCollector({ time: 180000 }); // Extended time to 3 minutes

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({ 
                        content: `⚠️ Only ${interaction.user.tag} can interact with these controls.`, 
                        ephemeral: true 
                    });
                    return;
                }

                if (i.isStringSelectMenu()) {
                    currentPage = parseInt(i.values[0]);
                } else if (i.isButton()) {
                    switch (i.customId) {
                        case 'previous':
                            currentPage = Math.max(0, currentPage - 1);
                            break;
                        case 'next':
                            currentPage = Math.min(currentSet.length - 1, currentPage + 1);
                            break;
                        case 'switchMode':
                            isPrefix = !isPrefix;
                            currentSet = isPrefix ? prefixPages : slashPages;
                            currentPage = 0;
                            break;
                    }
                }

                await i.update({
                    embeds: [createEmbed()],
                    components: createComponents()
                });
            });

            collector.on('end', () => {
                // Disable all buttons when collector expires
                const disabledComponents = createComponents().map(row => {
                    const updatedRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        if (component.data.type === 2) { // Button type
                            updatedRow.addComponents(
                                ButtonBuilder.from(component.data).setDisabled(true)
                            );
                        } else if (component.data.type === 3) { // StringSelectMenu type
                            updatedRow.addComponents(
                                StringSelectMenuBuilder.from(component.data).setDisabled(true)
                            );
                        }
                    });
                    return updatedRow;
                });
                
                interaction.editReply({ 
                    components: disabledComponents,
                    content: "⏱️ Help command session expired. Use `/help` again to restart."
                }).catch(() => {});
            });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff3860')
                .setAuthor({
                    name: "Command Error",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/tWeNVsxzRN"
                })
                .setDescription('> ⚠️ This command can only be used as a slash command!\n> Please use `/help` instead.')
                .setFooter({ text: 'Radiant Lotus • Error' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
