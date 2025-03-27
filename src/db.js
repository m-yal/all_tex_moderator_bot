import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Оновлене створення таблиці для конкретного каналу
async function createTable(channelId) {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`${channelId}\` (
            message_id VARCHAR(255) PRIMARY KEY,
            publish_date DATETIME NOT NULL,
            text TEXT,
            media_url TEXT,
            media_type VARCHAR(50)
        )
    `);
    console.log(`Таблиця для каналу ${channelId} ініціалізована!`);
}

// Оновлене збереження повідомлення
async function saveMessage(channelId, messageId, text, mediaUrl = null, mediaType = null) {
    try {
        const query = `
            INSERT INTO \`${channelId}\` (message_id, publish_date, text, media_url, media_type) 
            VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)
        `;
        await connection.execute(query, [messageId, text, mediaUrl, mediaType]);
        console.log(`✅ Повідомлення ${messageId} для каналу ${channelId} збережено в базі.`);
    } catch (error) {
        console.error("❌ Помилка збереження повідомлення:", error.message);
    }
}

export { connection, createTable, saveMessage };
