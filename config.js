const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: '853261151365627915',
  status: {
    rotateDefault: [
      { name: 'Netflix với Tnhi', type: ActivityType.Watching },
      { name: 'Bê đê', type: ActivityType.Playing },
      { name: 'Restream hôm qua', type: ActivityType.Streaming, url: 'https://www.youtube.com/@MixiGaming3con' },
      { name: 'Anh DmTriet chửi', type: ActivityType.Listening },
    ],
    songStatus: true
  },
  spotifyClientId: "f71a3da30e254962965ca2a89d6f74b9",
  spotifyClientSecret: "199a619d22dd4e55a4a2c1a7a3d70e63",
}
