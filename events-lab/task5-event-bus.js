const EventEmitter = require('events');
const http = require('http');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.listenersMap = {};
        this.metrics = { events: {}, total: 0 };
        this.anyListeners = [];

        this.originalEmit = this.emit.bind(this);

        this.emit = (event, ...args) => {
            if (event === 'newListener' || event === 'removeListener') {
                return this.originalEmit(event, ...args);
            }

            this.metrics.total++;
            this.metrics.events[event] = (this.metrics.events[event] || 0) + 1;

            if (this.anyListeners.length > 0) {
                this.anyListeners.forEach(fn => {
                    try {
                        fn(event, args);
                    } catch (e) {
                        console.error('Ошибка в wildcard: ' + e.message);
                    }
                });
            }

            if (this.listenersMap[event]) {
                this.listenersMap[event].sort((a, b) => b.priority - a.priority);
                this.listenersMap[event].forEach(item => {
                    try {
                        item.listener(...args);
                    } catch (e) {
                        console.error('[ERROR] [477] Ошибка в слушателе "' + event + '": ' + e.message);
                    }
                });
            }

            return true;
        };
    }

    on(event, listener, priority = 0) {
        if (!this.listenersMap[event]) this.listenersMap[event] = [];
        this.listenersMap[event].push({ listener, priority });
        return this;
    }

    once(event, listener, priority = 0) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        wrapper.original = listener;
        return this.on(event, wrapper, priority);
    }

    onAny(listener) {
        this.anyListeners.push(listener);
    }

    off(event, listener) {
        if (this.listenersMap[event]) {
            this.listenersMap[event] = this.listenersMap[event].filter(
                item => item.listener !== listener && item.listener.original !== listener
            );
        }
    }

    getMetrics() {
        return {
            group: '477',
            events: this.metrics.events,
            total: this.metrics.total
        };
    }
}

const bus = new EventBus();

console.log('=== EventBus (группа 477) ===\n');

console.log('--- Приоритеты ---');
bus.on('greet', () => console.log('[priority 10] Высокий приоритет'), 10);
bus.on('greet', () => console.log('[priority 5] Средний приоритет'), 5);
bus.on('greet', () => console.log('[priority 0] Низкий приоритет'), 0);
bus.emit('greet', 'Иван');

console.log('\n--- Wildcard ---');
bus.onAny((event, args) => {
    console.log('[onAny] Событие "' + event + '" с аргументами: ' + JSON.stringify(args));
});
bus.emit('greet', 'Иван');
bus.emit('info', '477');

console.log('\n--- Once-кэш ---');
let onceCalled = 0;
bus.once('tick', () => { onceCalled++; console.log('[tick] Вызов ' + onceCalled); });
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log('once-слушатель вызван: ' + onceCalled + ' раз');

console.log('\n--- Обработка ошибок ---');
bus.on('test', () => { throw new Error('тестовая ошибка'); }, 10);
bus.on('test', () => { throw new Error('вторая ошибка'); }, 5);
bus.emit('test');

console.log('\n--- Метрики ---');
const m = bus.getMetrics();
for (const ev in m.events) {
    console.log(ev + ': ' + m.events[ev] + ' вызовов');
}
console.log('Всего событий: ' + m.total);

const server = http.createServer((req, res) => {
    bus.emit('request', req.url);
    if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(bus.getMetrics(), null, 2));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('OK');
    }
});

server.listen(3000, () => {
    console.log('\nHTTP-сервер запущен на порту 3000');
    console.log('Откройте http://localhost:3000/metrics');
    bus.emit('server:started', 3000);
});