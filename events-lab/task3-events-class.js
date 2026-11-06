const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
    connect() {
        this.emit('connect', 'Соединение установлено');
    }

    query(sql) {
        this.emit('query', sql);
    }

    close() {
        this.emit('close', 'Соединение закрыто');
    }

    error(message) {
        this.emit('error', new Error(message));
    }
}

const db = new DatabaseConnection();

db.on('connect', (msg) => console.log('[EVENT] ' + msg));
db.on('query', (sql) => {
    console.log('[EVENT] Выполнение запроса: ' + sql);
    console.log('[EVENT] Результат: 50 записей');
});
db.on('close', (msg) => console.log('[EVENT] ' + msg));
db.on('error', (err) => console.log('[EVENT] Ошибка: ' + err.message));

console.log('1. DatabaseConnection (группа 477)');
console.log('2. [EVENT] Подключение к БД...');

db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students');
db.close();

console.log('\n[EVENT] Демонстрация ошибки');
db.error('Connection timeout');

console.log('(без слушателя error — процесс упал бы с исключением)');