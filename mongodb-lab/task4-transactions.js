require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

(async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const students = db.collection('students');

    await students.deleteMany({});

    console.log('=== Транзакция (успех) ===');
    const session = client.startSession();
    try {
        session.startTransaction();
        console.log('[BEGIN] Транзакция начата');

        await students.insertOne({ name: 'Иван', group_name: 'ББМО-01-23', grade: 4.5 }, { session });
        await students.insertOne({ name: 'Мария', group_name: 'ББМО-01-23', grade: 3.8 }, { session });
        await students.updateOne({ name: 'Иван' }, { $set: { grade: 4.8 } }, { session });

        await session.commitTransaction();
        console.log('[COMMIT] Транзакция зафиксирована');
        console.log('✔ Данные сохранены');
    } catch (err) {
        await session.abortTransaction();
        console.log('[ABORT] Ошибка: ' + err.message);
    } finally {
        await session.endSession();
    }

    console.log('\n=== Транзакция (откат) ===');
    const session2 = client.startSession();
    try {
        session2.startTransaction();
        console.log('[BEGIN] Транзакция начата');
        await students.insertOne({ _id: 'fixed_id', name: 'Петр', group_name: 'ББМО-01-23' }, { session: session2 });
        await students.insertOne({ _id: 'fixed_id', name: 'Дубль', group_name: 'ББМО-01-23' }, { session: session2 });
        await session2.commitTransaction();
        console.log('[COMMIT] Успех');
    } catch (err) {
        await session2.abortTransaction();
        console.log('[ABORT] Транзакция отменена: ' + err.message);
    } finally {
        await session2.endSession();
    }

    const total = await students.countDocuments();
    console.log('Проверка: студентов в БД = ' + total);

    console.log('\n=== Change Streams ===');
    const changeStream = students.watch();
    console.log('[WATCH] Отслеживание коллекции students');

    changeStream.on('change', (change) => {
        console.log('[CHANGE] ' + change.operationType + ': ' + JSON.stringify(change.fullDocument || change.documentKey));
    });

    await students.insertOne({ name: 'Анна', group_name: 'ББМО-01-23', grade: 4.7 });
    await new Promise(r => setTimeout(r, 500));
    await students.updateOne({ name: 'Анна' }, { $set: { grade: 5.0 } });
    await new Promise(r => setTimeout(r, 500));
    await students.deleteOne({ name: 'Анна' });
    await new Promise(r => setTimeout(r, 1000));

    await changeStream.close();
    console.log('[WATCH] Stream закрыт');

    await client.close();
})();