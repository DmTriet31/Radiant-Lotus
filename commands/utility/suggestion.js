const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const SuggestionConfig = require('../../models/suggestions/SuggestionConfig');
const Suggestion = require('../../models/suggestions/Suggestion');
const SuggestionVote = require('../../models/suggestions/SuggestionVote');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Manage suggestions')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Submit a suggestion')
                .addStringOption(opt =>
                    opt.setName('title').setDescription('Suggestion title').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('description').setDescription('Suggestion details').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Update the status of a suggestion')
                .addStringOption(opt =>
                    opt.setName('message_id').setDescription('Message ID of the suggestion').setRequired(true))
                .addStringOption(opt =>
                    opt.setName('status')
                        .setDescription('New status')
                        .addChoices(
                            { name: '✅ Approved', value: 'approved' },
                            { name: '❌ Denied', value: 'denied' },
                            { name: '⏳ Under Review', value: 'review' }
                        )
                        .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a suggestion')
                .addStringOption(opt =>
                    opt.setName('message_id').setDescription('Message ID of the suggestion').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        if (sub === 'add') {
            const config = await SuggestionConfig.findOne({ guildId });
            if (!config || !config.suggestionChannelId) {
                return interaction.editReply({ content: '❌ Suggestions are not set up on this server.' });
            }

            const allowedRoleId = config.allowedRoleId;
            if (allowedRoleId && !interaction.member.roles.cache.has(allowedRoleId)) {
                return interaction.editReply({ content: '❌ You do not have permission to submit suggestions.' });
            }

            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const suggestionChannel = interaction.guild.channels.cache.get(config.suggestionChannelId);

            if (!suggestionChannel) {
                return interaction.editReply({ content: '⚠️ The configured suggestions channel no longer exists.' });
            }

            const embed = new EmbedBuilder()
                .setTitle(`💡 ${title}`)
                .setDescription(description)
                .setColor('#00AAFF')
                .addFields({ name: 'Submitted by', value: `<@${interaction.user.id}>`, inline: true })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('suggestion_yes').setLabel('👍 Yes').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('suggestion_no').setLabel('👎 No').setStyle(ButtonStyle.Danger),
            );

            const msg = await suggestionChannel.send({ embeds: [embed], components: [row] });

            await Suggestion.create({
                guildId,
                userId: interaction.user.id,
                messageId: msg.id,
                title,
                description
            });

            return interaction.editReply({ content: '✅ Suggestion submitted!' });
        }

        if (sub === 'status') {
            const messageId = interaction.options.getString('message_id');
            const newStatus = interaction.options.getString('status');
            const suggestion = await Suggestion.findOne({ messageId });

            if (!suggestion) {
                return interaction.editReply({ content: '❌ Suggestion not found.' });
            }

            if (!interaction.member.permissions.has('ManageMessages')) {
                return interaction.editReply({ content: '❌ You do not have permission to update suggestions.' });
            }

            suggestion.status = newStatus;
            await suggestion.save();

            const channel = interaction.guild.channels.cache.get(suggestion.suggestionChannelId || suggestion.channelId);
            if (channel) {
                try {
                    const msg = await channel.messages.fetch(messageId);
                    const embed = EmbedBuilder.from(msg.embeds[0])
                        .setFooter({ text: `Status: ${newStatus.toUpperCase()}` });

                    await msg.edit({ embeds: [embed] });
                } catch (err) {
                    console.error('⚠ Failed to update embed:', err);
                }
            }

            return interaction.editReply({ content: `✅ Suggestion status updated to **${newStatus}**.` });
        }

        if (sub === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const suggestion = await Suggestion.findOne({ messageId });

            if (!suggestion) {
                return interaction.editReply({ content: '❌ Suggestion not found.' });
            }

            const isOwner = suggestion.userId === interaction.user.id;
            const isMod = interaction.member.permissions.has('ManageMessages');

            if (!isOwner && !isMod) {
                return interaction.editReply({ content: '❌ You can only delete your own suggestion.' });
            }

            try {
                const channel = interaction.guild.channels.cache.get(suggestion.suggestionChannelId || suggestion.channelId);
                if (channel) {
                    const msg = await channel.messages.fetch(messageId);
                    await msg.delete().catch(() => {});
                }

                await Suggestion.deleteOne({ messageId });
                await SuggestionVote.deleteMany({ messageId });

                return interaction.editReply({ content: '🗑️ Suggestion deleted successfully.' });
            } catch (err) {
                console.error('⚠ Error deleting suggestion:', err);
                return interaction.editReply({ content: '❌ Failed to delete the suggestion.' });
            }
        }
    }
};
