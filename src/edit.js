import { connection } from './db.js';
import { mainMenu } from './keyboards.js';

export async function handleEdit(bot, msg, channelId, userStates) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Назад') {
    userStates[chatId] = 'main';
    bot.sendMessage(chatId, 'Повернення до головного меню:', mainMenu);
  } else if (text === 'Попередні') {
    bot.sendMessage(chatId, 'Попередні пости (ще не реалізовано)');
  } else if (text === 'Новіші') {
    bot.sendMessage(chatId, 'Новіші пости (ще не реалізовано)');
  } else {
    try {
      let posts = await connection.query(
        `SELECT * FROM \`${channelId}\` ORDER BY publish_date DESC`
      );
      posts = posts[0];

      console.log("posts " + posts.map(post => post.text));
      console.log(posts);

      let keyboard = [];
      await processPosts(posts, bot, chatId); // Використовуємо for await...of

      let replyKeyboard = [];
      if (posts.length === 10) {
        replyKeyboard.push(['Попередні']);
      }
      replyKeyboard.push(['Назад']);

      bot.sendMessage(chatId, 'Виберіть пост для редагування:', {
        reply_markup: {
          keyboard: replyKeyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });

      bot.on('callback_query', async (query) => {
        const data = query.data;
        if (data.startsWith('edit_')) {
          bot.sendMessage(chatId, 'Редагування поста (ще не реалізовано)');
        } else if (data.startsWith('book_')) {
          bot.sendMessage(chatId, 'Бронювання поста (ще не реалізовано)');
        }
      });
    } catch (error) {
      console.error('Помилка отримання постів:', error);
      bot.sendMessage(chatId, 'Не вдалося отримати пости.');
    }
  }
}

async function processPosts(posts, bot, chatId) {
  for await (const post of posts) {
    const text = post.text ? post.text : "пост без тексту";
    const messageId = post.message_id;
    await bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [[{ text: 'Редагувати', callback_data: `edit_${messageId}` }, { text: 'БРОНЬ', callback_data: `book_${messageId}` }]],
      },
    });
  }
}