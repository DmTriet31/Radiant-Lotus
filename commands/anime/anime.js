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
const anime = require('anime-actions');
const cmdIcons = require('../../UI/icons/commandicons');

const actions = {
	blush: { func: anime.blush, requiresTarget: false },
	bonk: { func: anime.bonk, requiresTarget: true },
	bored: { func: anime.bored, requiresTarget: false },
	bully: { func: anime.bully, requiresTarget: true },
	cry: { func: anime.cry, requiresTarget: false },
	cuddle: { func: anime.cuddle, requiresTarget: true },
	dance: { func: anime.dance, requiresTarget: false },
	highfive: { func: anime.highfive, requiresTarget: true },
	hug: { func: anime.hug, requiresTarget: true },
	kiss: { func: anime.kiss, requiresTarget: true },
	nervous: { func: anime.nervous, requiresTarget: false },
	pat: { func: anime.pat, requiresTarget: true },
	scream: { func: anime.scream, requiresTarget: false },
	slap: { func: anime.slap, requiresTarget: true },
	stare: { func: anime.stare, requiresTarget: true },
	wave: { func: anime.wave, requiresTarget: true },
	wink: { func: anime.wink, requiresTarget: true }
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('anime')
		.setDescription('Perform an anime action!')
		// Subcommand for blush (no target required)
		.addSubcommand(sub =>
			sub
				.setName('blush')
				.setDescription('Blush action!')
		)
		// Subcommand for bonk (requires a target)
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
		// Subcommand for bored (no target)
		.addSubcommand(sub =>
			sub
				.setName('bored')
				.setDescription('Bored action!')
		)
		// Subcommand for bully (requires a target)
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
		// Subcommand for cry (no target)
		.addSubcommand(sub =>
			sub
				.setName('cry')
				.setDescription('Cry action!')
		)
		// Subcommand for cuddle (requires a target)
		.addSubcommand(sub =>
			sub
				.setName('cuddle')
				.setDescription('Cuddle someone!')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('The user to cuddle')
						.setRequired(true)
				)
		)
		// Subcommand for dance (no target)
		.addSubcommand(sub =>
			sub
				.setName('dance')
				.setDescription("Dance like nobody's watching!")
		)
		// Subcommand for highfive (requires a target)
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
		// Subcommand for hug (requires a target)
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
		// Subcommand for kiss (requires a target)
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
		// Subcommand for nervous (no target)
		.addSubcommand(sub =>
			sub
				.setName('nervous')
				.setDescription('Feeling nervous!')
		)
		// Subcommand for pat (requires a target)
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
		// Subcommand for scream (no target)
		.addSubcommand(sub =>
			sub
				.setName('scream')
				.setDescription('Scream action!')
		)
		// Subcommand for slap (requires a target)
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
		// Subcommand for stare (requires a target)
		.addSubcommand(sub =>
			sub
				.setName('stare')
				.setDescription('Stare at someone!')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('The user to stare at')
						.setRequired(true)
				)
		)
		// Subcommand for wave (requires a target)
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
		// Subcommand for wink (requires a target)
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
		),

	async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
		const subcommand = interaction.options.getSubcommand();
		const action = actions[subcommand];
		const sender = interaction.user;
		let target = null;


		if (action.requiresTarget) {
			target = interaction.options.getUser('user');
		}

		try {

			const gif = await action.func();


			let description;
			if (target) {
				description = `${sender} ${subcommand}s ${target}!`;
			} else {
				description = `${sender} ${subcommand}es!`;
			}

			const embed = new EmbedBuilder()
				.setColor('#ffcc00')
				.setDescription(description)
				.setImage(gif)
				.setTimestamp();

			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'Something went wrong while performing the action.',
				flags: 64
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
            .setDescription('- This command can only be used through slash command!\n- Please use `/anime`')
            .setTimestamp();
      
        await interaction.reply({ embeds: [embed] });
      } 
	}
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
