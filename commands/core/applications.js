const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');
const { 
    createApplication, 
    deleteApplication, 
    activateApplication, 
    getApplication, 
    addQuestion, 
    removeQuestion
} = require('../../models/applications');
const { applicationCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('applications')
        .setDescription('📋 Manage applications.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)
                        .setMaxLength(30)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('activate')
                .setDescription('Activate an application.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the application.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addquestion')
                .setDescription('Add a question to an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('question')
                        .setDescription('The question to add (max 45 characters).')
                        .setRequired(true)
                        .setMaxLength(45)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removequestion')
                .setDescription('Remove a question from an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The question index to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setmainchannel')
                .setDescription('Set the main channel for an application.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The main channel for applications.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setresponsechannel')
                .setDescription('Set the response channel for application reviews.')
                .addStringOption(option =>
                    option.setName('appname')
                        .setDescription('The application name.')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The response channel for application reviews.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Get help with setting up applications.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show all applications and their details.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;

        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'create') {
            const name = interaction.options.getString('name');
            await createApplication(guildId, name);
            return interaction.editReply(`✅ Application **${name}** has been created.`);

        } else if (subcommand === 'delete') {
            const name = interaction.options.getString('name');
            
           
            const appExists = await getApplication(guildId, name);
            if (!appExists) {
                return interaction.editReply(`❌ Application **${name}** not found.`);
            }
            
           
            const deleted = await deleteApplication(guildId, name);
            
            if (deleted) {
                return interaction.editReply(`🗑️ Application **${name}** has been deleted.`);
            } else {
                return interaction.editReply(`❌ Failed to delete application **${name}**. Please try again.`);
            }

        }  else if (subcommand === 'activate') {
            const name = interaction.options.getString('name');
            const app = await getApplication(guildId, name);

            if (!app) return interaction.editReply(`❌ Application **${name}** not found.`);
            if (!app.mainChannel || !app.responseChannel) {
                return interaction.editReply(`⚠️ Please set the main and response channels first.`);
            }

            await activateApplication(guildId, name, app.mainChannel, app.responseChannel);

            const embed = new EmbedBuilder()
            .setDescription(`Application : **${name}**\n\n- Click the button below to fill out the application.\n- Make sure to provide accurate information.\n- Your responses will be reviewed by the moderators.\n\n- For any questions, please contact support.`)
    .setColor('Blue')
    .setAuthor({ name: 'Welcome To Our Application System', iconURL: 'https://cdn.discordapp.com/emojis/1052751247582699621.gif' }) 
    .setFooter({ text: 'Thank you for your interest!', iconURL: 'https://cdn.discordapp.com/emojis/798605720626003968.gif' }); 

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`open_application_modal_${name}`)
                .setLabel('Apply Now')
                .setStyle(ButtonStyle.Primary)
        );
            const mainChannel = interaction.guild.channels.cache.get(app.mainChannel);
            if (mainChannel) {
                mainChannel.send({ embeds: [embed], components: [button] });
            }

            return interaction.editReply(`✅ Application **${name}** is now active.`);

        } else if (subcommand === 'addquestion') {
            const name = interaction.options.getString('appname');
            const question = interaction.options.getString('question');

            const app = await getApplication(guildId, name);
            if (!app) return interaction.editReply(`❌ Application **${name}** not found.`);
            if (app.questions.length >= 5) return interaction.editReply(`⚠️ You can't add more than 5 questions.`);

            await addQuestion(guildId, name, question);
            return interaction.editReply(`✅ Question added to **${name}**.`);

        } else if (subcommand === 'removequestion') {
            const name = interaction.options.getString('appname');
            const index = interaction.options.getInteger('index');

            const app = await getApplication(guildId, name);
            if (!app) return interaction.editReply(`❌ Application **${name}** not found.`);

            await removeQuestion(guildId, name, index);
            return interaction.editReply(`🗑️ Removed question **#${index}** from **${name}**.`);

        } else if (subcommand === 'setmainchannel') {
            const name = interaction.options.getString('appname');
            const channel = interaction.options.getChannel('channel');

            const app = await getApplication(guildId, name);
            if (!app) return interaction.editReply(`❌ Application **${name}** not found.`);

            await activateApplication(guildId, name, channel.id, app.responseChannel);
            return interaction.editReply(`📢 Main channel for **${name}** set to ${channel}.`);

        } else if (subcommand === 'setresponsechannel') {
            const name = interaction.options.getString('appname');
            const channel = interaction.options.getChannel('channel');

            const app = await getApplication(guildId, name);
            if (!app) return interaction.editReply(`❌ Application **${name}** not found.`);

            await activateApplication(guildId, name, app.mainChannel, channel.id);
            return interaction.editReply(`📥 Response channel for **${name}** set to ${channel}.`);

        } else if (subcommand === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('📋 Application System Setup Guide')
                .setDescription('Follow these steps to set up an application system:')
                .addFields(
                    { name: '1️⃣ Create Application', value: '`/applications create name:<application-name>`\n*Creates a new application with the specified name.*' },
                    { name: '2️⃣ Add Questions', value: '`/applications addquestion appname:<application-name> question:<question-text>`\n*Add questions to your application (max 10 questions).*' },
                    { name: '3️⃣ Set Main Channel', value: '`/applications setmainchannel appname:<application-name> channel:<channel>`\n*Set the channel where users can see and apply.*' },
                    { name: '4️⃣ Set Response Channel', value: '`/applications setresponsechannel appname:<application-name> channel:<channel>`\n*Set the channel where staff will review submissions.*' },
                    { name: '5️⃣ Activate Application', value: '`/applications activate name:<application-name>`\n*Activates the application and posts the application form in the main channel.*' }
                )
                .addFields(
                    { name: '📝 Managing Applications', value: '`/applications show` - View all applications\n`/applications removequestion appname:<name> index:<number>` - Remove a question\n`/applications delete name:<application-name>` - Delete an application' }
                )
                .setFooter({ text: 'Applications must have channels set and at least one question before activation.' })
                .setTimestamp();

            return interaction.editReply({ embeds: [helpEmbed] });

        } else if (subcommand === 'show') {
            if (!applicationCollection) {
                console.error("❌ applicationCollection is undefined!");
                return interaction.editReply("❌ Database error! Please check the bot logs.");
            }
    
            const guildId = interaction.guild.id;
            const applications = await applicationCollection.find({ guildId }).toArray();
    
            if (!applications || applications.length === 0) {
                return interaction.editReply("❌ No applications found.");
            }
    
            const applicationDetails = applications.map((app, index) => {
                const status = app.isActive ? '🟢 Active' : '🔴 Inactive';
                const questions = app.questions.length > 0
                    ? app.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
                    : 'No questions added.';
                const mainChannel = app.mainChannel ? `<#${app.mainChannel}>` : 'Not set.';
                const responseChannel = app.responseChannel ? `<#${app.responseChannel}>` : 'Not set.';
    
                return `**${index + 1}. ${app.appName}**\n` +
                    `**Status:** ${status}\n` +
                    `**Questions:**\n${questions}\n` +
                    `**Main Channel:** ${mainChannel}\n` +
                    `**Response Channel:** ${responseChannel}\n`;
            });
    
            // **Splitting into pages (Limit: 2048)**
            const chunks = [];
            let currentChunk = '';
    
            for (const detail of applicationDetails) {
                if ((currentChunk + detail).length > 2048) {
                    chunks.push(currentChunk);
                    currentChunk = detail;
                } else {
                    currentChunk += detail + '\n';
                }
            }
            if (currentChunk) chunks.push(currentChunk);
    
            let currentPage = 0;
    
            // **Create Embed**
            const embed = new EmbedBuilder()
                .setColor(0x1E90FF)
                .setTitle('📋 Applications List')
                .setDescription(chunks[currentPage])
                .setFooter({ text: `Page ${currentPage + 1} of ${chunks.length}` })
                .setTimestamp();
    
            // **Pagination Buttons**
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(chunks.length === 1)
            );
    
            const reply = await interaction.editReply({ embeds: [embed], components: [row] });
    
            // **Button Collector**
            const filter = i => (i.customId === 'previous' || i.customId === 'next') && i.user.id === interaction.user.id;
            const collector = reply.createMessageComponentCollector({ filter, time: 60000 });
    
            collector.on('collect', async i => {
                if (i.customId === 'previous') currentPage--;
                if (i.customId === 'next') currentPage++;
    
                embed.setDescription(chunks[currentPage]);
                embed.setFooter({ text: `Page ${currentPage + 1} of ${chunks.length}` });
    
                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === chunks.length - 1);
    
                await i.update({ embeds: [embed], components: [row] });
            });
    
            collector.on('end', () => interaction.editReply({ components: [] }));
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/applications`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};