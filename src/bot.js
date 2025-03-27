import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { saveMessageId } from './db.js';
import { connection } from './db.js'; // Імпортуємо з'єднання

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;

const bot = new TelegramBot(token, { polling: true });

// Коли користувач натискає /start, бот відповідає з привітальним повідомленням і клавіатурою
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Створюємо клавіатуру з 3 кнопками, де "Опублікувати" в другому рядку
    const options = {
        reply_markup: {
            keyboard: [
                ['Редагувати', 'Видалити'], // Перший рядок кнопок
                ['Опублікувати'] // Другий рядок кнопок
            ],
            one_time_keyboard: true, // Клавіатура зникне після натискання
            resize_keyboard: true // Автоматично змінює розмір клавіатури
        }
    };

    // Відправляємо привітальне повідомлення з клавіатурою
    bot.sendMessage(chatId, 'Привіт! Бот успішно запустився. Чим я можу допомогти?', options);
});

// Створюємо клавіатуру головного меню
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['Редагувати', 'Видалити'], // Перший рядок кнопок
            ['Опублікувати'] // Другий рядок кнопок
        ],
        one_time_keyboard: true, // Клавіатура зникне після натискання
        resize_keyboard: true // Автоматично змінює розмір клавіатури
    }
};

// Обробка натискання кнопки "Опублікувати"
bot.onText(/Опублікувати/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['Текст', 'Відео', 'Зображення'], // Кнопки для вибору контенту
                ['Назад'] // Кнопка "Назад" для повернення в меню
            ],
            resize_keyboard: true // Автоматично змінює розмір клавіатури
        }
    };
    bot.sendMessage(chatId, 'Виберіть параметри для публікації: текст, відео або зображення...', options);
});

// Обробка текстових постів
bot.onText(/Текст/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Введіть текст для публікації:');
    
    bot.once('message', async (message) => {
        if (!message.text || message.text === "Назад") return;

        try {
            const sentMessage = await bot.sendMessage(channelId, message.text);
            await saveMessageId(sentMessage.message_id);
            console.log(`Пост ${sentMessage.message_id} забережно до бази даних`);
            bot.sendMessage(chatId, '✅ Текст опубліковано!', mainMenu);
        } catch (error) {
            bot.sendMessage(chatId, '❌ Помилка публікації.');
            console.error(error);
        }
    });
});

// Обробка натискання кнопки "Редагувати"
bot.onText(/Редагувати/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['Вибір посту для редагування'], // Кнопка для вибору поста
                ['Назад'] // Кнопка "Назад" для повернення в меню
            ],
            resize_keyboard: true // Автоматично змінює розмір клавіатури
        }
    };
    bot.sendMessage(chatId, 'Виберіть пост для редагування...', options);
});

// Обробка натискання кнопки "Видалити"
bot.onText(/Видалити/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['Вибір посту для видалення'], // Кнопка для вибору поста
                ['Назад'] // Кнопка "Назад" для повернення в меню
            ],
            resize_keyboard: true // Автоматично змінює розмір клавіатури
        }
    };
    bot.sendMessage(chatId, 'Виберіть пост для видалення...', options);
});

// Обробка натискання кнопки "Назад" з будь-якої секції
bot.onText(/Назад/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Повертаємося в головне меню...', mainMenu);
});

// Завершення роботи та закриття з'єднання з базою даних при натисканні CTRL+C
process.on('SIGINT', async () => {
    console.log('Отримано сигнал для завершення роботи...');
    await connection.end();  // Закриваємо з'єднання з базою даних
    console.log(`З'єднання з базою даних закрито.`);
    process.exit();  // Завершуємо роботу бота
});

export default bot;