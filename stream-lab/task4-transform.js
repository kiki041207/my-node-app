const { Transform, Readable, Writable } = require('stream');


const upperCase = new Transform({
    transform(chunk, encoding, callback) {
        const result = '[477] ' + chunk.toString().toUpperCase();
        callback(null, result + '\n');
    }
});


const jsonParser = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        try {
            const obj = JSON.parse(chunk.toString());
            callback(null, obj);
        } catch (e) {
            callback(e);
        }
    }
});

const filter = new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
        if (obj.group === '477') {
            callback(null, obj);
        } else {
            callback(null, null); // отбрасываем
        }
    }
});


const writable = new Writable({
    objectMode: true,
    write(obj, encoding, callback) {
        console.log('Принят объект: ' + JSON.stringify(obj));
        callback();
    }
});


const source = Readable.from([
    'привет',
    'мир'
]);

console.log('=== UpperCaseTransform ===');
source.pipe(upperCase).pipe(process.stdout);


setTimeout(() => {
    console.log('\n=== JsonParserTransform + Filter + Writable (Object Mode) ===');
    const jsonSource = Readable.from([
        '{"name":"Иван","group":"477"}',
        '{"name":"Мария","group":"477"}',
        '{"name":"Петр","group":"478"}'
    ]);

    jsonSource
        .pipe(jsonParser)
        .pipe(filter)
        .pipe(writable);


    setTimeout(async () => {
        console.log('\n=== Асинхронный итератор ===');
        const iterSource = Readable.from(['один', 'два', 'три']);
        for await (const chunk of iterSource) {
            console.log('Итератор: ' + chunk.toString());
        }
        console.log('Готово');
    }, 500);
}, 500);