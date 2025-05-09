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

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { stickyMessageCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-stickymessage')
        .setDescription('Manage sticky messages for a channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)

        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Set a sticky message in a channel.')
                .addBooleanOption(option =>
                    option.setName('active')
                        .setDescription('Activate the sticky message? (true/false)')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select the channel for the sticky message')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('content')
                        .setDescription('The text content of the sticky message (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title of the embed (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description of the embed (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('footer')
                        .setDescription('Footer text of the embed (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription('Image URL for the embed (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('thumbnail')
                        .setDescription('Thumbnail URL for the embed (optional)')
                        .setRequired(false))
        )

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View all sticky messages set for this server.')
        )

        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a sticky message by index.')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The index of the sticky message to delete')
                        .setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const guildId = interaction.guild.id;
        if (!await checkPermissions(interaction)) return;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const channel = interaction.options.getChannel('channel');
            const content = interaction.options.getString('content') || '';
            const title = interaction.options.getString('title') || '';
            const description = interaction.options.getString('description') || '';
            const footer = interaction.options.getString('footer') || '';
            const image = interaction.options.getString('image') || '';
            const thumbnail = interaction.options.getString('thumbnail') || '';
            const active = interaction.options.getBoolean('active');

            const embed = new EmbedBuilder();
            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description);
            if (footer) embed.setFooter({ text: footer });
            if (image) embed.setImage(image);
            if (thumbnail) embed.setThumbnail(thumbnail);
            embed.setColor('#00e5ff');

            await stickyMessageCollection.insertOne({
                guildId,
                channelId: channel.id,
                content,
                embed: title || description || footer || image || thumbnail ? embed.toJSON() : null,
                active
            });

            return interaction.reply({
                content: `✅ Sticky message set for <#${channel.id}>.`,
                flags: 64
            });
        }

        if (subcommand === 'view') {
            const messages = await stickyMessageCollection.find({ guildId }).toArray();
            if (messages.length === 0) {
              return interaction.reply({ content: 'ℹ️ No sticky messages set.', flags: 64 });
            }
      
            // Build a description that includes the channel, status, and (if set) the embed title.
            const description = messages.map((msg, index) => {
              let line = `**${index + 1}.** <#${msg.channelId}> - ${msg.active ? '✅ Active' : '❌ Inactive'}`;
              if (msg.embed && msg.embed.title) {
                line += ` | Embed Title: \`${msg.embed.title}\``;
              }
              return line;
            }).join('\n');
      
            const embed = new EmbedBuilder()
              .setTitle('📌 Sticky Messages')
              .setColor('#00e5ff')
              .setDescription(description)
              .setTimestamp();
      
            return interaction.reply({ embeds: [embed], flags: 64 });
          }

        if (subcommand === 'delete') {
            const index = interaction.options.getInteger('index') - 1;
            const messages = await stickyMessageCollection.find({ guildId }).toArray();

            if (!messages[index]) {
                return interaction.reply({ content: '❌ Invalid index.', flags: 64 });
            }

            await stickyMessageCollection.deleteOne({ _id: messages[index]._id });

            return interaction.reply({ content: `🗑️ Sticky message **#${index + 1}** deleted.`, flags: 64 });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-stickymessage`')
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
