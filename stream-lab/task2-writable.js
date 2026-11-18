const { Writable } = require('stream');

const chunks = [
    'Группа: 477',
    'Студент: Булыга Александра Витальевна',
    'Лабораторная работа: №21',
    'Тема: Потоки в Node.js'
];

let written = 0;

const writable = new Writable({
    highWaterMark: 16,
    write(chunk, encoding, callback) {
        console.log('[WRITE] ' + chunk.toString());
        
        setTimeout(() => {
            written++;
            callback();
        }, 100);
    }
});

console.log('=== Демонстрация Writable-потока ===\n');

writable.on('drain', () => {
    console.log('[DRAIN] Буфер освобожден, продолжаем запись');
});

writable.on('finish', () => {
    console.log('\n[FINISH] Все данные записаны');
    console.log('Всего записано: ' + written + ' чанков');
});

writable.on('error', (err) => {
    console.error('Ошибка:', err.message);
});

for (let i = 0; i < chunks.length; i++) {
    const ok = writable.write(chunks[i]);
    console.log('write() вернул: ' + ok + (ok ? '' : ' ← буфер переполнен!'));
}

writable.end();