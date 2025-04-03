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



process.on('SIGINT', async () => {
    console.log('Отримано сигнал для завершення роботи...');
    await connection.end();
    console.log(`З'єднання з базою даних закрито.`);
    process.exit();
});

export default bot;