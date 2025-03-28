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

// For file clearCurrTable.js only
export async function clearCurrTable() {
    const tableName = process.env.CHANNEL_ID;

    try {
        const query = `
            DELETE FROM \`${tableName}\` 
        `;
        await connection.execute(query);
        console.log(`✅ Таблицю каналу ${tableName} очищено.`);
        await connection.end();
    } catch (error) {
        console.error("❌ Помилка збереження повідомлення:", error.message);
        await connection.end();
    }
}

export { connection, createTable };
