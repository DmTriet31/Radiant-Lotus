const { getApplication } = require('../models/applications');
const {
    ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle,
    EmbedBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        const guildId = interaction.guild?.id;
        if (!guildId) return;

        if (interaction.isButton() && interaction.customId.startsWith('open_application_modal_')) {
            const appName = interaction.customId.replace('open_application_modal_', '');
            // Get the specific application by name instead of just any active one
            const app = await getApplication(guildId, appName);
            if (!app) return interaction.reply({ content: '❌ Application not found.', ephemeral: true });
            if (!app.isActive) return interaction.reply({ content: '❌ This application is not currently active.', ephemeral: true });

            const modal = new ModalBuilder().setCustomId(`application_form_${appName}`).setTitle(`Apply: ${appName}`);
            app.questions.forEach((question, i) => {
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(`question_${i}`).setLabel(question).setStyle(TextInputStyle.Short)
                ));
            });
            await interaction.showModal(modal);
        }

        else if (interaction.isModalSubmit() && interaction.customId.startsWith('application_form_')) {
            const appName = interaction.customId.replace('application_form_', '');
            // Get the specific application by name
            const app = await getApplication(guildId, appName);
            if (!app) return interaction.reply({ content: '❌ Application not found.', ephemeral: true });
            if (!app.isActive) return interaction.reply({ content: '❌ This application is not currently active.', ephemeral: true });

            const answers = app.questions.map((_, i) => interaction.fields.getTextInputValue(`question_${i}`));
            const responseChannel = interaction.guild.channels.cache.get(app.responseChannel);
            if (!responseChannel) return interaction.reply({ content: '❌ Response channel not found.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`📥 Application - ${appName}`)
                .setDescription(answers.map((a, i) => `**Q${i + 1}:** ${app.questions[i]}\n**A${i + 1}:** ${a}`).join('\n\n'))
                .setColor('Blue')
                .setFooter({ text: `From: ${interaction.user.tag} (${interaction.user.id})` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`accept_application_${interaction.user.id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`deny_application_${interaction.user.id}`).setLabel('❌ Deny').setStyle(ButtonStyle.Danger)
            );

            await responseChannel.send({ embeds: [embed], components: [row] });
            interaction.reply({ content: '✅ Your application has been submitted!', ephemeral: true });
        }

        else if (interaction.isButton() &&
            (interaction.customId.startsWith('accept_application_') || interaction.customId.startsWith('deny_application_'))) {
            await interaction.deferReply({ ephemeral: true });

            const embed = interaction.message.embeds[0];
            const userId = interaction.customId.split('_').pop();
            const status = interaction.customId.includes('accept') ? 'accepted' : 'denied';
            const color = status === 'accepted' ? 'Green' : 'Red';

            const updatedEmbed = EmbedBuilder.from(embed).setColor(color);
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('done_accept').setLabel('✅ Accepted').setDisabled(true).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('done_deny').setLabel('❌ Denied').setDisabled(true).setStyle(ButtonStyle.Danger)
            );

            await interaction.message.edit({ embeds: [updatedEmbed], components: [disabledRow] });

            try {
                const user = await client.users.fetch(userId);
                const dm = new EmbedBuilder()
                    .setTitle(`🎉 Application ${status.toUpperCase()}`)
                    .setDescription(`Your application to **${interaction.guild.name}** was **${status}**.`)
                    .setColor(color);
                await user.send({ embeds: [dm] });
                interaction.followUp({ content: '📬 User has been notified.', ephemeral: true });
            } catch {
                interaction.followUp({ content: '⚠️ Could not DM the user.', ephemeral: true });
            }
        }
    });
};