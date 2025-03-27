import { mainMenu } from './keyboards.js';
import { connection } from './db.js';

export async function handlePublish(bot, msg, channelId, userStates) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const text = msg.caption || msg.text || '';
  let media = null;

  if (text === 'Назад') {
    userStates[chatId] = 'main';
    bot.sendMessage(chatId, 'Повернення до головного меню:', mainMenu).catch(error => {
      console.error('Помилка надсилання повідомлення:', error);
    });
    return;
  } else {
    bot.sendMessage(chatId, 'Надішліть текст або медіа для публікації:', {
      reply_markup: { keyboard: [['Назад']], resize_keyboard: true, one_time_keyboard: true }
    }).catch(error => {
      console.error('Помилка надсилання повідомлення:', error);
    });
  }

  if (msg.photo) {
    media = { type: 'photo', file_id: msg.photo[msg.photo.length - 1].file_id };
  } else if (msg.video) {
    media = { type: 'video', file_id: msg.video.file_id };
  }

  try {
    const [result] = await connection.query(
      `INSERT INTO \`${channelId}\` (message_id, publish_date, text, media_url, media_type) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)`, // Використовуємо channelId як назву таблиці
      [messageId, text, media ? media.file_id : null, media ? media.type : null]
    );

    if (media) {
      console.log("channelId before func. sendMediaGroup: " + channelId);
      console.log("chatId before func. sendMediaGroup: " + chatId);
      console.log("media.file_id before func. sendMediaGroup: " + media.file_id);
      await bot.sendMediaGroup(channelId, [{
        type: media.type,
        media: media.file_id,
        caption: text,
      }]).catch(error => {
        console.error('Помилка надсилання медіа:', error);
      });
    } else {
      await bot.sendMessage(channelId, text).then(response => {
        console.log('Відповідь Telegram API:', response);
      }).catch(error => {
        console.error('Помилка надсилання повідомлення:', error);
      });
    }

    bot.sendMessage(chatId, 'Пост опубліковано!');
  } catch (error) {
    console.error('Помилка публікації поста:', error);
    bot.sendMessage(chatId, 'Помилка публікації поста. Спробуйте ще раз.');
  }
}