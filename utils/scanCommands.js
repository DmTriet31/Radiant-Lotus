const fs = require('fs');
const path = require('path');

module.exports = function scanCommands(config) {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);
    const enabledFolders = commandFolders.filter(folder => config.categories[folder]);

    let totalCommands = 0;

    for (const folder of enabledFolders) {
        const commandFiles = fs.readdirSync(path.join(commandsPath, folder))
            .filter(file => file.endsWith('.js'));
        totalCommands += commandFiles.length;
    }

    return totalCommands;
};
