const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');
const cmdIcons = require('../../UI/icons/commandicons');

const interactions = {
    airkiss: { func: gifs.sfw.airkiss, requiresTarget: true },
    bite: { func: gifs.sfw.bite, requiresTarget: true },
    bonk: { func: gifs.sfw.bonk, requiresTarget: true },
    boop: { func: gifs.sfw.boop, requiresTarget: true },
    brofist: { func: gifs.sfw.brofist, requiresTarget: true },
    bully: { func: gifs.sfw.bully, requiresTarget: true },
    cuddle: { func: gifs.sfw.cuddle, requiresTarget: true },
    fight: { func: gifs.sfw.fight, requiresTarget: true },
    fluff: { func: gifs.sfw.fluff, requiresTarget: true },
    glomp: { func: gifs.sfw.glomp, requiresTarget: true },
    handhold: { func: gifs.sfw.handhold, requiresTarget: true },
    highfive: { func: gifs.sfw.highfive, requiresTarget: true },
    hug: { func: gifs.sfw.hug, requiresTarget: true },
    kick: { func: gifs.sfw.kick, requiresTarget: true },
    kiss: { func: gifs.sfw.kiss, requiresTarget: true },
    lick: { func: gifs.sfw.lick, requiresTarget: true },
    nuzzle: { func: gifs.sfw.nuzzle, requiresTarget: true },
    pat: { func: gifs.sfw.pat, requiresTarget: true },
    pinch: { func: gifs.sfw.pinch, requiresTarget: true },
    poke: { func: gifs.sfw.poke, requiresTarget: true },
    protect: { func: gifs.sfw.protect, requiresTarget: true },
    punch: { func: gifs.sfw.punch, requiresTarget: true },
    slap: { func: gifs.sfw.slap, requiresTarget: true },
    smack: { func: gifs.sfw.smack, requiresTarget: true },
    tickle: { func: gifs.sfw.tickle, requiresTarget: true }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif-interactions')
        .setDescription('Interact with other users using anime gifs!')
        .addSubcommand(sub =>
            sub
                .setName('airkiss')
                .setDescription('Blow a kiss to someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to air kiss')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('bite')
                .setDescription('Bite someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to bite')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('bonk')
                .setDescription('Bonk someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to bonk')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('boop')
                .setDescription('Boop someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to boop')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('brofist')
                .setDescription('Give someone a brofist!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to brofist')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('bully')
                .setDescription('Bully someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to bully')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('cuddle')
                .setDescription('Cuddle with someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to cuddle with')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('fight')
                .setDescription('Fight with someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to fight with')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('fluff')
                .setDescription('Fluff someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to fluff')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('glomp')
                .setDescription('Glomp someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to glomp')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('handhold')
                .setDescription('Hold hands with someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to hold hands with')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('highfive')
                .setDescription('High five someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to high five')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('hug')
                .setDescription('Hug someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to hug')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('kick')
                .setDescription('Kick someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to kick')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('kiss')
                .setDescription('Kiss someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to kiss')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('lick')
                .setDescription('Lick someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to lick')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('nuzzle')
                .setDescription('Nuzzle someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to nuzzle')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('pat')
                .setDescription('Pat someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to pat')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('pinch')
                .setDescription('Pinch someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to pinch')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('poke')
                .setDescription('Poke someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to poke')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('protect')
                .setDescription('Protect someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to protect')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('punch')
                .setDescription('Punch someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to punch')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('slap')
                .setDescription('Slap someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to slap')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('smack')
                .setDescription('Smack someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to smack')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('tickle')
                .setDescription('Tickle someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to tickle')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
            
            const subcommand = interaction.options.getSubcommand();
            const action = interactions[subcommand];
            const sender = interaction.user;
            const target = interaction.options.getUser('user');

            try {
                const gif = await action.func();

             
                let verbForm;
                if (subcommand === 'handhold') {
                    verbForm = 'holds hands with';
                } else if (subcommand === 'highfive') {
                    verbForm = 'high fives';
                } else if (subcommand === 'kiss') {
                    verbForm = 'kisses';
                } else if (subcommand.endsWith('h')) {
                 
                    verbForm = `${subcommand}es`;
                } else {
                   
                    verbForm = `${subcommand}s`;
                }

                const description = `${sender} ${verbForm} ${target}!`;

                const embed = new EmbedBuilder()
                    .setColor('#82DCFF') 
                    .setDescription(description)
                    .setImage(gif)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                
                await interaction.editReply({
                    content: 'Something went wrong while performing the interaction.',
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
                .setDescription('- This command can only be used through slash command!\n- Please use `/gif-interactions`')
                .setTimestamp();
          
            await interaction.reply({ embeds: [embed] });
        } 
    }
};