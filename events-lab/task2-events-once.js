const EventEmitter = require('events');
const emitter = new EventEmitter();

let onCount = 0;
let onceCount = 0;

emitter.on('tick', () => {
    onCount++;
    console.log('[tick #' + onCount + '] on-слушатель');
});

emitter.once('tick', () => {
    onceCount++;
    console.log('[tick #' + onceCount + '] once-слушатель');
});

emitter.emit('tick');
emitter.emit('tick');
emitter.emit('tick');

console.log('\non-слушатель вызван: ' + onCount + ' раза');
console.log('once-слушатель вызван: ' + onceCount + ' раз');

console.log('\nУправление подписками');
console.log('Слушателей до удаления: ' + emitter.listenerCount('tick'));

function testListener() {
    console.log('Тестовый слушатель');
}

emitter.on('test', testListener);
emitter.on('test', () => console.log('Второй тестовый'));
emitter.on('test', () => console.log('Третий тестовый'));

console.log('Слушателей test до удаления: ' + emitter.listenerCount('test'));

emitter.removeListener('test', testListener);
console.log('После removeListener: ' + emitter.listenerCount('test'));

emitter.removeAllListeners('test');
console.log('После removeAllListeners: ' + emitter.listenerCount('test'));

console.log('\nПорядок вызова');
emitter.on('order', () => console.log('1. Первый слушатель (группа 477)'));
emitter.on('order', () => console.log('2. Второй слушатель'));
emitter.on('order', () => console.log('3. Третий слушатель'));
emitter.emit('order');