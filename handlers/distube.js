const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { Dynamic } = require('musicard');
const musicIcons = require('../UI/icons/musicicons');
const { EmbedBuilder } = require('discord.js');
const { autoplayCollection } = require('../mongodb');
const path = require('path');
const data = require('../UI/banners/musicard');

module.exports = async (client) => {
    client.distube = new DisTube(client, {
        plugins: [new SpotifyPlugin(), new SoundCloudPlugin(), new YtDlpPlugin()],
    });

    client.distube
        .on('playSong', async (queue, song) => {
            if (queue.textChannel) {
                try {
                    const musicCard = await generateMusicCard(song);
                    const embed = {
                        color: 0xDC92FF,
                        author: {
                            name: 'Now playing',
                            url: 'https://discord.gg/xQF9f9yUEM',
                            icon_url: musicIcons.playerIcon
                        },
                        description: `- Song name: **${song.name}** \n- Duration: **${song.formattedDuration}**\n- Requested by: ${song.user}`,
                        image: {
                            url: 'attachment://musicCard.png'
                        },
                        footer: {
                            text: 'Distube Player',
                            icon_url: musicIcons.footerIcon
                        },
                        timestamp: new Date().toISOString()
                    };
                    queue.textChannel.send({ embeds: [embed], files: [{ attachment: musicCard, name: 'musicCard.png' }] });
                } catch (error) {
                    console.error('Error sending music card:', error);
                }
            }
        })
        .on('addSong', async (queue, song) => {
            if (queue.textChannel) {
                const embed = new EmbedBuilder()
                    .setColor(0xDC92FF)
                    .setAuthor({ name: 'Song added successfully', iconURL: musicIcons.correctIcon, url: 'https://discord.gg/xQF9f9yUEM' })
                    .setDescription(`**${song.name}**\n- Duration: **${song.formattedDuration}**\n- Added by: ${song.user}`)
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
                    .setTimestamp();

                queue.textChannel.send({ embeds: [embed] });
            }
        })
        .on('error', (channel, error) => {
            console.error('DisTube error:', error);
            if (channel && typeof channel.send === 'function') {
                channel.send(`❌ An error occurred: ${error.message}`);
            }
        });
};

async function generateMusicCard(song) {
    try {
        const randomIndex = Math.floor(Math.random() * data.backgroundImages.length);
        const backgroundImage = data.backgroundImages[randomIndex];

        return await Dynamic({
            thumbnailImage: song.thumbnail,
            name: song.name,
            author: song.formattedDuration,
            authorColor: "#FF7A00",
            progress: 50,
            imageDarkness: 60,
            backgroundImage: backgroundImage,
            nameColor: "#FFFFFF",
            progressColor: "#FF7A00",
            progressBarColor: "#5F2D00",
        });
    } catch (error) {
        console.error('Error generating music card:', error);
        throw error;
    }
}
