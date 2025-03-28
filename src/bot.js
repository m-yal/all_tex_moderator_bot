import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { connection, createTable } from './db.js';
import { checkAccess } from './accessControl.js';
import { mainMenu, backMenu } from './keyboards.js';
import { handleEdit } from './edit.js';
import { handlePublish } from './publish.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

await createTable(channelId);

const bot = new TelegramBot(token, { polling: true });

const userStates = {};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const hasAccess = await checkAccess(bot, channelId, chatId);
    if (!hasAccess) {
        bot.sendMessage(chatId, 'Доступ заборонено.');
        return;
    }

    if (text === '/start') {
        return;
    }

    if (!userStates[chatId]) {
        userStates[chatId] = 'main';
        bot.sendMessage(chatId, 'Будь ласка, оберіть дію з меню:', mainMenu);
        return;
    }

    switch (userStates[chatId]) {
        case 'main':
            switch (text) {
                case 'Редагувати':
                    userStates[chatId] = 'editing';
                    await handleEdit(bot, msg, channelId, userStates); // Викликаємо handleEdit
                    break;
                case 'Опублікувати':
                    userStates[chatId] = 'publishing';
                    bot.sendMessage(chatId, 'Ви перейшли до функції публікації.', backMenu);
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
        case 'publishing':
            await handlePublish(bot, msg, channelId, userStates);
            break;
        default:
            userStates[chatId] = 'main';
            bot.sendMessage(chatId, 'Статус користувача скинуто. Оберіть дію:', mainMenu);
    }
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const hasAccess = await checkAccess(bot, channelId, chatId);

    if (hasAccess) {
        userStates[chatId] = 'main';
        bot.sendMessage(chatId, 'Вітаю, адміністраторе! Оберіть дію:', mainMenu);
    } else {
        bot.sendMessage(chatId, 'Доступ заборонено.');
    }
});

process.on('SIGINT', async () => {
    console.log('Отримано сигнал для завершення роботи...');
    await connection.end();
    console.log(`З'єднання з базою даних закрито.`);
    process.exit();
});

export default bot;