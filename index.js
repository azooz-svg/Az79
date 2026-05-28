const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.once('ready', () => {
  console.log(`Az79 Bot is online! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('🏓 Pong! البوت شغال!');
  }

  if (message.content === '!help') {
    message.reply(`
**Az79 Bot - قائمة الأوامر:**
\`!ping\` - تحقق من البوت
\`!help\` - قائمة الأوامر
\`!info\` - معلومات السيرفر
    `);
  }

  if (message.content === '!info') {
    message.reply(`**السيرفر:** ${message.guild.name}\n**الأعضاء:** ${message.guild.memberCount}`);
  }
});

client.login(process.env.TOKEN);
