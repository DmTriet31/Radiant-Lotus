const antiSpam = require('../antimodules/antiSpam');
const antiLink = require('../antimodules/antiLink');
const antiNuke = require('../antimodules/antiNuke');
const antiRaid = require('../antimodules/antiRaid');

module.exports = (client) => {
    antiSpam(client);
    antiLink(client);
    antiNuke(client);
    antiRaid(client);
};
