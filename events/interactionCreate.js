const fs = require('fs');
const path = require('path');
const { categories } = require('../config.json');
const lang = require('./loadLanguage');
const client = require('../main');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const VerificationConfig = require('../models/gateVerification/verificationConfig');
const verificationCodes = new Map();
const SuggestionVote = require('../models/suggestions/SuggestionVote');
const truths = require('../data/truthordare/truth.json');
const dares = require('../data/truthordare/dare.json');
const DisabledCommand = require('../models/commands/DisabledCommands'); 
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // 🟣 Button Logic for Truth or Dare
        if (interaction.isButton()) {
            const { customId, user } = interaction;
             // Handle Button Interactions (Verification Button)
   
            if (interaction.customId === 'verify_button') {
                // Generate a random verification code
                const verificationCode = Math.random().toString(36).slice(2, 8).toUpperCase();
                verificationCodes.set(interaction.user.id, verificationCode);

                const modal = new ModalBuilder()
                    .setCustomId('verify_modal')
                    .setTitle('Verification');

                const input = new TextInputBuilder()
                    .setCustomId('verify_input')
                    .setLabel(`Enter this code: ${verificationCode}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(input);
                modal.addComponents(row);

                await interaction.showModal(modal);
            }
            if (customId.startsWith('tod_')) {
                await interaction.deferUpdate(); // acknowledge interaction
        
                let result;
        
                if (customId === 'tod_truth') {
                    result = `🧠 **Truth:** ${truths[Math.floor(Math.random() * truths.length)]}`;
                } else if (customId === 'tod_dare') {
                    result = `🔥 **Dare:** ${dares[Math.floor(Math.random() * dares.length)]}`;
                } else if (customId === 'tod_random') {
                    const pool = Math.random() < 0.5 ? truths : dares;
                    const label = pool === truths ? '🧠 **Truth:**' : '🔥 **Dare:**';
                    result = `${label} ${pool[Math.floor(Math.random() * pool.length)]}`;
                }
        
                const embed = new EmbedBuilder()
                    .setTitle('🎲 Your Truth or Dare!')
                    .setDescription(result)
                    .setColor('#00ccff')
                    .setFooter({ text: `${user.username} picked this`, iconURL: user.displayAvatarURL() })
                    .setTimestamp();
        
                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('tod_truth')
                        .setLabel('Truth 🧠')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('tod_dare')
                        .setLabel('Dare 🔥')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('tod_random')
                        .setLabel('Random 🎲')
                        .setStyle(ButtonStyle.Secondary)
                );
        
                // Post the new message to the same channel, publicly
                return interaction.channel.send({ embeds: [embed], components: [buttons] });
            }
            if (['suggestion_yes', 'suggestion_no'].includes(customId)) {
                const messageId = interaction.message.id;
                const voteType = customId === 'suggestion_yes' ? 'yes' : 'no';
            
                try {
                    await SuggestionVote.findOneAndUpdate(
                        { messageId, userId: user.id },
                        { vote: voteType, votedAt: new Date() },
                        { upsert: true }
                    );
            
                    const allVotes = await SuggestionVote.find({ messageId });
                    const yesVotes = allVotes.filter(v => v.vote === 'yes').length;
                    const noVotes = allVotes.filter(v => v.vote === 'no').length;
            
                    const embed = EmbedBuilder.from(interaction.message.embeds[0])
                        .setFields(
                            { name: 'Submitted by', value: interaction.message.embeds[0].fields[0].value, inline: true },
                            { name: '👍 Yes Votes', value: `${yesVotes}`, inline: true },
                            { name: '👎 No Votes', value: `${noVotes}`, inline: true }
                        );
            
                    await interaction.update({ embeds: [embed] });
            
                } catch (err) {
                    console.error('❌ Error handling suggestion vote:', err);
                    await interaction.reply({ content: '⚠️ Could not register your vote. Please try again later.', ephemeral: true });
                }
            }
        }

        // Handle Modal Submissions (Verification Check)
        else if (interaction.isModalSubmit()) {
            const { customId, user } = interaction; 
            if (interaction.customId === 'verify_modal') {
                const userId = interaction.user.id;
                const userInput = interaction.fields.getTextInputValue('verify_input');
                const correctCode = verificationCodes.get(userId);

                if (!correctCode) {
                    return interaction.reply({ content: 'Verification expired! Click verify again.', ephemeral: true });
                }

                if (userInput !== correctCode) {
                    return interaction.reply({ content: 'Verification failed! Try again.', ephemeral: true });
                }

                const config = await VerificationConfig.findOne({ guildId: interaction.guild.id });
                if (!config) return;

                const member = interaction.guild.members.cache.get(userId);
                const unverifiedRole = interaction.guild.roles.cache.get(config.unverifiedRoleId);
                const verifiedRole = interaction.guild.roles.cache.get(config.verifiedRoleId);

                if (!verifiedRole) return interaction.reply({ content: '⚠️ Verified role not found.', ephemeral: true });

                // Remove Unverified Role and Assign Verified Role
                if (unverifiedRole) {
                    await member.roles.remove(unverifiedRole);
                }
                await member.roles.add(verifiedRole);
                verificationCodes.delete(userId);

                await interaction.reply({ content: '✅ Verification successful! You now have access to the server.', ephemeral: true });
                await member.send('🎉 You have been verified and can now access the server!');
            }
        
       
        }
        
        

        // 🟡 Slash Command Logic
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        
        // 🔒 Check if the command is disabled in this guild
        const subcommandName = interaction.options.getSubcommand(false);
        const isDisabled = await DisabledCommand.findOne({
            guildId: interaction.guild.id,
            commandName: interaction.commandName,
            ...(subcommandName ? { subcommandName } : {})
        });
        
        if (isDisabled) {
            try {
                await interaction.reply({
                    content: `❌ This command${subcommandName ? ` (${interaction.commandName} ${subcommandName})` : ''} is disabled in this server.`,
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('Error sending disabled command reply:', replyError);
            }
            return;
        }
        
        // 🟡 Category-based disabling
        const category = command.category || 'undefined';
        if (!categories[category]) {
            console.warn(`Command in category '${category}' is disabled.`);
            try {
                await interaction.reply({
                    content: lang.commandDisabled,
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('Error when sending command disabled reply:', replyError);
            }
            return;
        }
        
        // ✅ Execute command safely
        try {
            await command.execute(interaction, client);
        } catch (error) {
            if (error.code === 10062) return;
        
            if (error.message.includes('Interaction has already been acknowledged') ||
                error.message.includes('Unknown Message')) {
                console.warn('Interaction already replied or deferred error suppressed');
                return;
            }
        
            console.error(error);
        
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: lang.error, ephemeral: true });
                }
            } catch (replyError) {
                if (replyError.message.includes('Interaction has already been acknowledged') ||
                    replyError.message.includes('Unknown interaction')) return;
        
                console.error('Error when sending error reply:', replyError);
            }
        }
        
    },
};


const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).reduce((files, folder) => {
    const folderPath = path.join(commandsPath, folder);
    const fileNames = fs.readdirSync(folderPath);
    fileNames.forEach(file => {
        const filePath = path.join(folderPath, file);
        if (file.endsWith('.js')) {
            const command = require(filePath);
            command.category = folder; 
            files.set(command.name, command);
        }
    });
    return files;
}, new Map());

client.commands = commandFiles;
