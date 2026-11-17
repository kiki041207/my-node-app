require('dotenv').config();
const mysql = require('mysql2/promise');

const baseConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function testError(label, config) {
    try {
        const conn = await mysql.createConnection(config);
        await conn.end();
        console.log('[' + label + '] Нет ошибки');
    } catch (err) {
        console.log('[' + err.code + '] ' + err.message);
    }
}

(async () => {
    console.log('=== Демонстрация ошибок ===');

    await testError('ECONNREFUSED', { ...baseConfig, host: 'localhost', port: 9999 });

    await testError('ER_ACCESS_DENIED_ERROR', { ...baseConfig, password: 'wrong_password' });

    const pool = mysql.createPool(baseConfig);
    try {
        await pool.query('SELECT * FRM students');
    } catch (err) {
        console.log('[' + err.code + '] ' + err.message);
    }

    try {
        await pool.query('INSERT INTO students (name, group_name, course) VALUES (?, ?, ?)', ['Test', 'ББМО-01-23', 1]);
        await pool.query('INSERT INTO students (id, name, group_name, course) VALUES (?, ?, ?, ?)', [1, 'Dup', 'ББМО-01-23', 1]);
    } catch (err) {
        console.log('[' + err.code + '] ' + err.message);
    }

    try {
        await pool.query('INSERT INTO students (group_name, course) VALUES (?, ?)', ['ББМО-01-23', 1]);
    } catch (err) {
        console.log('[' + err.code + '] ' + err.message);
    }

    await pool.end();
})();