const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { images } = require('mediacord');

const imageTypes = {
    neko: images.sfw.neko,
    waifu: images.sfw.waifu,
    shinobu: images.sfw.shinobu,
    megumin: images.sfw.megumin,
    cat: images.sfw.cat,
    dog: images.sfw.dog,
    food: images.sfw.food,
    senko: images.sfw.senko,
    kanna: images.sfw.kanna,
    kitsune: images.sfw.kitsune,
    background: images.sfw.background,
    holo: images.sfw.holo,
    awoo: images.sfw.awoo,
    coffee: images.sfw.coffee,
    icon: images.sfw.icon,
    okami: images.sfw.okami,
    eevee: images.sfw.eevee,
    anime: images.sfw.anime,
    kemonomimi: images.sfw.kemonomimi,
    random: images.sfw.random
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('images')
        .setDescription('Send various anime/styled images')
        .addSubcommand(sub =>
            sub.setName('neko').setDescription('Get a neko image')
        )
        .addSubcommand(sub =>
            sub.setName('waifu').setDescription('Get a waifu image')
        )
        .addSubcommand(sub =>
            sub.setName('shinobu').setDescription('Get a Shinobu image')
        )
        .addSubcommand(sub =>
            sub.setName('megumin').setDescription('Get a Megumin image')
        )
        .addSubcommand(sub =>
            sub.setName('cat').setDescription('Get a cat image')
        )
        .addSubcommand(sub =>
            sub.setName('dog').setDescription('Get a dog image')
        )
        .addSubcommand(sub =>
            sub.setName('food').setDescription('Get a food image')
        )
        .addSubcommand(sub =>
            sub.setName('senko').setDescription('Get a Senko image')
        )
        .addSubcommand(sub =>
            sub.setName('kanna').setDescription('Get a Kanna image')
        )
        .addSubcommand(sub =>
            sub.setName('kitsune').setDescription('Get a kitsune image')
        )
        .addSubcommand(sub =>
            sub.setName('background').setDescription('Get a background image')
        )
        .addSubcommand(sub =>
            sub.setName('holo').setDescription('Get a Holo image')
        )
        .addSubcommand(sub =>
            sub.setName('awoo').setDescription('Get an awoo image')
        )
        .addSubcommand(sub =>
            sub.setName('coffee').setDescription('Get a coffee image')
        )
        .addSubcommand(sub =>
            sub.setName('icon').setDescription('Get an icon image')
        )
        .addSubcommand(sub =>
            sub.setName('okami').setDescription('Get an Okami image')
        )
        .addSubcommand(sub =>
            sub.setName('eevee').setDescription('Get an Eevee image')
        )
        .addSubcommand(sub =>
            sub.setName('anime').setDescription('Get a random anime image')
        )
        .addSubcommand(sub =>
            sub.setName('kemonomimi').setDescription('Get a kemonomimi image')
        )
        .addSubcommand(sub =>
            sub.setName('random').setDescription('Get a completely random image')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const fetchImage = imageTypes[subcommand];

        try {
            const imageUrl = await fetchImage();

            const embed = new EmbedBuilder()
                .setColor('#ff99cc')
                .setTitle(`Image: ${subcommand}`)
                .setImage(imageUrl)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);

            await interaction.editReply({
                content: 'Failed to fetch the image. Try again later.',
                ephemeral: true
            });
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash command!\n- Please use `/images`')
            .setTimestamp();
      
        await interaction.reply({ embeds: [embed] });
    } 
    }
};
