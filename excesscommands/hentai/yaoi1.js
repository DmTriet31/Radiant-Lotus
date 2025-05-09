const { EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');

module.exports = {
    name: 'yaoi1',
    description: 'Fetches a random yaoi gif.',
    async execute(message, args) {
        if (!message.channel.nsfw) {
            return message.reply('This command can only be used in NSFW channels.');
        }

        try {
            const gifUrl = await gifs.nsfw.yaoi();

            const embed = new EmbedBuilder()
                .setTitle('Yaoi Gif')
                .setImage(gifUrl)
                .setColor('#ff69b4');

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('Something went wrong while fetching the gif. Please try again later.');
        }
    },
};
