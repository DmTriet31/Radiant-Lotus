const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');
const cmdIcons = require('../../UI/icons/commandicons');

const reactions = {
    alarm: { func: gifs.sfw.alarm, requiresTarget: false },
    angrystare: { func: gifs.sfw.angrystare, requiresTarget: false },
    ask: { func: gifs.sfw.ask, requiresTarget: false },
    baka: { func: gifs.sfw.baka, requiresTarget: true },
    blyat: { func: gifs.sfw.blyat, requiresTarget: false },
    celebrate: { func: gifs.sfw.celebrate, requiresTarget: false },
    coffee: { func: gifs.sfw.coffee, requiresTarget: false },
    comfy: { func: gifs.sfw.comfy, requiresTarget: false },
    error: { func: gifs.sfw.error, requiresTarget: false },
    no: { func: gifs.sfw.no, requiresTarget: false },
    ok: { func: gifs.sfw.ok, requiresTarget: false },
    scream: { func: gifs.sfw.scream, requiresTarget: false },
    shame: { func: gifs.sfw.shame, requiresTarget: true },
    slowclap: { func: gifs.sfw.slowclap, requiresTarget: false },
    smoke: { func: gifs.sfw.smoke, requiresTarget: false },
    sneeze: { func: gifs.sfw.sneeze, requiresTarget: false },
    sorry: { func: gifs.sfw.sorry, requiresTarget: true },
    stop: { func: gifs.sfw.stop, requiresTarget: false },
    thumbsup: { func: gifs.sfw.thumbsup, requiresTarget: false },
    tired: { func: gifs.sfw.tired, requiresTarget: false },
    triggered: { func: gifs.sfw.triggered, requiresTarget: false },
    wave: { func: gifs.sfw.wave, requiresTarget: true },
    wink: { func: gifs.sfw.wink, requiresTarget: true },
    woah: { func: gifs.sfw.woah, requiresTarget: false },
    yawn: { func: gifs.sfw.yawn, requiresTarget: false }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gif-reactions')
        .setDescription('React to situations with anime gifs!')
        .addSubcommand(sub =>
            sub
                .setName('alarm')
                .setDescription('Sound the alarm!')
        )
        .addSubcommand(sub =>
            sub
                .setName('angrystare')
                .setDescription('Give an angry stare!')
        )
        .addSubcommand(sub =>
            sub
                .setName('ask')
                .setDescription('Ask a question!')
        )
        .addSubcommand(sub =>
            sub
                .setName('baka')
                .setDescription('Call someone a baka (idiot)!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to call baka')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('blyat')
                .setDescription('Say blyat!')
        )
        .addSubcommand(sub =>
            sub
                .setName('celebrate')
                .setDescription('Celebrate something!')
        )
        .addSubcommand(sub =>
            sub
                .setName('coffee')
                .setDescription('Enjoy some coffee!')
        )
        .addSubcommand(sub =>
            sub
                .setName('comfy')
                .setDescription('Feel comfy!')
        )
        .addSubcommand(sub =>
            sub
                .setName('error')
                .setDescription('Show an error reaction!')
        )
        .addSubcommand(sub =>
            sub
                .setName('no')
                .setDescription('Say no!')
        )
        .addSubcommand(sub =>
            sub
                .setName('ok')
                .setDescription('Say OK!')
        )
        .addSubcommand(sub =>
            sub
                .setName('scream')
                .setDescription('Let out a scream!')
        )
        .addSubcommand(sub =>
            sub
                .setName('shame')
                .setDescription('Shame someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to shame')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('slowclap')
                .setDescription('Do a slow clap!')
        )
        .addSubcommand(sub =>
            sub
                .setName('smoke')
                .setDescription('Take a smoke!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sneeze')
                .setDescription('Sneeze!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sorry')
                .setDescription('Apologize to someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to apologize to')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('stop')
                .setDescription('Tell someone to stop!')
        )
        .addSubcommand(sub =>
            sub
                .setName('thumbsup')
                .setDescription('Give a thumbs up!')
        )
        .addSubcommand(sub =>
            sub
                .setName('tired')
                .setDescription('Show that you are tired!')
        )
        .addSubcommand(sub =>
            sub
                .setName('triggered')
                .setDescription('Show that you are triggered!')
        )
        .addSubcommand(sub =>
            sub
                .setName('wave')
                .setDescription('Wave at someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to wave at')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('wink')
                .setDescription('Wink at someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to wink at')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('woah')
                .setDescription('Show amazement!')
        )
        .addSubcommand(sub =>
            sub
                .setName('yawn')
                .setDescription('Let out a yawn!')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
            
            const subcommand = interaction.options.getSubcommand();
            const action = reactions[subcommand];
            const sender = interaction.user;
            let target = null;

            if (action.requiresTarget) {
                target = interaction.options.getUser('user');
            }

            try {
                const gif = await action.func();

              
                let description;
                if (target) {
                    if (subcommand === 'baka') {
                        description = `${sender} calls ${target} a baka!`;
                    } else if (subcommand === 'shame') {
                        description = `${sender} shames ${target}!`;
                    } else if (subcommand === 'sorry') {
                        description = `${sender} apologizes to ${target}!`;
                    } else if (subcommand === 'wave') {
                        description = `${sender} waves at ${target}!`;
                    } else if (subcommand === 'wink') {
                        description = `${sender} winks at ${target}!`;
                    } else {
                     
                        description = `${sender} ${subcommand}s at ${target}!`;
                    }
                } else {
                 
                    if (subcommand === 'angrystare') {
                        description = `${sender} gives an angry stare!`;
                    } else if (subcommand === 'error') {
                        description = `${sender} encountered an error!`;
                    } else if (subcommand === 'coffee') {
                        description = `${sender} enjoys some coffee!`;
                    } else if (subcommand === 'comfy') {
                        description = `${sender} feels comfy!`;
                    } else if (subcommand === 'scream') {
                        description = `${sender} screams!`;
                    } else if (subcommand === 'sneeze') {
                        description = `${sender} sneezes!`;
                    } else if (subcommand === 'tired') {
                        description = `${sender} is tired!`;
                    } else if (subcommand === 'thumbsup') {
                        description = `${sender} gives a thumbs up!`;
                    } else if (subcommand === 'triggered') {
                        description = `${sender} is triggered!`;
                    } else if (subcommand === 'woah') {
                        description = `${sender} says woah!`;
                    } else if (subcommand === 'yawn') {
                        description = `${sender} yawns!`;
                    } else {
                     
                        description = `${sender} ${subcommand}s!`;
                    }
                }

                const embed = new EmbedBuilder()
                    .setColor('#FFCC4D') 
                    .setDescription(description)
                    .setImage(gif)
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                
                await interaction.editReply({
                    content: 'Something went wrong while showing the reaction.',
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
                .setDescription('- This command can only be used through slash command!\n- Please use `/gif-reactions`')
                .setTimestamp();
          
            await interaction.reply({ embeds: [embed] });
        } 
    }
};