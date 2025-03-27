import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

async function createTable() {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`${process.env.CHANNEL_ID}\` (
            message_id VARCHAR(50) PRIMARY KEY,
            publish_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log("Таблиця ініціалізована!");
}

export { connection, createTable };
