import { mainMenu } from './keyboards.js';

export async function handleEdit(bot, msg, channelId, userStates) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'Назад') {
    userStates[chatId] = 'main';
    bot.sendMessage(chatId, 'Повернення до головного меню:', mainMenu);
  } else {
    bot.sendMessage(chatId, 'Ви в режимі редагування. Логіка ще не додана:', {
      reply_markup: { keyboard: [['Назад']], resize_keyboard: true, one_time_keyboard: true }
    });
    // Логіка редагування буде додана тут пізніше
  }
}