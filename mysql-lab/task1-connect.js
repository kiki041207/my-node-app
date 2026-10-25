require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function singleConnection() {
    console.log('=== Одиночное соединение ===');
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✔ Подключение установлено');

        const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS db, USER() AS user');
        console.log('Версия MySQL: ' + rows[0].version);
        console.log('Текущая БД: ' + rows[0].db);
        console.log('Пользователь: ' + rows[0].user);

        await connection.end();
        console.log('✔ Соединение закрыто');
    } catch (err) {
        console.error('✘ Ошибка подключения:', err.message);
    }
}

async function poolConnection() {
    console.log('\n=== Пул соединений ===');
    const pool = mysql.createPool({ ...config, connectionLimit: 10 });
    try {
        console.log('✔ Пул создан (лимит: 10)');
        const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS db');
        console.log('Версия MySQL: ' + rows[0].version);
        console.log('Текущая БД: ' + rows[0].db);
        console.log('Соединений в пуле: 10');
        console.log('✔ Пул готов к работе');
    } catch (err) {
        console.error('✘ Ошибка пула:', err.message);
    } finally {
        await pool.end();
    }
}

(async () => {
    await singleConnection();
    await poolConnection();
})();