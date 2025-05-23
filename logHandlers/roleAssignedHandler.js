const { EmbedBuilder } = require('discord.js');
const { logsCollection } = require('../mongodb');
const QuarantineConfig = require('../models/qurantine/quarantineConfig');
const UserQuarantine = require('../models/qurantine/userQuarantine');
const RoleNickConfig = require('../models/rolenick/RoleNickConfig');
const logHandlersIcons = require('../UI/icons/loghandlers');
module.exports = async function guildMemberUpdateHandler(client) {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        if (!newMember.guild) return;
        const guildId = newMember.guild.id;

        try {
            // Identify added roles
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

            // === 1. Role Assignment Logging ===
            if (addedRoles.size > 0) {
                const config = await logsCollection.findOne({ guildId, eventType: 'roleAssigned' });
                if (config?.channelId) {
                    const logChannel = client.channels.cache.get(config.channelId);
                    if (logChannel) {
                        addedRoles.forEach(role => {
                            const embed = new EmbedBuilder()
                                .setTitle('🔵 Role Assigned')
                                .setColor('#0000FF')
                                .setThumbnail(logHandlersIcons.assignedIcon)
                                .addFields(
                                    { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
                                    { name: 'Role', value: role.name, inline: true },
                                )
                                .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                                .setTimestamp();

                            logChannel.send({ embeds: [embed] });
                        });
                    }
                }
            }

            // === 2. Quarantine Role Enforcement ===
            const quarantineConfig = await QuarantineConfig.findOne({ guildId });
            if (quarantineConfig?.quarantineEnabled) {
                const quarantineRole = newMember.guild.roles.cache.get(quarantineConfig.quarantineRoleId);
                if (quarantineRole) {
                    const userQuarantine = await UserQuarantine.findOne({ userId: newMember.id, guildId });
                    if (
                        userQuarantine?.isQuarantined &&
                        oldMember.roles.cache.has(quarantineRole.id) &&
                        !newMember.roles.cache.has(quarantineRole.id)
                    ) {
                        await newMember.roles.add(quarantineRole);
                        await newMember.send('⚠ Quarantine Role cannot be removed manually.').catch(() => { });
                    }
                }
            }

            // === 3. Auto Nickname Format ===
            const nickConfig = await RoleNickConfig.findOne({ guildId });
            if (nickConfig?.roles?.length > 0 && addedRoles.size > 0) {
                for (const roleEntry of nickConfig.roles) {
                    if (addedRoles.has(roleEntry.roleId)) {
                        const role = newMember.guild.roles.cache.get(roleEntry.roleId);
                        if (!role) continue;

                        const baseName = newMember.displayName;


                        let formattedNickname = roleEntry.nicknameFormat
                            .replace('{ROLE}', role.name)
                            .replace('{USERNAME}', baseName)
                            .trim();

                        if (!formattedNickname.includes(baseName)) {
                            formattedNickname += ` ${baseName}`;
                        }

                        if (formattedNickname.length > 32) {
                            formattedNickname = formattedNickname.slice(0, 32);
                        }

                        await newMember.setNickname(formattedNickname).catch(() => { });


                        break;
                    }
                }
            }
            // === Role Nickname Reversion on Role Removal ===
            if (nickConfig?.roles?.length > 0) {
                const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                for (const roleEntry of nickConfig.roles) {
                    if (removedRoles.has(roleEntry.roleId)) {

                        const currentNickname = newMember.nickname || null;
                        const displayName = newMember.displayName;


                        const role = newMember.guild.roles.cache.get(roleEntry.roleId);
                        if (!role) continue;

                        const expectedNickname = roleEntry.nicknameFormat
                            .replace('{ROLE}', role.name)
                            .replace('{USERNAME}', displayName)
                            .trim();


                        if (currentNickname && currentNickname.includes(role.name)) {
                            await newMember.setNickname(null).catch(() => { });
                        }

                        break;
                    }
                }
            }

        } catch (err) {
            console.error('⚠ Error in guildMemberUpdate handler:', err);
        }
    });
};
