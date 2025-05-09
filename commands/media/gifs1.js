const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');
const cmdIcons = require('../../UI/icons/commandicons');

const emotions = {
    amazing: { func: gifs.sfw.amazing, requiresTarget: false },
    blush: { func: gifs.sfw.blush, requiresTarget: false },
    confused: { func: gifs.sfw.confused, requiresTarget: false },
    cool: { func: gifs.sfw.cool, requiresTarget: false },
    cringe: { func: gifs.sfw.cringe, requiresTarget: false },
    cry: { func: gifs.sfw.cry, requiresTarget: false },
    drool: { func: gifs.sfw.drool, requiresTarget: false },
    evillaugh: { func: gifs.sfw.evillaugh, requiresTarget: false },
    happy: { func: gifs.sfw.happy, requiresTarget: false },
    laugh: { func: gifs.sfw.laugh, requiresTarget: false },
    lonely: { func: gifs.sfw.lonely, requiresTarget: false },
    love: { func: gifs.sfw.love, requiresTarget: false },
    mad: { func: gifs.sfw.mad, requiresTarget: false },
    nervous: { func: gifs.sfw.nervous, requiresTarget: false },
    nosebleed: { func: gifs.sfw.nosebleed, requiresTarget: false },
    nyah: { func: gifs.sfw.nyah, requiresTarget: false },
    pout: { func: gifs.sfw.pout, requiresTarget: false },
    sad: { func: gifs.sfw.sad, requiresTarget: false },
    scared: { func: gifs.sfw.scared, requiresTarget: false },
    shocked: { func: gifs.sfw.shocked, requiresTarget: false },
    shy: { func: gifs.sfw.shy, requiresTarget: false },
    smile: { func: gifs.sfw.smile, requiresTarget: false },
    smug: { func: gifs.sfw.smug, requiresTarget: false },
    surprised: { func: gifs.sfw.surprised, requiresTarget: false },
    sweat: { func: gifs.sfw.sweat, requiresTarget: false }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif-emotions')
        .setDescription('Express your emotions with anime gifs!')
        .addSubcommand(sub =>
            sub
                .setName('amazing')
                .setDescription('Show that you are amazed!')
        )
        .addSubcommand(sub =>
            sub
                .setName('blush')
                .setDescription('Show that you are blushing!')
        )
        .addSubcommand(sub =>
            sub
                .setName('confused')
                .setDescription('Show that you are confused!')
        )
        .addSubcommand(sub =>
            sub
                .setName('cool')
                .setDescription('Show that you are cool!')
        )
        .addSubcommand(sub =>
            sub
                .setName('cringe')
                .setDescription('Show that you are cringing!')
        )
        .addSubcommand(sub =>
            sub
                .setName('cry')
                .setDescription('Show that you are crying!')
        )
        .addSubcommand(sub =>
            sub
                .setName('drool')
                .setDescription('Show that you are drooling!')
        )
        .addSubcommand(sub =>
            sub
                .setName('evillaugh')
                .setDescription('Show your evil laugh!')
        )
        .addSubcommand(sub =>
            sub
                .setName('happy')
                .setDescription('Show that you are happy!')
        )
        .addSubcommand(sub =>
            sub
                .setName('laugh')
                .setDescription('Show that you are laughing!')
        )
        .addSubcommand(sub =>
            sub
                .setName('lonely')
                .setDescription('Show that you are feeling lonely!')
        )
        .addSubcommand(sub =>
            sub
                .setName('love')
                .setDescription('Show that you are feeling love!')
        )
        .addSubcommand(sub =>
            sub
                .setName('mad')
                .setDescription('Show that you are mad!')
        )
        .addSubcommand(sub =>
            sub
                .setName('nervous')
                .setDescription('Show that you are nervous!')
        )
        .addSubcommand(sub =>
            sub
                .setName('nosebleed')
                .setDescription('Show a nosebleed reaction!')
        )
        .addSubcommand(sub =>
            sub
                .setName('nyah')
                .setDescription('Make a nyah sound!')
        )
        .addSubcommand(sub =>
            sub
                .setName('pout')
                .setDescription('Show that you are pouting!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sad')
                .setDescription('Show that you are sad!')
        )
        .addSubcommand(sub =>
            sub
                .setName('scared')
                .setDescription('Show that you are scared!')
        )
        .addSubcommand(sub =>
            sub
                .setName('shocked')
                .setDescription('Show that you are shocked!')
        )
        .addSubcommand(sub =>
            sub
                .setName('shy')
                .setDescription('Show that you are shy!')
        )
        .addSubcommand(sub =>
            sub
                .setName('smile')
                .setDescription('Show that you are smiling!')
        )
        .addSubcommand(sub =>
            sub
                .setName('smug')
                .setDescription('Show a smug expression!')
        )
        .addSubcommand(sub =>
            sub
                .setName('surprised')
                .setDescription('Show that you are surprised!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sweat')
                .setDescription('Show a nervous sweat!')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
            
            const subcommand = interaction.options.getSubcommand();
            const action = emotions[subcommand];
            const sender = interaction.user;

            try {
                const gif = await action.func();

                
                let verbForm;
                if (subcommand.endsWith('h')) {
                 
                    verbForm = `${subcommand}s`;
                } else if (subcommand === 'cry') {
                    verbForm = 'cries';
                } else if (subcommand === 'love') {
                    verbForm = 'is feeling love';
                } else if (subcommand === 'nyah') {
                    verbForm = 'says nyah~';
                } else {
                  
                    verbForm = `${subcommand}s`;
                }

                const description = `${sender} ${verbForm}!`;

                const embed = new EmbedBuilder()
                    .setColor('#FF9CE0') 
                    .setDescription(description)
                    .setImage(gif)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                
                await interaction.editReply({
                    content: 'Something went wrong while showing the emotion.',
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
                .setDescription('- This command can only be used through slash command!\n- Please use `/gif-emotions`')
                .setTimestamp();
          
            await interaction.reply({ embeds: [embed] });
        } 
    }
};