const { ActivityType } = require('discord.js');
const { botStatusCollection } = require('../mongodb');
const colors = require('../UI/colors/colors');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('\n' + '─'.repeat(40));
        console.log(`${colors.magenta}${colors.bright}🔗  ACTIVITY STATUS${colors.reset}`);
        console.log('─'.repeat(40));

        let i = 0;
        const INTERVAL = 10000;

        async function getDynamicActivity() {
            const custom = await botStatusCollection.findOne({});
            if (!custom || !custom.custom) return null;

            const placeholders = {
                '{members}': client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                '{servers}': client.guilds.cache.size,
                '{channels}': client.channels.cache.size,
            };

            const resolvedName = Object.entries(placeholders).reduce(
                (text, [key, val]) => text.replaceAll(key, val),
                custom.activity
            );

            const activity = {
                name: resolvedName,
                type: ActivityType[custom.type],
            };

            if (custom.type === 'Streaming' && custom.url) {
                activity.url = custom.url;
            }

            return { activity, status: custom.status };
        }

        async function getCurrentSongActivity() {
            const activePlayers = Array.from(client.riffy.players.values()).filter(player => player.playing);

            if (!activePlayers.length) return null;

            const player = activePlayers[0];
            if (!player.current?.info?.title) return null;

            return {
                name: `🎸 ${player.current.info.title}`,
                type: ActivityType.Playing
            };
        }

        async function updateStatus() {
            const dynamic = await getDynamicActivity();

            if (dynamic) {
                client.user.setPresence({
                    activities: [dynamic.activity],
                    status: dynamic.activity.type === ActivityType.Streaming ? undefined : dynamic.status
                });
                return;
            }

            if (config.status.songStatus) {
                const songActivity = await getCurrentSongActivity();
                if (songActivity) {
                    client.user.setActivity(songActivity);
                    return;
                }
            }

            const next = config.status.rotateDefault[i % config.status.rotateDefault.length];
            client.user.setPresence({
                activities: [next],
                status: next.type === ActivityType.Streaming ? undefined : 'online'
            });
            i++;
        }

        client.invites = new Map();
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await new Promise(res => setTimeout(res, 500));
                const invites = await guild.invites.fetch();
                client.invites.set(
                    guildId,
                    new Map(invites.map(inv => [
                        inv.code,
                        {
                            inviterId: inv.inviter?.id || null,
                            uses: inv.uses
                        }
                    ]))
                );
            } catch (err) {
                //console.warn(`❌ Failed to fetch invites for ${guild.name}: ${err.message}`);
            }
        }

        updateStatus();
        setInterval(updateStatus, INTERVAL);

        console.log('\x1b[31m[ CORE ]\x1b[0m \x1b[32m%s\x1b[0m', 'Bot Activity Cycle Running ✅');
    }
};
