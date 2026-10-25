const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('greet', (name) => {
    console.log('Привет, ' + name + '!');
});

emitter.on('info', (group) => {
    console.log('Группа: ' + group);
});

console.log('Запуск событий...');
emitter.emit('greet', 'Александра');
emitter.emit('info', '477');

const result1 = emitter.emit('greet', 'Александра');
console.log('Результат emit (есть слушатели): ' + result1);

const result2 = emitter.emit('unknown');
console.log('Результат emit (нет слушателей): ' + result2);