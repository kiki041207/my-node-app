require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

(async () => {
    const pool = mysql.createPool({ ...config, connectionLimit: 10 });

    try {
        console.log('=== Создание таблицы ===');
        await pool.query('DROP TABLE IF EXISTS students');
        await pool.query(`
            CREATE TABLE students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                group_name VARCHAR(20) NOT NULL,
                course INT NOT NULL,
                grade DECIMAL(3,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✔ Таблица students создана');

        console.log('\n=== INSERT ===');
        const [r1] = await pool.query(
            'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
            ['Иван', 'ББМО-01-23', 2, 4.5]
        );
        console.log('✔ Вставлен студент: id=' + r1.insertId + ', affectedRows=' + r1.affectedRows);

        const [r2] = await pool.query(
            'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
            ['Мария', 'ББМО-01-23', 2, 3.8, 'Петр', 'ББМО-01-23', 3, 4.2, 'Анна', 'ББМО-02-23', 1, 4.9]
        );
        console.log('✔ Вставлено 3 студента: affectedRows=' + r2.affectedRows);

        console.log('\n=== SELECT ===');
        const [all] = await pool.query('SELECT * FROM students');
        all.forEach(s => console.log('id=' + s.id + ', name=' + s.name + ', group=' + s.group_name + ', grade=' + s.grade));

        console.log('\nСтуденты группы ББМО-01-23 (по grade):');
        const [filtered] = await pool.query(
            'SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC',
            ['ББМО-01-23']
        );
        filtered.forEach(s => console.log('id=' + s.id + ', name=' + s.name + ', grade=' + s.grade));

        console.log('\n=== UPDATE ===');
        const [u1] = await pool.query('UPDATE students SET grade = ? WHERE id = ?', [5.0, 1]);
        console.log('✔ Обновлён id=1: affectedRows=' + u1.affectedRows + ', changedRows=' + u1.changedRows);

        const [u2] = await pool.query('UPDATE students SET grade = ? WHERE id = ?', [5.0, 1]);
        console.log('✔ Повторное обновление: affectedRows=' + u2.affectedRows + ', changedRows=' + u2.changedRows);

        console.log('\n=== DELETE ===');
        const [d] = await pool.query('DELETE FROM students WHERE id = ?', [1]);
        console.log('✔ Удалён id=1: affectedRows=' + d.affectedRows);

        console.log('\n=== Защита от SQL-инъекции ===');
        const injection = "' ; DROP TABLE students; --";
        const [safe] = await pool.query('SELECT * FROM students WHERE name = ?', [injection]);
        console.log('✔ Параметризованный запрос безопасен (найдено: ' + safe.length + ')');

    } catch (err) {
        console.error('Ошибка:', err.message);
    } finally {
        await pool.end();
    }
})();