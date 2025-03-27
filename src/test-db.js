import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        console.log("✅ Підключення до бази успішне!");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS \`${process.env.CHANNEL_ID}\` (
                message_id VARCHAR(50) PRIMARY KEY,
                publish_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Таблиця ініціалізована!");

        await connection.end();

        console.log("З'єднання завершено");
    } catch (error) {
        console.error("❌ Помилка підключення або створення таблиці:", error.message);
    }
}

testConnection();