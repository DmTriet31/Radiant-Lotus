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

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cmdIcons = require('../../UI/icons/commandicons');
const apiKey = 'AIzaSyBuif-wNw_Eov5TESRW15qEsn3buSdrxqc'; 

async function translateText(text, targetLanguage) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const requestBody = {
        q: text,
        target: targetLanguage,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error('Failed to fetch translation');

        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return 'Error occurred while translating.';
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('word')
        .setDescription('Get word definitions, dictionary meanings, or translations.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('define')
                .setDescription('Get the definition of a word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to define.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dictionary')
                .setDescription('Look up a word in the dictionary.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to look up.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('Translate text into another language.')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to translate.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('language')
                        .setDescription('Target language (e.g., en, fr, de).')
                        .setRequired(true))),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'define') {
            // Handle Definition
            const word = interaction.options.getString('word');
            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

            try {
                const response = await axios.get(apiUrl);
                const data = response.data[0];

                if (!data) {
                    return interaction.reply(`❌ No definition found for **${word}**.`);
                }

                const phonetic = data.phonetic || 'N/A';
                const meanings = data.meanings.map(meaning => ({
                    partOfSpeech: meaning.partOfSpeech,
                    definitions: meaning.definitions.slice(0, 2).map(def => ({
                        definition: def.definition,
                        example: def.example || 'No example available.',
                    })),
                }));

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Definition of ${word}`)
                    .setDescription(`**Phonetic:** ${phonetic}`)
                    .setTimestamp();

                meanings.forEach(meaning => {
                    embed.addFields({
                        name: `Part of Speech: ${meaning.partOfSpeech}`,
                        value: meaning.definitions.map(def => `**Definition:** ${def.definition}\n**Example:** ${def.example}`).join('\n\n'),
                    });
                });

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply(`❌ Error retrieving definition for **${word}**.`);
            }

        } else if (subcommand === 'dictionary') {
            // Handle Dictionary Lookup
            const word = interaction.options.getString('word');

            try {
                const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                const data = response.data[0];

                if (!data) {
                    return interaction.reply(`❌ No dictionary entry found for **${word}**.`);
                }

                const embed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle(`Dictionary Definition: ${word}`)
                    .setDescription(`**Definition:** ${data.meanings[0].definitions[0].definition}\n\n**Example:** ${data.meanings[0].definitions[0].example || 'No example available'}\n\n**Synonyms:** ${data.meanings[0].definitions[0].synonyms ? data.meanings[0].definitions[0].synonyms.join(', ') : 'No synonyms available'}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply(`❌ Error retrieving dictionary entry for **${word}**.`);
            }

        } else if (subcommand === 'translate') {
            // Handle Translation
            const textToTranslate = interaction.options.getString('text');
            const targetLanguage = interaction.options.getString('language');

            try {
                const translatedText = await translateText(textToTranslate, targetLanguage);

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Translation Result')
                    .setDescription(`**Original:** ${textToTranslate}\n**Translated (${targetLanguage}):** ${translatedText}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply(`❌ Error translating text.`);
            }
        }
    } else {
        const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setAuthor({ 
            name: "Alert!", 
            iconURL: cmdIcons.dotIcon ,
            url: "https://discord.gg/xQF9f9yUEM"
        })
        .setDescription('- This command can only be used through slash command!\n- Please use `/word`')
        .setTimestamp();
    
        await interaction.reply({ embeds: [embed] });
    
        } 
    },
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
