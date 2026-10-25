require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { MongoClient, ObjectId } = require('mongodb');

const app = new Koa();
const router = new Router();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let db, students;
const metrics = { queries: 0, avgTime: 0, errors: 0 };

(async () => {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    students = db.collection('students');

    await students.createIndex({ group_name: 1 });
    await students.createIndex({ name: 'text' });
    console.log('[INFO] MongoDB подключена: ' + dbName);

    app.use(bodyParser());
    app.use(async (ctx, next) => {
        const start = Date.now();
        try {
            await next();
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = { error: err.message };
            metrics.errors++;
        }
        const ms = Date.now() - start;
        metrics.queries++;
        metrics.avgTime = (metrics.avgTime + ms) / 2;
    });

    router.get('/api/students', async (ctx) => {
        const limit = Number(ctx.query.limit) || 10;
        const offset = Number(ctx.query.offset) || 0;
        const total = await students.countDocuments();
        const data = await students.find({}).skip(offset).limit(limit).toArray();
        ctx.body = { data, pagination: { total, limit, offset } };
    });

    router.get('/api/students/stats', async (ctx) => {
        const stats = await students.aggregate([
            { $group: { _id: null, total: { $sum: 1 }, averageGrade: { $avg: '$grade' } } }
        ]).toArray();
        const byGroup = await students.aggregate([
            { $group: { _id: '$group_name', count: { $sum: 1 } } }
        ]).toArray();
        ctx.body = { ...stats[0], byGroup };
    });

    router.get('/api/students/search', async (ctx) => {
        const q = ctx.query.q;
        if (!q) { ctx.status = 400; ctx.body = { error: 'Укажите q' }; return; }
        const found = await students.find({ $text: { $search: q } }).toArray();
        ctx.body = { found: found.length, data: found };
    });

    router.get('/api/students/:id', async (ctx) => {
        const doc = await students.findOne({ _id: new ObjectId(ctx.params.id) });
        if (!doc) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
        ctx.body = doc;
    });

    router.post('/api/students', async (ctx) => {
        const result = await students.insertOne(ctx.request.body);
        ctx.status = 201;
        ctx.body = { insertedId: result.insertedId };
    });

    router.put('/api/students/:id', async (ctx) => {
        const result = await students.updateOne({ _id: new ObjectId(ctx.params.id) }, { $set: ctx.request.body });
        ctx.body = result;
    });

    router.delete('/api/students/:id', async (ctx) => {
        const result = await students.deleteOne({ _id: new ObjectId(ctx.params.id) });
        ctx.body = result;
    });

    router.post('/api/students/batch', async (ctx) => {
        const arr = ctx.request.body;
        const session = client.startSession();
        try {
            session.startTransaction();
            const result = await students.insertMany(arr, { session });
            await session.commitTransaction();
            ctx.body = { inserted: Object.keys(result.insertedIds).length, transaction: 'committed' };
        } catch (err) {
            await session.abortTransaction();
            ctx.status = 400;
            ctx.body = { error: 'Откат', details: err.message };
        } finally {
            await session.endSession();
        }
    });

    router.get('/api/metrics', async (ctx) => {
        ctx.body = metrics;
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(3000, () => {
        console.log('[INFO] Сервер запущен на порту 3000');
    });
})();