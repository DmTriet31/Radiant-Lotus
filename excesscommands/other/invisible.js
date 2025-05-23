module.exports = {
    name: 'invisible',
    description: 'Sends an invisible message!',
    execute(message) {
        message.reply('\u200B'); // Zero-width space
    },
};
