const { SlashCommandBuilder } = require('discord.js');
const { botStatusCollection } = require('../../mongodb');
const { ActivityType } = require('discord.js');
const config = require('../../config');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-status')
        .setDescription('View or change the bot\'s presence')
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set bot status and activity')
                .addStringOption(opt =>
                    opt.setName('status')
                        .setDescription('Bot status')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Online', value: 'online' },
                            { name: 'Idle', value: 'idle' },
                            { name: 'Do Not Disturb', value: 'dnd' },
                        ))
                .addStringOption(opt =>
                    opt.setName('activity')
                        .setDescription('Activity text (use placeholders like {members}, {servers}, {channels})')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Activity type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Playing', value: 'Playing' },
                            { name: 'Watching', value: 'Watching' },
                            { name: 'Listening', value: 'Listening' },
                            { name: 'Streaming', value: 'Streaming' },
                        ))
                .addStringOption(opt =>
                    opt.setName('streamurl')
                        .setDescription('Twitch Stream URL (only for Streaming activity)')
                        .setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View current bot status and activity')
        )
        .addSubcommand(sub =>
            sub.setName('reset')
                .setDescription('Reset to default rotating activities')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const client = interaction.client;
        if (interaction.user.id !== config.ownerId) {
            return interaction.editReply({
                content: '❌ Only the **bot owner** can use this command.',
                ephemeral: true
            });
        }
        if (subcommand === 'set') {
            const status = interaction.options.getString('status');
            const activityRaw = interaction.options.getString('activity');
            const type = interaction.options.getString('type');
            const streamurl = interaction.options.getString('streamurl') || null;

            if (type === 'Streaming' && (!streamurl || !streamurl.startsWith('https://www.twitch.tv/'))) {
                return interaction.editReply('❌ You must provide a valid Twitch stream URL for streaming activities.');
            }

            const placeholders = {
                '{members}': client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                '{servers}': client.guilds.cache.size,
                '{channels}': client.channels.cache.size,
            };

            const resolvedActivity = Object.entries(placeholders).reduce((text, [placeholder, value]) =>
                text.replace(new RegExp(placeholder, 'g'), value), activityRaw
            );

            const activityObj = {
                name: resolvedActivity,
                type: ActivityType[type],
            };

            if (type === 'Streaming') activityObj.url = streamurl;

            await client.user.setPresence({
                status,
                activities: [activityObj]
            });

            await botStatusCollection.updateOne({}, {
                $set: {
                    status,
                    activity: activityRaw,
                    resolved: resolvedActivity,
                    type,
                    url: streamurl || null,
                    custom: true
                }
            }, { upsert: true });

            return interaction.editReply(`✅ Bot status set to **${status}**, activity: **${type} ${resolvedActivity}**`);

        } else if (subcommand === 'view') {
            const current = await botStatusCollection.findOne({});
            if (!current) return interaction.editReply('ℹ️ No custom status set. Bot is using default rotating status.');

            const urlPart = current.url ? `\n🔗 **URL:** ${current.url}` : '';
            return interaction.editReply(`🔎 **Status:** ${current.status}\n🎮 **Activity:** ${current.type} ${current.resolved}${urlPart}`);

        } else if (subcommand === 'reset') {
            await botStatusCollection.deleteOne({});
            return interaction.editReply('♻️ Reset to default rotating activities. Will take effect on next cycle.');
        }
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/setup-status`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};
