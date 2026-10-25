const { Readable } = require('stream');

const chunks = [
    'Группа: 477',
    'Студент: Булыга Александра Витальевна',
    'Лабораторная работа: №21',
    'Тема: Потоки в Node.js'
];

let current = 0;

const readable = new Readable({
    read(size) {
        if (current < chunks.length) {
            this.push(chunks[current]);
            current++;
        } else {
            this.push(null);
        }
    }
});

let chunkCount = 0;

console.log('=== Демонстрация Readable-потока ===\n');

readable.on('data', (chunk) => {
    chunkCount++;
    console.log('[CHUNK ' + chunkCount + '] ' + chunk.toString());
});

readable.on('end', () => {
    console.log('\n[END] Поток завершен');
    console.log('Всего получено чанков: ' + chunkCount);
});

readable.on('error', (err) => {
    console.error('Ошибка:', err.message);
});