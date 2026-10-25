const fs = require('fs');
const { pipeline, Transform } = require('stream');


fs.writeFileSync('input.txt', 'Привет, это тестовый файл для потоков!');

console.log('== Демонстрация pipe() ==');
console.log('Чтение: input.txt');
console.log('Запись: output-pipe.txt');

const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output-pipe.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
    console.log('✔ Копирование завершено');
    const stats = fs.statSync('output-pipe.txt');
    console.log('Размер: ' + stats.size + ' байт\n');

    console.log('== Демонстрация pipe() с ошибкой ==');
    console.log('Чтение: missing.txt');
    const badRead = fs.createReadStream('missing.txt');
    const badWrite = fs.createWriteStream('output-bad.txt');

    badRead.on('error', (err) => {
        console.error('✖ Ошибка: ' + err.message);
        console.log('△ Внимание: pipe() не закрыл целевой поток!');
        console.log('△ Возможна утечка памяти.\n');
        
       
        testPipeline();
    });

    badRead.pipe(badWrite);
});

function testPipeline() {
    console.log('== Демонстрация pipeline() ==');
    console.log('Чтение: input.txt');
    console.log('Запись: output-pipeline.txt');

    pipeline(
        fs.createReadStream('input.txt'),
        fs.createWriteStream('output-pipeline.txt'),
        (err) => {
            if (err) {
                console.error('Ошибка:', err.message);
            } else {
                console.log('✔ Копирование завершено\n');
                testPipelineError();
            }
        }
    );
}

function testPipelineError() {
    console.log('== Демонстрация pipeline() с ошибкой ==');
    console.log('Чтение: missing.txt');

    pipeline(
        fs.createReadStream('missing.txt'),
        fs.createWriteStream('output-bad-pipeline.txt'),
        (err) => {
            if (err) {
                console.error('✖ Ошибка: ' + err.message);
                console.log('✔ Все потоки автоматически закрыты');
                console.log('✔ Утечек нет\n');
                testChain();
            }
        }
    );
}

function testChain() {
    console.log('== Цепочка потоков ==');
    console.log('input.txt → uppercase → reverse → output-chain.txt');

    const upperCase = new Transform({
        transform(chunk, encoding, callback) {
            callback(null, chunk.toString().toUpperCase());
        }
    });

    const reverse = new Transform({
        transform(chunk, encoding, callback) {
            const reversed = chunk.toString().split('').reverse().join('');
            callback(null, reversed);
        }
    });

    pipeline(
        fs.createReadStream('input.txt'),
        upperCase,
        reverse,
        fs.createWriteStream('output-chain.txt'),
        (err) => {
            if (err) {
                console.error('Ошибка:', err.message);
            } else {
                console.log('\n✔ Обработка завершена');
                console.log('Содержимое output-chain.txt:');
                console.log(fs.readFileSync('output-chain.txt', 'utf8'));
            }
        }
    );
}