const EventEmitter = require('events');

class PluginManager extends EventEmitter {
    constructor() {
        super();
        this.on('newListener', (event, listener) => {
            console.log('[newListener] Добавлен слушатель "' + event + '"');
        });
        this.on('removeListener', (event, listener) => {
            console.log('[removeListener] Удалён слушатель "' + event + '"');
        });
    }

    registerPlugin(name) {
        console.log('\n[PLUGIN] Зарегистрирован: ' + name);
        this.emit('plugin:registered', name);
    }

    removePlugin(name) {
        this.emit('plugin:removed', name);
        console.log('[PLUGIN] Удалён: ' + name);
    }
}

const manager = new PluginManager();

function logListener(msg) {
    console.log('Лог: ' + msg);
}

manager.on('log', logListener);
manager.registerPlugin('LoggerPlugin');

manager.on('alert', (msg) => console.log('Алерт: ' + msg));
manager.registerPlugin('AlertPlugin');

manager.removeListener('log', logListener);
manager.removePlugin('LoggerPlugin');

console.log('\nДемонстрация утечки');
const leaky = new EventEmitter();
for (let i = 0; i < 10; i++) {
    leaky.on('test', () => {});
}
console.log('Слушателей до: ' + leaky.listenerCount('test'));

for (let i = 0; i < 1000; i++) {
    leaky.on('test', () => {});
}
console.log('Слушателей после добавления 1000: ' + leaky.listenerCount('test'));

leaky.removeAllListeners('test');
console.log('Слушателей после removeAllListeners: ' + leaky.listenerCount('test'));

console.log('\nАсинхронные слушатели');
const asyncEmitter = new EventEmitter();

asyncEmitter.on('async', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[477] async-слушатель завершён через 100ms');
});

console.log('[477] emit вызван (не ждёт async-слушатель)');
asyncEmitter.emit('async');