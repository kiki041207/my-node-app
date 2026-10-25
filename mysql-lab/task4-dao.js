require('dotenv').config();
const mysql = require('mysql2/promise');

const baseConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

class StudentDAO {
    constructor(pool) {
        this.pool = pool;
    }

    validate(data) {
        if (!data.name || data.name.length < 2 || data.name.length > 100) {
            throw new Error('Имя должно быть от 2 до 100 символов');
        }
        if (!data.group_name || !/^ББМО-\d{2}-\d{2}$/.test(data.group_name)) {
            throw new Error('Группа должна быть в формате ББМО-XX-XX');
        }
        if (!data.course || data.course < 1 || data.course > 4) {
            throw new Error('Курс должен быть от 1 до 4');
        }
        if (data.grade !== null && data.grade !== undefined && (data.grade < 0 || data.grade > 5)) {
            throw new Error('Оценка должна быть от 0 до 5');
        }
    }

    async create(data) {
        this.validate(data);
        const [res] = await this.pool.query(
            'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
            [data.name, data.group_name, data.course, data.grade || null]
        );
        return { id: res.insertId, ...data };
    }

    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM students WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async findAll(options = {}) {
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        let sql = 'SELECT * FROM students';
        const params = [];
        const conditions = [];

        if (options.group_name) {
            conditions.push('group_name = ?');
            params.push(options.group_name);
        }
        if (options.course) {
            conditions.push('course = ?');
            params.push(options.course);
        }
        if (options.grade_min !== undefined) {
            conditions.push('grade >= ?');
            params.push(options.grade_min);
        }
        if (options.grade_max !== undefined) {
            conditions.push('grade <= ?');
            params.push(options.grade_max);
        }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        if (options.sort === 'name') sql += ' ORDER BY name ASC';
        else if (options.sort === '-name') sql += ' ORDER BY name DESC';
        else if (options.sort === 'grade') sql += ' ORDER BY grade ASC';
        else if (options.sort === '-grade') sql += ' ORDER BY grade DESC';

        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await this.pool.query(sql, params);
        const [countRows] = await this.pool.query('SELECT COUNT(*) AS total FROM students');
        return { data: rows, total: countRows[0].total, limit, offset };
    }

    async update(id, data) {
        const fields = [];
        const params = [];
        if (data.name) { fields.push('name = ?'); params.push(data.name); }
        if (data.group_name) { fields.push('group_name = ?'); params.push(data.group_name); }
        if (data.course) { fields.push('course = ?'); params.push(data.course); }
        if (data.grade !== undefined) { fields.push('grade = ?'); params.push(data.grade); }
        if (fields.length === 0) return null;
        params.push(id);
        const [res] = await this.pool.query('UPDATE students SET ' + fields.join(', ') + ' WHERE id = ?', params);
        return res.affectedRows > 0 ? this.findById(id) : null;
    }

    async delete(id) {
        const [res] = await this.pool.query('DELETE FROM students WHERE id = ?', [id]);
        return res.affectedRows > 0;
    }

    async search(query) {
        const [rows] = await this.pool.query('SELECT * FROM students WHERE name LIKE ?', ['%' + query + '%']);
        return rows;
    }

    async getStats() {
        const [stats] = await this.pool.query(`
            SELECT 
                COUNT(*) AS total,
                AVG(grade) AS avgGrade,
                MIN(grade) AS minGrade,
                MAX(grade) AS maxGrade
            FROM students
        `);
        const [byGroup] = await this.pool.query('SELECT group_name, COUNT(*) AS count FROM students GROUP BY group_name');
        const [byCourse] = await this.pool.query('SELECT course, COUNT(*) AS count FROM students GROUP BY course');
        return { ...stats[0], byGroup, byCourse };
    }
}

(async () => {
    const pool = mysql.createPool({ ...baseConfig, connectionLimit: 10 });
    const dao = new StudentDAO(pool);

    console.log('=== Создание с валидацией ===');
    try {
        const s = await dao.create({ name: 'Тест', group_name: 'ББМО-01-23', course: 2, grade: 4.5 });
        console.log('✔ Создан:', s);
    } catch (e) {
        console.log('✘ Ошибка:', e.message);
    }
    try {
        await dao.create({ name: 'X', group_name: 'ББМО-01-23', course: 2 });
    } catch (e) {
        console.log('✘ Валидация:', e.message);
    }

    console.log('\n=== Пагинация ===');
    const list = await dao.findAll({ limit: 2, offset: 0 });
    console.log('Всего:', list.total, '| Получено:', list.data.length);

    console.log('\n=== Фильтр ===');
    const filtered = await dao.findAll({ group_name: 'ББМО-01-23' });
    console.log('В группе ББМО-01-23:', filtered.data.length);

    console.log('\n=== Поиск ===');
    const found = await dao.search('Ив');
    console.log('Найдено:', found.length);

    console.log('\n=== Статистика ===');
    const stats = await dao.getStats();
    console.log(stats);

    await pool.end();
})();