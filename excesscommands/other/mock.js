module.exports = {
    name: 'mock',
    description: 'Converts text into MoCkInG cAsE!',
    execute(message, args) {
        if (!args.length) {
            return message.reply('⚠️ Please provide some text to mock!');
        }

        let mockedText = args.join(' ')
            .split('')
            .map((char, index) => index % 2 ? char.toLowerCase() : char.toUpperCase())
            .join('');

        message.reply(`🗣️ ${mockedText}`);
    },
};
