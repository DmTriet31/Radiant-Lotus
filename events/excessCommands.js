    const { hentaiCommandCollection, serverConfigCollection } = require('../mongodb');
    const { EmbedBuilder } = require('discord.js');
    const fs = require('fs');
    const path = require('path');
    const config = require('../config.json');
    const DisabledCommand = require('../models/commands/DisabledCommands');

    module.exports = {
        name: 'messageCreate',
        async execute(message, client) {
            if (message.author.bot) return;

            if (!message.guild) return;
            const hentaiSettings = await hentaiCommandCollection.findOne({ serverId: message.guild.id });

            
            let serverConfig;
            try {
                serverConfig = await serverConfigCollection.findOne({ serverId: message.guild.id });
            } catch (err) {
                console.error('Error fetching server configuration from MongoDB:', err);
            }

            const prefix = serverConfig?.prefix || config.prefix;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

       
            const excessCommandsPath = path.join(__dirname, '..', 'excesscommands');
            let command;

            try {
             
                const commandFolders = fs.readdirSync(excessCommandsPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

            
                for (const folder of commandFolders) {
                    const commandPath = path.join(excessCommandsPath, folder, `${commandName}.js`);
                    
                    if (fs.existsSync(commandPath)) {
                        if (folder === 'hentai') {
                            if (!hentaiSettings?.status) {
                                return message.reply('Hentai commands are currently disabled.');
                            }
                        }
                    
                        if (config.excessCommands &&
                            (folder === 'hentai' || config.excessCommands[folder])) {
                            command = require(commandPath);
                    
                         
                            const isDisabled = await DisabledCommand.findOne({
                                guildId: message.guild.id,
                                commandName
                            });
                    
                            if (isDisabled) {
                                return message.reply(`❌ The \`${prefix}${commandName}\` command is disabled in this server.`);
                            }
                    
                            break;
                        }
                    }
                    
                }
            } catch (error) {
                console.error('Error loading commands:', error);
                return message.reply('Error loading commands.');
            }

            if (!command) return;

            try {
                await command.execute(message, args, client);
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Command Error')
                    .setDescription(`An error occurred while executing the \`${commandName}\` command.`)
                    .addFields({ name: 'Error Details:', value: error.message });

                message.reply({ embeds: [errorEmbed] });
            }
        }
    };