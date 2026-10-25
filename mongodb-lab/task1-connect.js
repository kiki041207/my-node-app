require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

(async () => {
    console.log('=== Подключение к MongoDB ===');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✔ Подключение установлено');

        const admin = client.db('admin');
        const buildInfo = await admin.command({ buildInfo: 1 });
        console.log('Версия MongoDB: ' + buildInfo.version);
        console.log('База данных: ' + dbName);

        const db = client.db(dbName);
        await db.command({ ping: 1 });
        console.log('✔ ping OK');

        const dbs = await admin.command({ listDatabases: 1 });
        console.log('\n=== Список БД ===');
        dbs.databases.forEach(d => console.log(' - ' + d.name));

        const collections = await db.listCollections().toArray();
        console.log('\nКоллекции в ' + dbName + ': ' + (collections.length === 0 ? '(пусто)' : collections.map(c => c.name).join(', ')));

        console.log('\n=== Heartbeat ===');
        client.on('serverHeartbeatSucceeded', () => {
            console.log('[HEARTBEAT] Успешно: ' + new Date().toISOString());
        });
        client.on('serverHeartbeatFailed', (e) => {
            console.log('[HEARTBEAT] Ошибка: ' + e.failure.message);
        });

        await new Promise(r => setTimeout(r, 3000));

        console.log('\n✔ Соединение стабильно');
    } catch (err) {
        console.error('✘ Ошибка подключения:', err.message);
    } finally {
        await client.close();
        console.log('✔ Соединение закрыто');
    }
})();