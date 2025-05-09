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

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const afkHandler = require('../../events/afkHandler');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Manage AFK statuses.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your AFK status.')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for going AFK.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Duration of AFK (e.g., 10m, 1h).')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show a list of AFK users in the server.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your AFK status.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {


            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'set') {
                // Handle setting AFK
                const { setAFK } = afkHandler(interaction.client);
                const reason = interaction.options.getString('reason');
                const durationStr = interaction.options.getString('duration');
                let duration = null;

                if (durationStr) {
                    const match = durationStr.match(/^(\d+)([smhd])$/);
                    if (!match) {
                        return interaction.reply({
                            content: 'Invalid duration format. Use s, m, h, or d (e.g., 10m, 1h).',
                            flags: 64
                        });
                    }

                    const value = parseInt(match[1], 10);
                    const multiplier = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
                    duration = value * multiplier;
                }

                await setAFK(interaction.user.id, interaction.guild.id, reason, duration);

                const embed = new EmbedBuilder()
                    .setTitle('AFK Set')
                    .setDescription(`Reason: ${reason}\n${duration ? `Duration: ${durationStr}` : 'No expiration set.'}`)
                    .setColor(0x00ff00);

                await interaction.reply({ embeds: [embed], flags: 64 });
                await interaction.user.send(`You are now AFK: ${reason}${duration ? ` for ${durationStr}` : ''}`).catch(console.error);

            } else if (subcommand === 'list') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('You do not have permission to use this command.');
                    return interaction.reply({ embeds: [embed], flags: 64 });
                }
                const { getAllAFKs } = afkHandler(interaction.client);
                const afks = await getAllAFKs(interaction.guild.id);

                if (!afks.length) {
                    return interaction.reply({ content: 'No users are currently AFK.', flags: 64 });
                }

                const chunkSize = 25;
                const afkChunks = [];
                for (let i = 0; i < afks.length; i += chunkSize) {
                    afkChunks.push(afks.slice(i, i + chunkSize));
                }

                const embeds = [];
                for (const chunk of afkChunks) {
                    const embed = new EmbedBuilder()
                        .setTitle('AFK Users')
                        .setColor(0xffcc00)
                        .setTimestamp();

                    for (const afk of chunk) {
                        const user = await interaction.guild.members.fetch(afk.userId).catch(() => null);
                        const userName = user ? user.displayName : `Unknown User (${afk.userId})`;

                        embed.addFields({
                            name: userName,
                            value: `**Reason:** ${afk.reason}\n${afk.expiresAt ? `**Expires:** <t:${Math.floor(afk.expiresAt.getTime() / 1000)}:R>` : '**No expiration**'}`,
                        });
                    }

                    embeds.push(embed);
                }

                await interaction.reply({ embeds });
            } else if (subcommand === 'remove') {
                // Handle removing AFK status
                const { removeAFK, getAFK } = afkHandler(interaction.client);
                const afk = await getAFK(interaction.user.id, interaction.guild.id);

                if (!afk) {
                    return interaction.reply({ content: 'You are not currently AFK.', flags: 64 });
                }

                await removeAFK(interaction.user.id, interaction.guild.id);

                await interaction.reply({ content: 'Your AFK status has been removed.', flags: 64 });
                await interaction.user.send('Your AFK status has been removed.').catch(console.error);
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/afk`')
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
