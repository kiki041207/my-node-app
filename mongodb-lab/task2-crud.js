require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

(async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const students = db.collection('students');

    await students.deleteMany({});
    await students.createIndex({ group_name: 1 });

    console.log('=== INSERT ===');
    const r1 = await students.insertOne({ name: 'Иван', group_name: 'ББМО-01-23', course: 2, grade: 4.5, created_at: new Date() });
    console.log('✔ Вставлен: insertedId=' + r1.insertedId);

    const r2 = await students.insertMany([
        { name: 'Мария', group_name: 'ББМО-01-23', course: 2, grade: 3.8, created_at: new Date() },
        { name: 'Петр', group_name: 'ББМО-01-23', course: 3, grade: 4.2, created_at: new Date() },
        { name: 'Анна', group_name: 'ББМО-02-23', course: 1, grade: 4.9, created_at: new Date() }
    ]);
    console.log('✔ Вставлено 3 документа: insertedIds=' + Object.keys(r2.insertedIds).length);

    console.log('\n=== SELECT ===');
    const all = await students.find({}).toArray();
    console.log('Все документы (' + all.length + '):');
    all.forEach(d => console.log(' - id=' + d._id + ', name=' + d.name + ', group=' + d.group_name + ', grade=' + d.grade));

    console.log('\nС фильтром по группе:');
    const filtered = await students.find({ group_name: 'ББМО-01-23' }).toArray();
    filtered.forEach(d => console.log(' - ' + d.name + ', ' + d.group_name + ', ' + d.grade));

    console.log('\nС проекцией (name, grade):');
    const projected = await students.find({}, { projection: { name: 1, grade: 1, _id: 0 } }).toArray();
    projected.forEach(d => console.log(' - ' + d.name + ': ' + d.grade));

    console.log('\n=== UPDATE ===');
    const u1 = await students.updateOne({ name: 'Иван' }, { $set: { grade: 5.0 } });
    console.log('✔ updateOne: matchedCount=' + u1.matchedCount + ', modifiedCount=' + u1.modifiedCount);

    const u2 = await students.updateMany({ group_name: 'ББМО-01-23' }, { $inc: { course: 1 } });
    console.log('✔ updateMany (course+1): matchedCount=' + u2.matchedCount + ', modifiedCount=' + u2.modifiedCount);

    console.log('\n=== DELETE ===');
    const d1 = await students.deleteOne({ name: 'Анна' });
    console.log('✔ deleteOne: deletedCount=' + d1.deletedCount);

    const d2 = await students.deleteMany({ grade: { $lt: 3 } });
    console.log('✔ deleteMany (grade<3): deletedCount=' + d2.deletedCount);

    await client.close();
})();