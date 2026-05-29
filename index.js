const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ]
});

const points = {};

client.once('ready', () => {
  console.log(`Az79 Bot is online! Logged in as ${client.user.tag}`);
});

// ترحيب بالأعضاء الجدد
client.on('guildMemberAdd', member => {
  const channel = member.guild.systemChannel;
  if (channel) {
    channel.send(`👋 أهلاً وسهلاً **${member.user.username}** في سيرفر **${member.guild.name}**! 🎉`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // نظام النقاط
  const userId = message.author.id;
  if (!points[userId]) points[userId] = 0;
  points[userId]++;

  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ========== أوامر عامة ==========
  if (command === 'ping') {
    message.reply('🏓 Pong! البوت شغال!');
  }

  if (command === 'help') {
    message.reply(`
**Az79 Bot - قائمة الأوامر:**
\`!ping\` - تحقق من البوت
\`!info\` - معلومات السيرفر
\`!نقاطي\` - شوف نقاطك
\`!تخمين\` - لعبة تخمين الرقم
\`!نكتة\` - نكتة عشوائية
\`!ban @شخص\` - حظر (للمشرفين)
\`!kick @شخص\` - طرد (للمشرفين)
\`!mute @شخص\` - كتم (للمشرفين)
    `);
  }

  if (command === 'info') {
    message.reply(`**السيرفر:** ${message.guild.name}\n**الأعضاء:** ${message.guild.memberCount}`);
  }

  // ========== نظام النقاط ==========
  if (command === 'نقاطي') {
    message.reply(`⭐ عندك **${points[userId]}** نقطة يا ${message.author.username}!`);
  }

  // ========== ألعاب ==========
  if (command === 'تخمين') {
    const number = Math.floor(Math.random() * 10) + 1;
    message.reply(`🎮 خمّن رقم بين 1 و 10! عندك 3 محاولات - ارسل رقمك الآن!`);
    
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, max: 3, time: 30000 });
    
    let guessed = false;
    collector.on('collect', m => {
      const guess = parseInt(m.content);
      if (guess === number) {
        m.reply(`🎉 صح! الرقم كان **${number}**! +10 نقاط!`);
        points[userId] += 10;
        guessed = true;
        collector.stop();
      } else if (guess < number) {
        m.reply('📈 أكبر!');
      } else {
        m.reply('📉 أصغر!');
      }
    });

    collector.on('end', () => {
      if (!guessed) message.channel.send(`⏰ انتهى الوقت! الرقم كان **${number}**`);
    });
  }

  if (command === 'نكتة') {
    const jokes = [
      'ليش البحر مالح؟ لأن الأسماك ما تعرف تطبخ 😂',
      'شو الفرق بين الكرسي والكرسي؟ لا شي، كلهم كراسي 😅',
      'دخل واحد محل وقال: عندك ثلاجة؟ قال: لا. قال: طيب ليش وجهك أبيض؟ 😂',
      'ليش الدجاجة قطعت الشارع؟ لأنها شافت KFC من الثاني 😂',
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    message.reply(joke);
  }

  // ========== مودريشن ==========
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ ما عندك صلاحية!');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ تاق شخص!');
    await member.ban();
    message.reply(`✅ تم حظر **${member.user.username}**`);
  }

  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('❌ ما عندك صلاحية!');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ تاق شخص!');
    await member.kick();
    message.reply(`✅ تم طرد **${member.user.username}**`);
  }

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ ما عندك صلاحية!');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ تاق شخص!');
    await member.timeout(10 * 60 * 1000);
    message.reply(`✅ تم كتم **${member.user.username}** لمدة 10 دقائق`);
  }
});

client.login(process.env.TOKEN);
