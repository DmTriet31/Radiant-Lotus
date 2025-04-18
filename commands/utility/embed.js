const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedCollection, scheduleCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const cron = require('node-cron'); 
const { v4: uuidv4 } = require('uuid'); 

const checkPermissions = require('../../utils/checkPermissions');
const activeSchedules = new Map();


async function loadSchedules(client) {
    const schedules = await scheduleCollection.find({}).toArray();
    for (const schedule of schedules) {
        createScheduleJob(schedule, client);
    }
    console.log(`Loaded ${schedules.length} scheduled announcements`);
}


function createScheduleJob(schedule, client) {
    const { id, cronExpression, guildId, channelId, embedName, mentionRoleId, messageContent } = schedule;
    
    try {
        // Create the cron job
        const job = cron.schedule(cronExpression, async () => {
            try {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) return console.error(`Guild ${guildId} not found for schedule ${id}`);
                
                const channel = guild.channels.cache.get(channelId);
                if (!channel) return console.error(`Channel ${channelId} not found for schedule ${id}`);
                
                const embedData = await embedCollection.findOne({ name: embedName.toLowerCase() });
                if (!embedData) return console.error(`Embed ${embedName} not found for schedule ${id}`);
                
                // Build the embed
                const embed = buildEmbedFromData(embedData);
                
                // Handle mention
                let content = messageContent || '';
                if (mentionRoleId) {
                    const role = guild.roles.cache.get(mentionRoleId);
                    if (role) content = `${role.toString()} ${content}`;
                }
                
                // Send the message
                await channel.send({ content, embeds: [embed] });
                console.log(`Scheduled announcement ${id} sent to ${channel.name} in ${guild.name}`);
            } catch (error) {
                console.error(`Error executing scheduled announcement ${id}:`, error);
            }
        });
        
        // Store the job
        activeSchedules.set(id, job);
        return true;
    } catch (error) {
        console.error(`Failed to create schedule job ${id}:`, error);
        return false;
    }
}

// Build an embed from data
function buildEmbedFromData(embedData) {
    const embed = new EmbedBuilder();
    
    // Set color (convert string HEX to number or use default)
    if (embedData.color) {
        try {
            embed.setColor(embedData.color.startsWith('#') ? 
                parseInt(embedData.color.replace('#', ''), 16) : 
                embedData.color);
        } catch (e) {
            embed.setColor(0x3498db); // Default blue
        }
    }
    
    // Set basic properties
    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.url) embed.setURL(embedData.url);
    if (embedData.description) embed.setDescription(embedData.description);
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
    if (embedData.image) embed.setImage(embedData.image);
    if (embedData.timestamp) embed.setTimestamp(new Date());
    
    // Set author
    if (embedData.author?.name) {
        embed.setAuthor({
            name: embedData.author.name,
            iconURL: embedData.author.icon || null,
            url: embedData.author.url || null
        });
    }
    
    // Set footer
    if (embedData.footer?.text) {
        embed.setFooter({
            text: embedData.footer.text,
            iconURL: embedData.footer.icon || null
        });
    }
    
    // Add fields
    if (embedData.fields?.length) {
        embed.addFields(embedData.fields.map(f => ({
            name: f.name,
            value: f.value,
            inline: f.inline || false
        })));
    }
    
    return embed;
}

// Convert human-readable schedule to cron expression
function parseSchedule(frequency, time) {
    // Format of time should be HH:MM (24-hour)
    const [hours, minutes] = time.split(':').map(Number);
    
    switch (frequency) {
        case 'hourly':
            return `${minutes} * * * *`;
        case 'daily':
            return `${minutes} ${hours} * * *`;
        case 'weekly_monday':
            return `${minutes} ${hours} * * 1`;
        case 'weekly_tuesday':
            return `${minutes} ${hours} * * 2`;
        case 'weekly_wednesday':
            return `${minutes} ${hours} * * 3`;
        case 'weekly_thursday':
            return `${minutes} ${hours} * * 4`;
        case 'weekly_friday':
            return `${minutes} ${hours} * * 5`;
        case 'weekly_saturday':
            return `${minutes} ${hours} * * 6`;
        case 'weekly_sunday':
            return `${minutes} ${hours} * * 0`;
        case 'monthly':
            return `${minutes} ${hours} 1 * *`;
        default:
            throw new Error('Invalid frequency');
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create, manage, and schedule rich embeds and announcements.')

        // Save Embed
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('Save an embed for later use.')
                .addStringOption(option => option.setName('name').setDescription('Unique embed name').setRequired(true))
                .addStringOption(option => option.setName('color').setDescription('Hex color (e.g., #ff5733)').setRequired(false))
                .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(false))
                .addStringOption(option => option.setName('url').setDescription('Title URL').setRequired(false))
                .addStringOption(option => option.setName('author_name').setDescription('Author name').setRequired(false))
                .addStringOption(option => option.setName('author_icon').setDescription('Author icon URL').setRequired(false))
                .addStringOption(option => option.setName('author_url').setDescription('Author URL').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('Embed description').setRequired(false))
                .addStringOption(option => option.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false))
                .addStringOption(option => option.setName('fields').setDescription('Fields (JSON format: [{"name":"Name","value":"Value"}])').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('Image URL').setRequired(false))
                .addBooleanOption(option => option.setName('timestamp').setDescription('Include timestamp?').setRequired(false))
                .addStringOption(option => option.setName('footer_text').setDescription('Footer text').setRequired(false))
                .addStringOption(option => option.setName('footer_icon').setDescription('Footer icon URL').setRequired(false)))

        // Delete Embed
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a saved embed.')
                .addStringOption(option => 
                    option.setName('name')
                        .setDescription('Saved embed name')
                        .setRequired(true)
                        .setAutocomplete(true)))

        // View Saved Embeds
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View saved embeds.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the saved embed to view (leave empty to see all names)')
                        .setRequired(false)
                        .setAutocomplete(true)))

        // Send Announcement
        .addSubcommand(subcommand =>
            subcommand
                .setName('announce')
                .setDescription('Send an announcement with a saved or new embed.')
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send the embed').setRequired(true))
                .addStringOption(option => 
                    option.setName('embed_name')
                        .setDescription('Saved embed name (leave empty for new)')
                        .setRequired(false)
                        .setAutocomplete(true))
                .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('Embed description').setRequired(false))
                .addStringOption(option => option.setName('color').setDescription('Hex color (e.g., #ff5733)').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('Image URL').setRequired(false))
                .addStringOption(option => option.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false))
                .addStringOption(option => option.setName('footer_text').setDescription('Footer text').setRequired(false))
                .addStringOption(option => option.setName('footer_icon').setDescription('Footer icon URL').setRequired(false))
                .addRoleOption(option => option.setName('mention_role').setDescription('Role to mention').setRequired(false))
                .addStringOption(option => option.setName('message_content').setDescription('Text before the embed').setRequired(false))
                .addIntegerOption(option => option.setName('delay').setDescription('Delay in seconds before sending').setRequired(false)
                    .setMinValue(0).setMaxValue(3600)))

        // Schedule recurring announcements
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedule recurring announcements')
                .addStringOption(option => 
                    option.setName('embed_name')
                        .setDescription('Saved embed to use')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send the embed').setRequired(true))
                .addStringOption(option => 
                    option.setName('frequency')
                        .setDescription('How often to send the announcement')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Hourly', value: 'hourly' },
                            { name: 'Daily', value: 'daily' },
                            { name: 'Weekly - Monday', value: 'weekly_monday' },
                            { name: 'Weekly - Tuesday', value: 'weekly_tuesday' },
                            { name: 'Weekly - Wednesday', value: 'weekly_wednesday' },
                            { name: 'Weekly - Thursday', value: 'weekly_thursday' },
                            { name: 'Weekly - Friday', value: 'weekly_friday' },
                            { name: 'Weekly - Saturday', value: 'weekly_saturday' },
                            { name: 'Weekly - Sunday', value: 'weekly_sunday' },
                            { name: 'Monthly (1st day)', value: 'monthly' }
                        ))
                .addStringOption(option => 
                    option.setName('time')
                        .setDescription('Time to send (24h format, e.g. 14:30)')
                        .setRequired(true))
                .addRoleOption(option => option.setName('mention_role').setDescription('Role to mention').setRequired(false))
                .addStringOption(option => option.setName('message_content').setDescription('Text before the embed').setRequired(false))
                .addStringOption(option => option.setName('name').setDescription('Friendly name for this schedule').setRequired(false)))

        // Manage schedules
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedules')
                .setDescription('View and manage scheduled announcements')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to perform')
                        .setRequired(true)
                        .addChoices(
                            { name: 'List all schedules', value: 'list' },
                            { name: 'View schedule details', value: 'view' },
                            { name: 'Delete a schedule', value: 'delete' }
                        ))
                .addStringOption(option => 
                    option.setName('schedule_id')
                        .setDescription('ID of the schedule (required for view/delete)')
                        .setRequired(false)
                        .setAutocomplete(true))),

    async autocomplete(interaction) {
        if (!await checkPermissions(interaction)) return;
        const focusedOption = interaction.options.getFocused(true);
        let choices = [];

        if (focusedOption.name === 'name' || focusedOption.name === 'embed_name') {
            // Get all embed names
            const embeds = await embedCollection.find({}, { projection: { name: 1 } }).toArray();
            choices = embeds.map(embed => ({ name: embed.name, value: embed.name }));
        } 
        else if (focusedOption.name === 'schedule_id') {
            // Get all schedule IDs and names
            const schedules = await scheduleCollection.find({}, { projection: { id: 1, name: 1, embedName: 1 } }).toArray();
            choices = schedules.map(schedule => ({ 
                name: `${schedule.name || schedule.embedName} (${schedule.id.slice(0, 8)})`, 
                value: schedule.id 
            }));
        }

        // Filter based on current input
        const filtered = choices.filter(choice => 
            choice.name.toLowerCase().includes(focusedOption.value.toLowerCase())
        );

        // Respond with up to 25 filtered choices
        await interaction.respond(filtered.slice(0, 25));
    },

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ 
                content: '🚫 You need the "Manage Channels" permission to use this command.',
                ephemeral: true 
            });
        }

        const subcommand = interaction.options.getSubcommand();

        // SAVE EMBED SUBCOMMAND
        if (subcommand === 'save') {
            const name = interaction.options.getString('name').toLowerCase();
            let fields = interaction.options.getString('fields');

            // Validate JSON fields
            try {
                fields = fields ? JSON.parse(fields) : [];
                if (!Array.isArray(fields)) throw new Error();
                
                // Validate each field has name and value
                for (const field of fields) {
                    if (!field.name || !field.value) {
                        throw new Error('Each field must have a name and value');
                    }
                }
            } catch (error) {
                return interaction.reply({ 
                    content: '❌ Invalid fields format. Use JSON like `[{"name":"Field","value":"Value","inline":false}]`.',
                    ephemeral: true 
                });
            }

            // Validate Hex Color
            const color = interaction.options.getString('color');
            if (color && !/^#([0-9A-F]{6})$/i.test(color)) {
                return interaction.reply({ 
                    content: '❌ Invalid color format. Use HEX (e.g., `#ff5733`).',
                    ephemeral: true 
                });
            }

            // Validate URLs
            const urlFields = ['url', 'author_icon', 'author_url', 'thumbnail', 'image', 'footer_icon'];
            for (const field of urlFields) {
                const value = interaction.options.getString(field);
                if (value && !/^https?:\/\//.test(value)) {
                    return interaction.reply({ 
                        content: `❌ Invalid URL in **${field}**. Ensure it starts with \`http://\` or \`https://\`.`,
                        ephemeral: true 
                    });
                }
            }

            // Construct embed data
            const embedData = {
                name: name,
                color: color || '#3498db',
                title: interaction.options.getString('title') || null,
                url: interaction.options.getString('url') || null,
                author: {
                    name: interaction.options.getString('author_name') || null,
                    icon: interaction.options.getString('author_icon') || null,
                    url: interaction.options.getString('author_url') || null
                },
                description: interaction.options.getString('description') || null,
                thumbnail: interaction.options.getString('thumbnail') || null,
                fields: fields,
                image: interaction.options.getString('image') || null,
                footer: {
                    text: interaction.options.getString('footer_text') || null,
                    icon: interaction.options.getString('footer_icon') || null
                },
                timestamp: interaction.options.getBoolean('timestamp') || false,
                createdBy: interaction.user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Check if embed already exists
            const existingEmbed = await embedCollection.findOne({ name });
            const isUpdate = !!existingEmbed;

            // Create preview of the embed
            const previewEmbed = buildEmbedFromData(embedData);
            
            // Create action row with buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_save_${name}`)
                        .setLabel(isUpdate ? 'Update Embed' : 'Save Embed')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('cancel_save')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            // Send a preview with confirmation buttons
            const response = await interaction.reply({
                content: isUpdate ? 
                    `⚠️ An embed named **${name}** already exists. Do you want to update it?` : 
                    `📝 Preview of your embed **${name}**:`,
                embeds: [previewEmbed],
                components: [row],
                ephemeral: true
            });

            // Wait for button interaction
            try {
                const confirmation = await response.awaitMessageComponent({ time: 60000 });
                
                if (confirmation.customId === `confirm_save_${name}`) {
                    // Save the embed
                    await embedCollection.updateOne(
                        { name }, 
                        { $set: embedData }, 
                        { upsert: true }
                    );
                    
                    await confirmation.update({
                        content: `✅ Embed **${name}** has been ${isUpdate ? 'updated' : 'saved'} successfully!`,
                        embeds: [previewEmbed],
                        components: []
                    });
                } else {
                    // Cancel
                    await confirmation.update({
                        content: '❌ Action cancelled.',
                        embeds: [],
                        components: []
                    });
                }
            } catch (error) {
                // Timeout
                await interaction.editReply({
                    content: '⏱️ Confirmation timed out. No changes were made.',
                    embeds: [previewEmbed],
                    components: []
                });
            }
        }

        // VIEW EMBED(S) SUBCOMMAND
        else if (subcommand === 'view') {
            const embedName = interaction.options.getString('name');

            // If no embed name is provided, show all saved embed names
            if (!embedName) {
                const embeds = await embedCollection.find().toArray();
                if (embeds.length === 0) {
                    return interaction.reply({ 
                        content: '❌ No saved embeds found.',
                        ephemeral: true 
                    });
                }

                // Create pages of 10 embeds each
                const pages = [];
                for (let i = 0; i < embeds.length; i += 10) {
                    const pageEmbeds = embeds.slice(i, i + 10);
                    const embedList = pageEmbeds.map((e, index) => {
                        const createdDate = e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Unknown';
                        return `${i + index + 1}. **${e.name}** - Created: ${createdDate}`;
                    }).join('\n');
                    
                    const embed = new EmbedBuilder()
                        .setTitle('📜 Saved Embeds')
                        .setDescription(embedList)
                        .setColor('#3498db')
                        .setFooter({ text: `Page ${Math.floor(i/10) + 1}/${Math.ceil(embeds.length/10)}` });
                    
                    pages.push(embed);
                }

                // If only one page
                if (pages.length === 1) {
                    return interaction.reply({ 
                        embeds: [pages[0]], 
                        ephemeral: true 
                    });
                }

                // Create navigation buttons
                let currentPage = 0;
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('◀️ Previous')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Next ▶️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(pages.length <= 1)
                    );

                const response = await interaction.reply({
                    embeds: [pages[0]],
                    components: [row],
                    ephemeral: true
                });

                // Create collector for button interactions
                const collector = response.createMessageComponentCollector({ 
                    time: 180000 // 3 minutes
                });

                collector.on('collect', async i => {
                    // Update page based on button
                    if (i.customId === 'prev_page') {
                        currentPage--;
                    } else if (i.customId === 'next_page') {
                        currentPage++;
                    }

                    // Update button states
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === pages.length - 1);

                    // Update message
                    await i.update({
                        embeds: [pages[currentPage]],
                        components: [row]
                    });
                });

                collector.on('end', async () => {
                    // Disable buttons when collector ends
                    row.components.forEach(component => component.setDisabled(true));
                    
                    try {
                        await interaction.editReply({
                            embeds: [pages[currentPage]],
                            components: [row]
                        });
                    } catch (error) {
                        // Message might be deleted, ignore error
                    }
                });

                return;
            }

            // If an embed name is provided, show the full embed
            const embedData = await embedCollection.findOne({ name: embedName.toLowerCase() });
            if (!embedData) {
                return interaction.reply({ 
                    content: `❌ No embed found with the name **${embedName}**.`,
                    ephemeral: true 
                });
            }

            // Create the embed
            const embed = buildEmbedFromData(embedData);
            
            // Create action row with buttons for various actions
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`edit_${embedName}`)
                        .setLabel('✏️ Edit')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`delete_${embedName}`)
                        .setLabel('🗑️ Delete')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`announce_${embedName}`)
                        .setLabel('📢 Announce')
                        .setStyle(ButtonStyle.Success)
                );
            
            // Send embed with action buttons
            const response = await interaction.reply({
                content: `📝 Viewing embed **${embedName}**`,
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
            
            // Create collector for button interactions
            const collector = response.createMessageComponentCollector({ 
                time: 180000 // 3 minutes
            });
            
            collector.on('collect', async i => {
                const action = i.customId.split('_')[0];
                
                if (action === 'delete') {
                    // Show delete confirmation
                    const confirmRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirm_delete_${embedName}`)
                                .setLabel('Confirm Delete')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('cancel_delete')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                        );
                    
                    await i.update({
                        content: `⚠️ Are you sure you want to delete **${embedName}**?`,
                        components: [confirmRow]
                    });
                }
                else if (action === 'confirm') {
                    const deleteAction = i.customId.split('_')[1];
                    if (deleteAction === 'delete') {
                        // Delete the embed
                        await embedCollection.deleteOne({ name: embedName.toLowerCase() });
                        
                        await i.update({
                            content: `✅ Embed **${embedName}** has been deleted.`,
                            embeds: [],
                            components: []
                        });
                        
                        collector.stop();
                    }
                }
                else if (action === 'cancel') {
                    // Restore original view
                    await i.update({
                        content: `📝 Viewing embed **${embedName}**`,
                        embeds: [embed],
                        components: [row]
                    });
                }
                else if (action === 'edit') {
                    // Notify user to use the save command
                    await i.reply({
                        content: `To edit this embed, use \`/embed save name:${embedName}\` with the properties you want to change.`,
                        ephemeral: true
                    });
                }
                else if (action === 'announce') {
                    // Notify user to use the announce command
                    await i.reply({
                        content: `To announce this embed, use \`/embed announce embed_name:${embedName} channel:#your-channel\``,
                        ephemeral: true
                    });
                }
            });
            
            collector.on('end', async () => {
                // Disable buttons when collector ends
                row.components.forEach(component => component.setDisabled(true));
                
                try {
                    await interaction.editReply({
                        content: `📝 Viewing embed **${embedName}** (controls expired)`,
                        embeds: [embed],
                        components: [row]
                    });
                } catch (error) {
                    // Message might be deleted, ignore error
                }
            });
        }

        // DELETE EMBED SUBCOMMAND
        else if (subcommand === 'delete') {
            const name = interaction.options.getString('name').toLowerCase();
            const embed = await embedCollection.findOne({ name });

            if (!embed) {
                return interaction.reply({ 
                    content: `❌ No embed found with the name **${name}**.`,
                    ephemeral: true 
                });
            }

            // Create preview of the embed to be deleted
            const previewEmbed = buildEmbedFromData(embed);
            
            // Create confirmation buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_delete_${name}`)
                        .setLabel('Delete Embed')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_delete')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            // Send confirmation with preview
            const response = await interaction.reply({
                content: `⚠️ Are you sure you want to delete the embed **${name}**?`,
                embeds: [previewEmbed],
                components: [row],
                ephemeral: true
            });

            // Wait for button interaction
            try {
                const confirmation = await response.awaitMessageComponent({ time: 60000 });
                
                if (confirmation.customId === `confirm_delete_${name}`) {
                    // Delete the embed
                    await embedCollection.deleteOne({ name });
                    
                    // Also delete any schedules that use this embed
                    const deletedSchedules = await scheduleCollection.find({ embedName: name }).toArray();
                    for (const schedule of deletedSchedules) {
                        if (activeSchedules.has(schedule.id)) {
                            activeSchedules.get(schedule.id).stop();
                            activeSchedules.delete(schedule.id);
                        }
                    }
                    await scheduleCollection.deleteMany({ embedName: name });
                    
                    await confirmation.update({
                        content: `✅ Embed **${name}** has been deleted successfully!`,
                        embeds: [],
                        components: []
                    });
                } else {
                    // Cancel
                    await confirmation.update({
                        content: '❌ Action cancelled.',
                        embeds: [],
                        components: []
                    });
                }
            } catch (error) {
                // Timeout
                await interaction.editReply({
                    content: '⏱️ Confirmation timed out. No changes were made.',
                    components: []
                });
            }
        }

        // ANNOUNCE SUBCOMMAND
        else if (subcommand === 'announce') {
            const channel = interaction.options.getChannel('channel');
            const embedName = interaction.options.getString('embed_name');
            const mentionRole = interaction.options.getRole('mention_role');
            const messageContent = interaction.options.getString('message_content') || '';
            const delay = interaction.options.getInteger('delay') || 0;

            // Validate channel permissions
            if (!channel.isTextBased()) {
                return interaction.reply({ 
                    content: '❌ The selected channel must be a text channel.',
                    ephemeral: true
                });
            }

            // Check if bot has permission to send messages to the channel
            try {
                const permissions = channel.permissionsFor(interaction.guild.members.me);
                if (!permissions.has(PermissionsBitField.Flags.SendMessages) || 
                    !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                        return interaction.reply({
                            content: "❌ I don't have permission to send messages in that channel.",
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error("Error checking permissions:", error);
                    return interaction.reply({
                        content: "❌ Failed to verify channel permissions. Please check if I have access to that channel.",
                        ephemeral: true
                    });
                }
    
                let embed;
    
                // If using a saved embed
                if (embedName) {
                    const embedData = await embedCollection.findOne({ name: embedName.toLowerCase() });
                    if (!embedData) {
                        return interaction.reply({ 
                            content: `❌ No embed found with the name **${embedName}**.`,
                            ephemeral: true
                        });
                    }
    
                    // Construct the embed from saved data
                    embed = buildEmbedFromData(embedData);
                }
                // If creating a new embed
                else {
                    const color = interaction.options.getString('color');
                    
                    // Validate fields are provided
                    if (!interaction.options.getString('title') && 
                        !interaction.options.getString('description')) {
                        return interaction.reply({
                            content: "❌ Please provide at least a title or description for your embed.",
                            ephemeral: true
                        });
                    }
    
                    // Create new embed
                    embed = new EmbedBuilder()
                        .setColor(color ? 
                            color.startsWith('#') ? parseInt(color.replace('#', ''), 16) : 0x3498db 
                            : 0x3498db)
                        .setTimestamp();
    
                    // Add optional fields
                    if (interaction.options.getString('title')) 
                        embed.setTitle(interaction.options.getString('title'));
                        
                    if (interaction.options.getString('description')) 
                        embed.setDescription(interaction.options.getString('description'));
                        
                    if (interaction.options.getString('image')) 
                        embed.setImage(interaction.options.getString('image'));
                        
                    if (interaction.options.getString('thumbnail')) 
                        embed.setThumbnail(interaction.options.getString('thumbnail'));
                        
                    if (interaction.options.getString('footer_text')) {
                        embed.setFooter({
                            text: interaction.options.getString('footer_text'),
                            iconURL: interaction.options.getString('footer_icon') || null
                        });
                    }
                }
    
                // Format message content with mention if needed
                const content = mentionRole ? 
                    `${mentionRole.toString()} ${messageContent}`.trim() : 
                    messageContent;
                
                // Display preview with confirmation buttons
                const previewRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_send')
                            .setLabel(delay > 0 ? 
                                `Send after ${delay} seconds` : 
                                'Send Now')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancel_send')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    
                // Send confirmation with preview
                const response = await interaction.reply({
                    content: `📝 Preview of your announcement for ${channel}:` + 
                             (content.length > 0 ? `\n\nMessage content: "${content}"` : ""),
                    embeds: [embed],
                    components: [previewRow],
                    ephemeral: true
                });
    
                // Wait for button interaction
                try {
                    const confirmation = await response.awaitMessageComponent({ time: 60000 });
                    
                    if (confirmation.customId === 'confirm_send') {
                        if (delay > 0) {
                            // Schedule the message
                            await confirmation.update({
                                content: `⏳ Your announcement will be sent to ${channel} in ${delay} seconds.`,
                                embeds: [embed],
                                components: []
                            });
                            
                            // Create a countdown if delay is longer than 5 seconds
                            if (delay > 5) {
                                const startTime = Date.now();
                                const endTime = startTime + (delay * 1000);
                                const intervalTime = Math.min(5, Math.floor(delay / 5)) * 1000; // Update every 5 seconds or less
                                
                                const countdownInterval = setInterval(async () => {
                                    const now = Date.now();
                                    const remainingTime = Math.ceil((endTime - now) / 1000);
                                    
                                    if (remainingTime <= 0) {
                                        clearInterval(countdownInterval);
                                        return;
                                    }
                                    
                                    try {
                                        await interaction.editReply({
                                            content: `⏳ Your announcement will be sent to ${channel} in ${remainingTime} seconds.`,
                                            embeds: [embed],
                                            components: []
                                        });
                                    } catch (error) {
                                        clearInterval(countdownInterval);
                                    }
                                }, intervalTime);
                            }
                            
                            // Set timeout to send message
                            setTimeout(async () => {
                                try {
                                    await channel.send({ content, embeds: [embed] });
                                    
                                    try {
                                        await interaction.editReply({
                                            content: `✅ Announcement sent successfully to ${channel}!`,
                                            embeds: [embed],
                                            components: []
                                        });
                                    } catch (error) {
                                        // Original reply might be deleted or expired, ignore error
                                    }
                                } catch (error) {
                                    console.error("Error sending delayed announcement:", error);
                                    
                                    try {
                                        await interaction.editReply({
                                            content: `❌ Failed to send announcement: ${error.message}`,
                                            embeds: [],
                                            components: []
                                        });
                                    } catch (replyError) {
                                        // Original reply might be deleted or expired, ignore error
                                    }
                                }
                            }, delay * 1000);
                        } else {
                            // Send immediately
                            try {
                                await channel.send({ content, embeds: [embed] });
                                
                                await confirmation.update({
                                    content: `✅ Announcement sent successfully to ${channel}!`,
                                    embeds: [embed],
                                    components: []
                                });
                            } catch (error) {
                                await confirmation.update({
                                    content: `❌ Failed to send announcement: ${error.message}`,
                                    embeds: [],
                                    components: []
                                });
                            }
                        }
                    } else {
                        // Cancel
                        await confirmation.update({
                            content: '❌ Announcement cancelled.',
                            embeds: [],
                            components: []
                        });
                    }
                } catch (error) {
                    // Timeout
                    await interaction.editReply({
                        content: '⏱️ Confirmation timed out. Announcement was not sent.',
                        components: []
                    });
                }
            }
    
            // SCHEDULE SUBCOMMAND
            else if (subcommand === 'schedule') {
                const embedName = interaction.options.getString('embed_name').toLowerCase();
                const channel = interaction.options.getChannel('channel');
                const frequency = interaction.options.getString('frequency');
                const time = interaction.options.getString('time');
                const mentionRole = interaction.options.getRole('mention_role');
                const messageContent = interaction.options.getString('message_content') || '';
                const scheduleName = interaction.options.getString('name') || `${embedName}-${frequency}`;
                
                // Validate channel
                if (!channel.isTextBased()) {
                    return interaction.reply({
                        content: "❌ The selected channel must be a text channel.",
                        ephemeral: true
                    });
                }
                
                // Validate permissions
                try {
                    const permissions = channel.permissionsFor(interaction.guild.members.me);
                    if (!permissions.has(PermissionsBitField.Flags.SendMessages) || 
                        !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                        return interaction.reply({
                            content: "❌ I don't have permission to send messages in that channel.",
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    return interaction.reply({
                        content: "❌ Failed to verify channel permissions.",
                        ephemeral: true
                    });
                }
                
                // Validate time format
                if (!/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(time)) {
                    return interaction.reply({
                        content: "❌ Invalid time format. Please use 24-hour format (HH:MM).",
                        ephemeral: true
                    });
                }
                
                // Validate embed exists
                const embedData = await embedCollection.findOne({ name: embedName });
                if (!embedData) {
                    return interaction.reply({
                        content: `❌ No embed found with the name **${embedName}**.`,
                        ephemeral: true
                    });
                }
                
                try {
                    // Generate cron expression
                    const cronExpression = parseSchedule(frequency, time);
                    
                    // Create unique ID for this schedule
                    const scheduleId = uuidv4();
                    
                    // Create schedule object
                    const schedule = {
                        id: scheduleId,
                        name: scheduleName,
                        cronExpression,
                        frequency,
                        time,
                        guildId: interaction.guild.id,
                        channelId: channel.id,
                        embedName,
                        mentionRoleId: mentionRole ? mentionRole.id : null,
                        messageContent,
                        createdBy: interaction.user.id,
                        createdAt: new Date()
                    };
                    
                    // Create human-readable schedule description
                    let scheduleDescription;
                    if (frequency === 'hourly') {
                        scheduleDescription = `Every hour at ${time.split(':')[1]} minutes past the hour`;
                    } else if (frequency === 'daily') {
                        scheduleDescription = `Every day at ${time}`;
                    } else if (frequency.startsWith('weekly')) {
                        const day = frequency.split('_')[1];
                        scheduleDescription = `Every ${day.charAt(0).toUpperCase() + day.slice(1)} at ${time}`;
                    } else if (frequency === 'monthly') {
                        scheduleDescription = `On the 1st day of each month at ${time}`;
                    }
                    
                    // Create preview embed
                    const previewEmbed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('⏰ Scheduled Announcement')
                        .addFields(
                            { name: 'Schedule', value: scheduleDescription, inline: false },
                            { name: 'Channel', value: channel.toString(), inline: true },
                            { name: 'Embed', value: embedName, inline: true },
                            { name: 'Name', value: scheduleName, inline: true }
                        )
                        .setFooter({ text: `ID: ${scheduleId.slice(0, 8)}...` })
                        .setTimestamp();
                    
                    if (mentionRole) {
                        previewEmbed.addFields({ name: 'Mention', value: mentionRole.toString(), inline: true });
                    }
                    if (messageContent) {
                        previewEmbed.addFields({ name: 'Additional Message', value: messageContent, inline: false });
                    }
                    
                    // Create confirm buttons
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirm_schedule_${scheduleId}`)
                                .setLabel('Create Schedule')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('cancel_schedule')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                        );
                    
                    // Show preview and confirmation
                    const response = await interaction.reply({
                        content: `📝 Preview of your scheduled announcement:`,
                        embeds: [previewEmbed],
                        components: [row],
                        ephemeral: true
                    });
                    
                    // Wait for button interaction
                    try {
                        const confirmation = await response.awaitMessageComponent({ time: 60000 });
                        
                        if (confirmation.customId === `confirm_schedule_${scheduleId}`) {
                            // Create the schedule in database
                            await scheduleCollection.insertOne(schedule);
                            
                            // Create the actual scheduled job
                            const success = createScheduleJob(schedule, client);
                            
                            if (success) {
                                await confirmation.update({
                                    content: `✅ Scheduled announcement created successfully!`,
                                    embeds: [previewEmbed],
                                    components: []
                                });
                            } else {
                                await confirmation.update({
                                    content: `❌ Failed to create the schedule job. The schedule was saved but may not work.`,
                                    embeds: [previewEmbed],
                                    components: []
                                });
                            }
                        } else {
                            // Cancel
                            await confirmation.update({
                                content: '❌ Schedule creation cancelled.',
                                embeds: [],
                                components: []
                            });
                        }
                    } catch (error) {
                        // Timeout
                        await interaction.editReply({
                            content: '⏱️ Confirmation timed out. Schedule was not created.',
                            components: []
                        });
                    }
                } catch (error) {
                    console.error("Error creating schedule:", error);
                    return interaction.reply({
                        content: `❌ Failed to create schedule: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
    
            // SCHEDULES SUBCOMMAND (Manage Schedules)
            else if (subcommand === 'schedules') {
                const action = interaction.options.getString('action');
                const scheduleId = interaction.options.getString('schedule_id');
                
                // LIST ALL SCHEDULES
                if (action === 'list') {
                    const schedules = await scheduleCollection.find({ guildId: interaction.guild.id }).toArray();
                    
                    if (schedules.length === 0) {
                        return interaction.reply({
                            content: '📆 No scheduled announcements found.',
                            ephemeral: true
                        });
                    }
                    
                    // Create pages of 5 schedules each
                    const pages = [];
                    for (let i = 0; i < schedules.length; i += 5) {
                        const pageSchedules = schedules.slice(i, i + 5);
                        
                        const embed = new EmbedBuilder()
                            .setTitle('📆 Scheduled Announcements')
                            .setColor('#3498db')
                            .setFooter({ text: `Page ${Math.floor(i/5) + 1}/${Math.ceil(schedules.length/5)}` });
                        
                        for (const schedule of pageSchedules) {
                            let scheduleDescription;
                            if (schedule.frequency === 'hourly') {
                                scheduleDescription = `Every hour at ${schedule.time.split(':')[1]} minutes past the hour`;
                            } else if (schedule.frequency === 'daily') {
                                scheduleDescription = `Every day at ${schedule.time}`;
                            } else if (schedule.frequency.startsWith('weekly')) {
                                const day = schedule.frequency.split('_')[1];
                                scheduleDescription = `Every ${day.charAt(0).toUpperCase() + day.slice(1)} at ${schedule.time}`;
                            } else if (schedule.frequency === 'monthly') {
                                scheduleDescription = `On the 1st day of each month at ${schedule.time}`;
                            }
                            
                            const channel = interaction.guild.channels.cache.get(schedule.channelId) || 'Unknown Channel';
                            
                            embed.addFields({
                                name: schedule.name || schedule.embedName,
                                value: `ID: \`${schedule.id.slice(0, 8)}...\`\n` +
                                      `Embed: \`${schedule.embedName}\`\n` +
                                      `Channel: ${channel.toString ? channel.toString() : channel}\n` +
                                      `Schedule: ${scheduleDescription}\n` +
                                      `Created: <t:${Math.floor(new Date(schedule.createdAt).getTime() / 1000)}:R>`,
                                inline: false
                            });
                        }
                        
                        pages.push(embed);
                    }
                    
                    // If only one page
                    if (pages.length === 1) {
                        return interaction.reply({ 
                            embeds: [pages[0]], 
                            ephemeral: true 
                        });
                    }
                    
                    // Create navigation buttons
                    let currentPage = 0;
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev_page')
                                .setLabel('◀️ Previous')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next_page')
                                .setLabel('Next ▶️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(pages.length <= 1)
                        );
                    
                    const response = await interaction.reply({
                        embeds: [pages[0]],
                        components: [row],
                        ephemeral: true
                    });
                    
                    // Create collector for button interactions
                    const collector = response.createMessageComponentCollector({ 
                        time: 180000 // 3 minutes
                    });
                    
                    collector.on('collect', async i => {
                        // Update page based on button
                        if (i.customId === 'prev_page') {
                            currentPage--;
                        } else if (i.customId === 'next_page') {
                            currentPage++;
                        }
                        
                        // Update button states
                        row.components[0].setDisabled(currentPage === 0);
                        row.components[1].setDisabled(currentPage === pages.length - 1);
                        
                        // Update message
                        await i.update({
                            embeds: [pages[currentPage]],
                            components: [row]
                        });
                    });
                    
                    collector.on('end', async () => {
                        // Disable buttons when collector ends
                        row.components.forEach(component => component.setDisabled(true));
                        
                        try {
                            await interaction.editReply({
                                embeds: [pages[currentPage]],
                                components: [row]
                            });
                        } catch (error) {
                            // Message might be deleted, ignore error
                        }
                    });
                }
                
                // VIEW SPECIFIC SCHEDULE
                else if (action === 'view') {
                    if (!scheduleId) {
                        return interaction.reply({
                            content: '❌ Please provide a schedule ID to view.',
                            ephemeral: true
                        });
                    }
                    
                    const schedule = await scheduleCollection.findOne({ id: scheduleId });
                    
                    if (!schedule) {
                        return interaction.reply({
                            content: '❌ Schedule not found. Please check the ID and try again.',
                            ephemeral: true
                        });
                    }
                    
                    // Get channel info
                    const channel = interaction.guild.channels.cache.get(schedule.channelId) || 'Unknown Channel';
                    
                    // Create human-readable schedule description
                    let scheduleDescription;
                    if (schedule.frequency === 'hourly') {
                        scheduleDescription = `Every hour at ${schedule.time.split(':')[1]} minutes past the hour`;
                    } else if (schedule.frequency === 'daily') {
                        scheduleDescription = `Every day at ${schedule.time}`;
                    } else if (schedule.frequency.startsWith('weekly')) {
                        const day = schedule.frequency.split('_')[1];
                        scheduleDescription = `Every ${day.charAt(0).toUpperCase() + day.slice(1)} at ${schedule.time}`;
                    } else if (schedule.frequency === 'monthly') {
                        scheduleDescription = `On the 1st day of each month at ${schedule.time}`;
                    }
                    
                    // Create embed view
                    const embed = new EmbedBuilder()
                        .setTitle(`📆 ${schedule.name || schedule.embedName}`)
                        .setDescription(`Details for scheduled announcement with ID: \`${schedule.id}\``)
                        .setColor('#3498db')
                        .addFields(
                            { name: 'Embed', value: `\`${schedule.embedName}\``, inline: true },
                            { name: 'Channel', value: channel.toString ? channel.toString() : channel, inline: true },
                            { name: 'Schedule', value: scheduleDescription, inline: false },
                            { name: 'Cron Expression', value: `\`${schedule.cronExpression}\``, inline: true },
                            { name: 'Created', value: `<t:${Math.floor(new Date(schedule.createdAt).getTime() / 1000)}:F>`, inline: true }
                        )
                        .setFooter({ text: `Created by: ${interaction.guild.members.cache.get(schedule.createdBy)?.user.tag || 'Unknown User'}` })
                        .setTimestamp();
                    
                    if (schedule.mentionRoleId) {
                        const role = interaction.guild.roles.cache.get(schedule.mentionRoleId) || 'Unknown Role';
                        embed.addFields({ 
                            name: 'Mentions', 
                            value: role.toString ? role.toString() : role, 
                            inline: true 
                        });
                    }
                    
                    if (schedule.messageContent) {
                        embed.addFields({ 
                            name: 'Additional Message', 
                            value: schedule.messageContent, 
                            inline: false 
                        });
                    }
                    
                    // Create action buttons
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`delete_schedule_${schedule.id}`)
                                .setLabel('🗑️ Delete Schedule')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(`view_embed_${schedule.embedName}`)
                                .setLabel('👀 View Embed')
                                .setStyle(ButtonStyle.Secondary)
                        );
                    
                    const response = await interaction.reply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: true
                    });
                    
                    // Handle button interactions
                    const collector = response.createMessageComponentCollector({ 
                        time: 180000 
                    });
                    
                    collector.on('collect', async i => {
                        if (i.customId === `delete_schedule_${schedule.id}`) {
                            // Show delete confirmation
                            const confirmRow = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`confirm_delete_schedule_${schedule.id}`)
                                        .setLabel('Confirm Delete')
                                        .setStyle(ButtonStyle.Danger),
                                    new ButtonBuilder()
                                        .setCustomId('cancel_delete_schedule')
                                        .setLabel('Cancel')
                                        .setStyle(ButtonStyle.Secondary)
                                );
                            
                            await i.update({
                                content: `⚠️ Are you sure you want to delete this scheduled announcement?`,
                                components: [confirmRow]
                            });
                        } 
                        else if (i.customId === `confirm_delete_schedule_${schedule.id}`) {
                            // Stop the schedule job if it exists
                            if (activeSchedules.has(schedule.id)) {
                                activeSchedules.get(schedule.id).stop();
                                activeSchedules.delete(schedule.id);
                            }
                            
                            // Delete from database
                            await scheduleCollection.deleteOne({ id: schedule.id });
                            
                            await i.update({
                                content: `✅ Schedule deleted successfully.`,
                                embeds: [],
                                components: []
                            });
                            
                            collector.stop();
                        }
                        else if (i.customId === 'cancel_delete_schedule') {
                            // Restore original view
                            await i.update({
                                content: null,
                                embeds: [embed],
                                components: [row]
                            });
                        }
                        else if (i.customId === `view_embed_${schedule.embedName}`) {
                            // Show the user the embed preview
                            const embedData = await embedCollection.findOne({ name: schedule.embedName.toLowerCase() });
                            
                            if (!embedData) {
                                await i.reply({
                                    content: `❌ Embed "${schedule.embedName}" not found. It may have been deleted.`,
                                    ephemeral: true
                                });
                                return;
                            }
                            
                            const embedPreview = buildEmbedFromData(embedData);
                            
                            await i.reply({
                                content: `📝 Preview of embed **${schedule.embedName}**:`,
                                embeds: [embedPreview],
                                ephemeral: true
                            });
                        }
                    });
                    
                    collector.on('end', async () => {
                     
                        row.components.forEach(component => component.setDisabled(true));
                        
                        try {
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row]
                            });
                        } catch (error) {
                            // Message might be deleted, ignore error
                        }
                    });
                }
                
                // DELETE SCHEDULE
                else if (action === 'delete') {
                    if (!scheduleId) {
                        return interaction.reply({
                            content: '❌ Please provide a schedule ID to delete.',
                            ephemeral: true
                        });
                    }
                    
                    const schedule = await scheduleCollection.findOne({ id: scheduleId });
                    
                    if (!schedule) {
                        return interaction.reply({
                            content: '❌ Schedule not found. Please check the ID and try again.',
                            ephemeral: true
                        });
                    }
                    
                  
                    const channel = interaction.guild.channels.cache.get(schedule.channelId) || 'Unknown Channel';
                    
                  
                    let scheduleDescription;
                    if (schedule.frequency === 'hourly') {
                        scheduleDescription = `Every hour at ${schedule.time.split(':')[1]} minutes past the hour`;
                    } else if (schedule.frequency === 'daily') {
                        scheduleDescription = `Every day at ${schedule.time}`;
                    } else if (schedule.frequency.startsWith('weekly')) {
                        const day = schedule.frequency.split('_')[1];
                        scheduleDescription = `Every ${day.charAt(0).toUpperCase() + day.slice(1)} at ${schedule.time}`;
                    } else if (schedule.frequency === 'monthly') {
                        scheduleDescription = `On the 1st day of each month at ${schedule.time}`;
                    }
                    
                  
                    const embed = new EmbedBuilder()
                        .setTitle(`⚠️ Delete Scheduled Announcement`)
                        .setDescription(`Are you sure you want to delete this scheduled announcement?`)
                        .setColor('#ff3333')
                        .addFields(
                            { name: 'ID', value: `\`${schedule.id}\``, inline: true },
                            { name: 'Name', value: schedule.name || schedule.embedName, inline: true },
                            { name: 'Embed', value: `\`${schedule.embedName}\``, inline: true },
                            { name: 'Channel', value: channel.toString ? channel.toString() : channel, inline: true },
                            { name: 'Schedule', value: scheduleDescription, inline: true }
                        )
                        .setTimestamp();
                    
                    // Create confirmation buttons
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`confirm_delete_schedule_${schedule.id}`)
                                .setLabel('Delete Schedule')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('cancel_delete_schedule')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                        );
                    
                    const response = await interaction.reply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: true
                    });
                    
                   
                    try {
                        const confirmation = await response.awaitMessageComponent({ time: 60000 });
                        
                        if (confirmation.customId === `confirm_delete_schedule_${schedule.id}`) {
                            // Stop the schedule job if it exists
                            if (activeSchedules.has(schedule.id)) {
                                activeSchedules.get(schedule.id).stop();
                                activeSchedules.delete(schedule.id);
                            }
                            
                            // Delete from database
                            await scheduleCollection.deleteOne({ id: schedule.id });
                            
                            await confirmation.update({
                                content: `✅ Schedule deleted successfully.`,
                                embeds: [],
                                components: []
                            });
                        } else {
                            // Cancel
                            await confirmation.update({
                                content: '❌ Action cancelled.',
                                embeds: [],
                                components: []
                            });
                        }
                    } catch (error) {
                        // Timeout
                        await interaction.editReply({
                            content: '⏱️ Confirmation timed out. No changes were made.',
                            components: []
                        });
                    }
                }
            }
        },
        
        
        init: async (client) => {
            await loadSchedules(client);
        }
    };