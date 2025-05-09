const { EmbedBuilder } = require('discord.js');
const { images } = require('mediacord');

module.exports = {
    name: 'hass',
    description: 'Fetches a random hentai ass image.',
    async execute(message, args) {
        if (!message.channel.nsfw) {
            return message.reply('This command can only be used in NSFW channels.');
        }

        try {
            const imageUrl = await images.nsfw.hass();

            const embed = new EmbedBuilder()
                .setTitle('Hentai Ass')
                .setImage(imageUrl)
                .setColor('#ff69b4');

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('Something went wrong while fetching the image. Please try again later.');
        }
    },
};
