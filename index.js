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
    channel.send(`👋 أهلاً وسهلاً **${member.user.username}** في سيرفر **${member.guild.name}**! 🎉\nاتمنى تقضي وقت حلو معنا! 😊`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userId = message.author.id;
  if (!points[userId]) points[userId] = 0;

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
**Az79 Bot - قائمة الأوامر** 🤖
━━━━━━━━━━━━━━━
🎮 **ألعاب:**
\`!تخمين\` - خمّن رقم بين 1 و 100
\`!نكتة\` - نكتة عشوائية
\`!عواصم\` - عواصم
\`!عشوائي\` - رقم عشوائي

⭐ **النقاط:**
\`!نقاطي\` - شوف نقاطك
\`!لوحة\` - أعلى 5 لاعبين

ℹ️ **معلومات:**
\`!info\` - معلومات السيرفر
\`!يوزر\` - معلوماتك

🛡️ **مودريشن:**
\`!ban @شخص\` - حظر
\`!kick @شخص\` - طرد
\`!mute @شخص\` - كتم 10 دقائق
\`!تايم @شخص\` - كتم 10 دقائق

━━━━━━━━━━━━━━━

    `);
  }

  if (command === 'info') {
    message.reply(`📊 **معلومات السيرفر:**\n🏠 الاسم: ${message.guild.name}\n👥 الأعضاء: ${message.guild.memberCount}`);
  }

  if (command === 'يوزر') {
    const target = message.mentions.members.first() || message.member;
    message.reply(`👤 **${target.user.username}**\n🆔 ID: ${target.user.id}\n📅 انضم: ${target.joinedAt.toLocaleDateString('ar')}\n⭐ نقاطه: ${points[target.user.id] || 0}`);
  }

  // ========== نظام النقاط ==========
  if (command === 'نقاطي') {
    message.reply(`⭐ عندك **${points[userId]}** نقطة يا ${message.author.username}!`);
  }

  if (command === 'لوحة') {
    const sorted = Object.entries(points).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (sorted.length === 0) return message.reply('ما في نقاط بعد!');
    let board = '🏆 **لوحة المتصدرين:**\n━━━━━━━━━━━━━\n';
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    sorted.forEach(([id, pts], i) => {
      board += `${medals[i]} <@${id}> - **${pts}** نقطة\n`;
    });
    message.reply(board);
  }

  // ========== ألعاب ==========
  if (command === 'تخمين') {
    const number = Math.floor(Math.random() * 100) + 1;
    message.reply(`🎮 خمّن رقم بين **1** و **100**!\nعندك **5 محاولات** - ارسل رقمك الآن!`);

    const filter = m => m.author.id === message.author.id && !isNaN(m.content);
    const collector = message.channel.createMessageCollector({ filter, max: 5, time: 60000 });

    let attempts = 0;
    let guessed = false;

    collector.on('collect', m => {
      attempts++;
      const guess = parseInt(m.content);
      const remaining = 5 - attempts;

      if (guess === number) {
        points[userId] += 1;
        m.reply(`🎉 صح! الرقم كان **${number}**!\n+1 نقطة! نقاطك الآن: **${points[userId]}** ⭐`);
        guessed = true;
        collector.stop();
      } else if (remaining === 0) {
        m.reply(`😔 انتهت المحاولات! الرقم كان **${number}**\nما أخذت نقاط هالمرة.`);
      } else if (guess < number) {
        m.reply(`📈 أكبر! باقي **${remaining}** محاولات`);
      } else {
        m.reply(`📉 أصغر! باقي **${remaining}** محاولات`);
      }
    });

    collector.on('end', () => {
      if (!guessed && attempts < 5) {
        message.channel.send(`⏰ انتهى الوقت! الرقم كان **${number}**`);
      }
    });
  }

  if (command === 'نكتة') {
    const jokes = [
      'ليش البحر مالح؟ لأن الأسماك ما تعرف تطبخ 😂',
      'شو الفرق بين الكرسي والكرسي؟ لا شي، كلهم كراسي 😅',
      'واحد دخل محل وقال: عندك ثلاجة؟ قال: لا. قال: طيب ليش وجهك أبيض؟ 😂',
      'ليش الدجاجة قطعت الشارع؟ لأنها شافت KFC من الثاني 😂',
      'واحد سأل الثاني: كم الساعة؟ قال: ما عندي ساعة. قال: وش تسوي بيدك؟ قال: أحسبها على أصابعي 😂',
      'واحد راح الدكتور قال: دكتور كل شي آكله يؤلمني. قال الدكتور: بلع الطاولة 😂',
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    message.reply(`😂 ${joke}`);
  }

  if (command === 'عواصم!') {
    const questions = [
      { q: 'ما عاصمة فرنسا؟', a: 'باريس' },
      
    { q: 'ما عاصمة السعودية؟', a: 'الرياض' },
      { q: 'ما عاصمة السعودية؟', a: 'الرياض' },
{ q: 'ما عاصمة مصر؟', a: 'القاهرة' },
{ q: 'ما عاصمة الإمارات؟', a: 'أبوظبي' },
{ q: 'ما عاصمة الكويت؟', a: 'الكويت' },
{ q: 'ما عاصمة قطر؟', a: 'الدوحة' },
{ q: 'ما عاصمة البحرين؟', a: 'المنامة' },
{ q: 'ما عاصمة عمان؟', a: 'مسقط' },
{ q: 'ما عاصمة الأردن؟', a: 'عمان' },
{ q: 'ما عاصمة لبنان؟', a: 'بيروت' },
{ q: 'ما عاصمة العراق؟', a: 'بغداد' },
{ q: 'ما عاصمة سوريا؟', a: 'دمشق' },
{ q: 'ما عاصمة تركيا؟', a: 'أنقرة' },
{ q: 'ما عاصمة إيران؟', a: 'طهران' },
{ q: 'ما عاصمة ألمانيا؟', a: 'برلين' },
{ q: 'ما عاصمة إيطاليا؟', a: 'روما' },
{ q: 'ما عاصمة إسبانيا؟', a: 'مدريد' },
{ q: 'ما عاصمة البرتغال؟', a: 'لشبونة' },
{ q: 'ما عاصمة هولندا؟', a: 'أمستردام' },
{ q: 'ما عاصمة بلجيكا؟', a: 'بروكسل' },
{ q: 'ما عاصمة سويسرا؟', a: 'برن' },
{ q: 'ما عاصمة النمسا؟', a: 'فيينا' },
{ q: 'ما عاصمة اليونان؟', a: 'أثينا' },
{ q: 'ما عاصمة روسيا؟', a: 'موسكو' },
{ q: 'ما عاصمة الصين؟', a: 'بكين' },
{ q: 'ما عاصمة الهند؟', a: 'نيودلهي' },
{ q: 'ما عاصمة كوريا الجنوبية؟', a: 'سيول' },
{ q: 'ما عاصمة إندونيسيا؟', a: 'جاكرتا' },
{ q: 'ما عاصمة ماليزيا؟', a: 'كوالالمبور' },
{ q: 'ما عاصمة تايلاند؟', a: 'بانكوك' },
{ q: 'ما عاصمة أستراليا؟', a: 'كانبيرا' },
{ q: 'ما عاصمة كندا؟', a: 'أوتاوا' },
{ q: 'ما عاصمة المكسيك؟', a: 'مكسيكو سيتي' },
{ q: 'ما عاصمة البرازيل؟', a: 'برازيليا' },
{ q: 'ما عاصمة الأرجنتين؟', a: 'بوينس آيرس' },
{ q: 'ما عاصمة جنوب أفريقيا؟', a: 'بريتوريا' },
{ q: 'ما عاصمة نيجيريا؟', a: 'أبوجا' },
{ q: 'ما عاصمة المغرب؟', a: 'الرباط' },
{ q: 'ما عاصمة الجزائر؟', a: 'الجزائر' },
{ q: 'ما عاصمة تونس؟', a: 'تونس' },
{ q: 'ما عاصمة ليبيا؟', a: 'طرابلس' },
      { q: 'ما عاصمة اليابان؟', a: 'طوكيو' },
    
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    message.reply(`❓ **${q.q}**\nعندك 30 ثانية!`);

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 30000 });

    collector.on('collect', m => {
      if (m.content.toLowerCase().includes(q.a.toLowerCase())) {
        points[userId] += 1;
        m.reply(`✅ صح! +1 نقطة! نقاطك: **${points[userId]}** ⭐`);
      } else {
        m.reply(`❌ غلط! الجواب الصح: **${q.a}**`);
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) message.channel.send(`⏰ انتهى الوقت! الجواب: **${q.a}**`);
    });
  }

  if (command === 'عشوائي') {
    const num = Math.floor(Math.random() * 100) + 1;
    message.reply(`🎲 الرقم العشوائي: **${num}**`);
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
