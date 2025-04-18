const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

const blockedWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'fag', 'retard', 'nigger', 'whore',
    'porn', 'sex', 'nude', 'nsfw', 'slut', 'dick', 'pussy'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something safely.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message content')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('embed')
                .setDescription('Send as an embed')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const input = interaction.options.getString('message');
        const useEmbed = interaction.options.getBoolean('embed') ?? false;

        const lowerInput = input.toLowerCase();

        // Check against unsafe patterns
        const unsafePatterns = [
            /@everyone/, /@here/, /<@&\d+>/, /discord\.gg\/\w+/i, // mentions & invites
            /(https?:\/\/)?(www\.)?\S+\.\S+/i,                    // links
            /[A-Z]{8,}/                                           // caps spam
        ];

        const hasBadPattern = unsafePatterns.some(pattern => pattern.test(input));
        const hasBlockedWord = blockedWords.some(w => lowerInput.includes(w));

        if (hasBadPattern || hasBlockedWord) {
            return interaction.reply({
                content: '❌ Your message was blocked due to unsafe content (mention, link, invite, caps, or profanity).',
                ephemeral: true
            });
        }

        await interaction.reply({ content: '✅ Message sent!', ephemeral: true });

        if (useEmbed) {
            const embed = new EmbedBuilder()
                .setDescription(input)
                .setColor('#00ccff');
            await interaction.channel.send({ embeds: [embed] });
        } else {
            await interaction.channel.send({ content: input });
        }
    }
};

