import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { connection, saveMessage, createTable } from './db.js';
import { checkAccess } from './accessControl.js'; // Імпорт checkAccess
import { mainMenu, backMenu } from './keyboards.js';
import { handleEdit } from './edit.js';
import { handleDelete } from './delete.js';
import { handlePublish } from './publish.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

await createTable(channelId);

const bot = new TelegramBot(token, { polling: true });

// Об’єкт для зберігання стану користувачів
const userStates = {};

// Обробка натискань на кнопки
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Перевірка доступу
    const hasAccess = await checkAccess(bot, channelId, chatId);
    if (!hasAccess) {
        bot.sendMessage(chatId, 'Доступ заборонено.');
        return;
    }

    // Пропускаємо обробку /start, бо вона вже оброблена в bot.onText
    if (text === '/start') {
        return;
    }

    // Якщо стану немає, повертаємо до головного меню
    if (!userStates[chatId]) {
        userStates[chatId] = 'main';
        bot.sendMessage(chatId, 'Будь ласка, оберіть дію з меню:', mainMenu);
        return;
    }
  
    // Обробка залежно від стану
  switch (userStates[chatId]) {
    case 'main':
      switch (text) {
        case 'Редагувати':
          userStates[chatId] = 'editing';
          bot.sendMessage(chatId, 'Ви перейшли до функції редагування.', backMenu);
          // Логіка редагування додаватиметься пізніше
          break;

        case 'Видалити':
          userStates[chatId] = 'deleting';
          bot.sendMessage(chatId, 'Ви перейшли до функції видалення.', backMenu);
          // Логіка видалення додаватиметься пізніше
          break;

        case 'Опублікувати':
          userStates[chatId] = 'publishing';
          bot.sendMessage(chatId, 'Ви перейшли до функції публікації.', backMenu);
          // Логіка публікації додаватиметься пізніше
          break;

        default:
          if (text !== '/start') {
            bot.sendMessage(chatId, 'Будь ласка, оберіть дію з меню:', mainMenu);
          }
      }
      break;

    case 'editing':
        await handleEdit(bot, msg, channelId, userStates);
        break;

    case 'deleting':
        await handleDelete(bot, msg, channelId, userStates);
        break;

    case 'publishing':
        await handlePublish(bot, msg, channelId, userStates);
        break;

    default:
        // Якщо стан невідомий, повертаємо до головного меню
        userStates[chatId] = 'main';
        bot.sendMessage(chatId, 'Статус користувача скинуто. Оберіть дію:', mainMenu);
  }
});

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const hasAccess = await checkAccess(bot, channelId, chatId); // Передаємо bot і channelId

  if (hasAccess) {
    userStates[chatId] = 'main'; // Встановлюємо початковий стан
    bot.sendMessage(chatId, 'Вітаю, адміністраторе! Оберіть дію:', mainMenu);
  } else {
    bot.sendMessage(chatId, 'Доступ заборонено.');
  }
});

// Завершення роботи
process.on('SIGINT', async () => {
  console.log('Отримано сигнал для завершення роботи...');
  await connection.end();
  console.log(`З'єднання з базою даних закрито.`);
  process.exit();
});

export default bot;