require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

(async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const students = db.collection('students');

    console.log('=== Курсоры ===');
    const cursor = students.find({});
    let count = 0;
    for await (const doc of cursor) {
        count++;
    }
    console.log('Итерация for await: получено ' + count + ' документов');

    console.log('\n=== Агрегации ===');
    const avgByGroup = await students.aggregate([
        { $group: { _id: '$group_name', avgGrade: { $avg: '$grade' } } },
        { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Средний балл по группам:');
    avgByGroup.forEach(g => console.log(' - ' + g._id + ': ' + g.avgGrade.toFixed(2)));

    const countByCourse = await students.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nКоличество по курсам:');
    countByCourse.forEach(c => console.log(' - ' + c._id + ' курс: ' + c.count));

    console.log('\n=== Индексы ===');
    await students.createIndex({ group_name: 1 });
    console.log('✔ Создан индекс: group_name_1');
    await students.createIndex({ group_name: 1, grade: -1 });
    console.log('✔ Создан составной индекс: group_name_1_grade_-1');
    await students.createIndex({ name: 'text' });
    console.log('✔ Создан текстовый индекс: name_text');

    console.log('\n=== explain без индекса ===');
    const explain1 = await students.find({ name: 'Иван' }).explain('executionStats');
    console.log('executionTimeMillis: ' + explain1.executionStats.executionTimeMillis);
    console.log('totalDocsExamined: ' + explain1.executionStats.totalDocsExamined);

    console.log('\n=== explain с текстовым индексом ===');
    const explain2 = await students.find({ $text: { $search: 'Иван' } }).explain('executionStats');
    console.log('executionTimeMillis: ' + explain2.executionStats.executionTimeMillis);
    console.log('totalDocsExamined: ' + explain2.executionStats.totalDocsExamined);

    console.log('\n=== Текстовый поиск ===');
    const found = await students.find({ $text: { $search: 'Иван' } }).toArray();
    console.log('Найдено: ' + found.length);

    await client.close();
})();