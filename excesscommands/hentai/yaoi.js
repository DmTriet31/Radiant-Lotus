const { EmbedBuilder } = require('discord.js');
const { images } = require('mediacord');

module.exports = {
    name: 'yaoi',
    description: 'Fetches a random yaoi image.',
    async execute(message, args) {
        if (!message.channel.nsfw) {
            return message.reply('This command can only be used in NSFW channels.');
        }

        try {
            const imageUrl = await images.nsfw.yaoi();

            const embed = new EmbedBuilder()
                .setTitle('Yaoi Image')
                .setImage(imageUrl)
                .setColor('#ff69b4');

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('Something went wrong while fetching the image. Please try again later.');
        }
    },
};
