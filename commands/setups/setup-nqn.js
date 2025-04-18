

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { nqnCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-nqn')
        .setDescription('Configure or view NQN status for a server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        // Subcommand for setting the NQN status
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Enable or disable NQN')
                .addStringOption(option =>
                    option.setName('serverid')
                        .setDescription('The ID of the server')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable NQN')
                        .setRequired(true))
        )
        // Subcommand for viewing the current NQN status
        .addSubcommand(sub =>
            sub
                .setName('view')
                .setDescription('View the current NQN status')
                .addStringOption(option =>
                    option.setName('serverid')
                        .setDescription('The ID of the server')
                        .setRequired(true))
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverId = interaction.guild.id;
            if (!await checkPermissions(interaction)) return;
            const subcommand = interaction.options.getSubcommand();
            const serverIdInput = interaction.options.getString('serverid');

          
            if (serverIdInput !== guild.id) {
                return interaction.reply({
                    content: 'The server ID provided does not match the server ID of this server.',
                    flags: 64
                });
            }

            if (subcommand === 'set') {
              
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('You do not have permission to use this command.');
                    return interaction.reply({ embeds: [embed], flags: 64 });
                }

                const status = interaction.options.getBoolean('status');
                if (status === null) {
                    return interaction.reply({
                        content: 'Invalid input. Please provide a valid status.',
                        flags: 64
                    });
                }

                const serverOwnerId = guild.ownerId;



                await nqnCollection.updateOne(
                    { serverId: serverIdInput },
                    { $set: { serverId: serverIdInput, status, ownerId: serverOwnerId } },
                    { upsert: true }
                );

                return interaction.reply({
                    content: `NQN status updated successfully for server ID ${serverIdInput}.`,
                    flags: 64
                });
            } else if (subcommand === 'view') {
                const guild = interaction.guild;
                const serverId = interaction.guild.id;
                const configMangerData = await serverConfigCollection.findOne({ serverId });
                const botManagers = configMangerData ? configMangerData.botManagers || [] : [];
          
                if (!botManagers.includes(interaction.user.id) && interaction.user.id !== guild.ownerId) {
                    return interaction.reply({ 
                        content: '❌ Only the **server owner** or **bot managers** can use this command.', 
                        flags: 64
                    });
                }
                const configData = await nqnCollection.findOne({ serverId: serverIdInput });
                let description;
                if (configData) {
                    description = `**Status:** ${configData.status ? 'Enabled' : 'Disabled'}\n**Owner ID:** ${configData.ownerId}`;
                } else {
                    description = 'No configuration found for NQN. Please set it up using `/setnqnstatus set`.';
                }

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('NQN Status Configuration')
                    .setDescription(description)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }
        } else {
            // If not used as a slash command, send an alert embed.
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash commands!\n- Please use `/setnqnstatus`')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};

