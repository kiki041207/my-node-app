const { Readable, Transform, Writable, pipeline } = require('stream');
const fs = require('fs');

class StudentSource extends Readable {
    constructor(total) {
        super({ objectMode: true });
        this.total = total;
        this.count = 0;
        this.generated = 0;
    }
    _read() {
        if (this.count >= this.total) {
            this.push(null);
            return;
        }
        const id = this.count + 1;
        const student = {
            id: id,
            name: 'Студент ' + id,
            group: id % 5 === 0 ? '478' : '477',
            course: (id % 4) + 1,
            grade: (id % 5) + 1
        };
        this.count++;
        this.generated++;
        this.push(student);
    }
}

const validate = new Transform({
    objectMode: true,
    transform(student, encoding, callback) {
        if (!student.name || student.grade < 1) {
            fs.appendFileSync('errors.log', '[' + new Date().toISOString() + '] [477] Ошибка валидации: id=' + student.id + '\n');
            return callback(null, null);
        }
        callback(null, student);
    }
});

const enrich = new Transform({
    objectMode: true,
    transform(student, encoding, callback) {
        student.averageGrade = (student.grade * 0.8 + 0.5).toFixed(1);
        callback(null, student);
    }
});

const filter = new Transform({
    objectMode: true,
    transform(student, encoding, callback) {
        if (student.grade > 3) {
            callback(null, student);
        } else {
            callback(null, null);
        }
    }
});

const format = new Transform({
    objectMode: true,
    transform(student, encoding, callback) {
        const line = [student.id, student.name, student.group, student.course, student.grade, student.averageGrade].join(',');
        callback(null, line + '\n');
    }
});

let written = 0;
const startTime = Date.now();

const dest = new Writable({
    highWaterMark: 16,
    write(chunk, encoding, callback) {
        written++;
        if (written % 1000 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            console.log('[PROGRESS] ' + Math.round((written / 7512) * 100) + '% | ' + written + '/7512 | ' + Math.round(written / elapsed) + ' записей/сек');
        }
        setTimeout(callback, 1);
    }
});
const header = '\uFEFFid,name,group,course,grade,averageGrade\n';
fs.writeFileSync('students.csv', header);
const destFile = fs.createWriteStream('students.csv', { flags: 'a' });

console.log('=== Конвейер обработки данных (группа 477) ===');
console.log('Источник: 10000 студентов');
console.log('Фильтр: оценка > 3\n');

const source = new StudentSource(10000);

pipeline(
    source,
    validate,
    enrich,
    filter,
    format,
    destFile,
    (err) => {
        if (err) {
            console.error('Ошибка:', err.message);
        } else {
            const time = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log('\n=== Результаты ===');
            console.log('Всего сгенерировано: ' + source.generated);
            console.log('Записано в CSV: ' + written);
            console.log('Время выполнения: ' + time + ' сек');
            const stats = fs.statSync('students.csv');
            console.log('Файл: students.csv (' + (stats.size / 1024 / 1024).toFixed(2) + ' МБ)');
        }
    }
);