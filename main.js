const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const config = require('./config.json');
const colors = require('./UI/colors/colors');
const loadLogHandlers = require('./logHandlers');
const scanCommands = require('./utils/scanCommands');
const { EmbedBuilder, Partials } = require('discord.js');
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
    partials: [Partials.Channel]
});
const { connectToDatabase } = require('./mongodb');
client.commands = new Collection();
require('events').defaultMaxListeners = 100;


const loadEvents = require('./handlers/events');


loadEvents(client);


async function fetchExpectedCommandsCount() {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/expected-commands-count');
        return response.data.expectedCommandsCount;
    } catch (error) {
        return -1;
    }
}

async function verifyCommandsCount() {

    console.log('\n' + '─'.repeat(60));
    console.log(`${colors.yellow}${colors.bright}             🔍 VERIFICATION 🔍${colors.reset}`);
    console.log('─'.repeat(60));

    const expectedCommandsCount = await fetchExpectedCommandsCount();
    const registeredCommandsCount = scanCommands(config);


    if (expectedCommandsCount === -1) {
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Server Status: OFFLINE ❌${colors.reset}`);
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Unable to verify commands${colors.reset}`);
        return;
    }


    if (registeredCommandsCount !== expectedCommandsCount) {
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Commands Mismatch Detected ⚠️${colors.reset}`);
        console.log(`${colors.yellow}[ DETAILS ]${colors.reset} ${colors.red}Current Commands: ${colors.reset}${registeredCommandsCount}`);
        console.log(`${colors.yellow}[ DETAILS ]${colors.reset} ${colors.red}Expected Commands: ${colors.reset}${expectedCommandsCount}`);
        console.log(`${colors.yellow}[ STATUS  ]${colors.reset} ${colors.red}Action Required: Please verify command integrity${colors.reset}`);
    } else {
        console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}Command Count: ${registeredCommandsCount} ✓${colors.reset}`);
        console.log(`${colors.cyan}[ SECURITY ]${colors.reset} ${colors.green}Command Integrity Verified ✅${colors.reset}`);
        console.log(`${colors.cyan}[ STATUS   ]${colors.reset} ${colors.green}Bot is Secured and Ready 🛡️${colors.reset}`);
    }

    // Footer
    console.log('─'.repeat(60));
}
const fetchAndRegisterCommands = async () => {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/commands');
        const commands = response.data;

        commands.forEach(command => {
            command.source = 'shiva';
            client.commands.set(command.name, {
                ...command,
                execute: async (interaction) => {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle(command.embed.title)
                            .setDescription(command.embed.description)
                            .setImage(command.embed.image)
                            .addFields(command.embed.fields)
                            .setColor(command.embed.color)
                            .setFooter({
                                text: command.embed.footer.text,
                                iconURL: command.embed.footer.icon_url
                            })
                            .setAuthor({
                                name: command.embed.author.name,
                                iconURL: command.embed.author.icon_url
                            });

                        await interaction.reply({ embeds: [embed] });
                    } catch (error) {
                        //console.error(`Error executing command ${command.name}:`, error);
                        //await interaction.reply('Failed to execute the command.');
                    }
                }
            });
        });
        //console.log('Commands fetched and registered successfully.');
    } catch (error) {
        //console.error('Error fetching commands:', error);
    }
};

require('./handlers/security')(client);     
require('./handlers/applications')(client); 
require('./handlers/server');  
require('./handlers/economyScheduler')(client);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || config.token);

client.once('ready', async () => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}👾  BOT INFORMATION${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.red}[ CORE ]${colors.reset} ${colors.green}Bot Name:  ${colors.reset}${client.user.tag}`);
    console.log(`${colors.red}[ CORE ]${colors.reset} ${colors.green}Client ID: ${colors.reset}${client.user.id}`);

    loadLogHandlers(client);

    try {
        await verifyCommandsCount();
        await fetchAndRegisterCommands();
        await require('./handlers/commands')(client, config, colors);


    } catch (error) {
        console.log(`${colors.red}[ ERROR ]${colors.reset} ${colors.red}${error}${colors.reset}`);
    }
});




connectToDatabase().then(() => {
    console.log('\x1b[36m[ DATABASE ]\x1b[0m', '\x1b[32mMongoDB Online ✅\x1b[0m');
}).catch(console.error);


client.login(process.env.TOKEN || config.token);

module.exports = client;
