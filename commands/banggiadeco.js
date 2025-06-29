const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
} = require('discord.js');
const { readFileSync } = require('fs');
const { join } = require('path');

const config = JSON.parse(readFileSync(join(__dirname, '..', 'config.json')));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = config.PREFIX;
const ownerId = config.OWNERID;

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'banggiadeco') {
    if (!ownerId.includes(message.author.id)) {
      return message.reply('Bạn không có quyền thực hiện lệnh này.');
    }

    if (message.deletable) {
      await message.delete().catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('🎨 DISCORD DECO')
      .setDescription(
        `### 📦 **With NICHO**\n` +
        `<:RL_dot:1378092502787031040>77 SEK - 8$ <a:RL_ten:1376247271909232721> 47 SEK - 5$\n` +
        `<:RL_dot:1378092502787031040>64 SEK - 6$ <a:RL_ten:1376247271909232721> 44 SEK - 5$\n` +
        `<:RL_dot:1378092502787031040>330 SEK - 34$ <a:RL_ten:1376247271909232721>160 SEK - 16$\n` +
        `<:RL_dot:1378092502787031040>199 SEK - 20$ <a:RL_ten:1376247271909232721> 99 SEK - 10$\n` +
        `<:RL_dot:1378092502787031040>110 SEK - 10$  <a:RL_ten:1376247271909232721>79 SEK - 8$\n\n` +

        `### 📦 **Without NICHO**\n` +
        `<:RL_dot:1378092502787031040>110 SEK - 10$ <a:RL_ten:1376247271909232721>67 SEK - 7$\n` +
        `<:RL_dot:1378092502787031040>77 SEK - 8$ <a:RL_ten:1376247271909232721>54 SEK - 5$\n` +
        `<:RL_dot:1378092502787031040>430 SEK - 40$ <a:RL_ten:1376247271909232721>230 SEK - 23$\n` +
        `<:RL_dot:1378092502787031040>249 SEK - 26$ <a:RL_ten:1376247271909232721>149 SEK - 15$\n\n` +

        `### 📌 ** Purchase here <#1386787873205911642> **\n` +
        `* 🚚 **Fast delivery – Trusted warranty**`
      )
      .setImage('https://cdn.discordapp.com/attachments/1376211384626446411/1380884482944667702/Radiant_Lotus_-_Animated_2.gif')  // Ảnh lớn
      .setThumbnail('https://cdn.discordapp.com/attachments/1376211384626446411/1386797093586337862/Lotus_Store_Logo_Animated.gif?ex=685b02f0&is=6859b170&hm=415394a388a7d940de9737c5e9d22c0cacdf244a62c05b341ad141fb95f1b271&') // Ảnh nhỏ
      .setTimestamp()
      .setFooter({ text: 'Radiant Lotus', iconURL: config.IMG });

    const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('quyenloi')
      .setLabel('Purchase Benefits')
      .setStyle(ButtonStyle.Primary)
      .setEmoji({ name: 'RL_62802', id: '1376215865036636182' }),
  
    new ButtonBuilder()
      .setCustomId('yeucau')
      .setLabel('Purchase Requirements')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ name: 'RL_staff', id: '1376216822197784587' })
  );

    await message.channel.send({ embeds: [embed], components: [buttons] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const user = interaction.user;
  const avatarURL = user.displayAvatarURL({ format: 'png', size: 32 });
  const username = user.username;
  const timeNow = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  if (interaction.customId === 'quyenloi') {
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Lotus Store - Ưu đãi')
      .setTitle('Lotus Store - Exclusive Deals')
      .setDescription(
        `<:RL_dot:1378092502787031040> Enjoy lower prices when you shop through **Lotus Store**, compared to buying directly on Discord.\n` +
        `<:RL_dot:1378092502787031040> Your privacy is our priority — we’re here for the long run.`
      )
      .setFooter({ text: `${username} • ${timeNow}`, iconURL: avatarURL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.customId === 'yeucau') {
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Lotus Store - Bảo Mật')
      .setDescription(
        "<:RL_dot:1378092502787031040> Products are **login-based**, delivered with: `Username + Password + 2FA Code`.\n" +
        "<:RL_dot:1378092502787031040> Owning Nitro Boost lets you shop at the listed discounted prices with no hidden fees."
      )
      .setFooter({ text: `${username} • ${timeNow}`, iconURL: avatarURL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(config.TOKEN);
