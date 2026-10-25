require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const { MongoClient, ObjectId } = require('mongodb');

const app = new Koa();
const router = new Router();
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const GROUP = process.env.GROUP;

let db, users;

(async () => {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    users = db.collection('users');

    app.use(helmet());
    app.use(cors());
    app.use(bodyParser());
    app.use(async (ctx, next) => {
        ctx.set('X-Group', GROUP);
        const start = Date.now();
        try { await next(); }
        catch (err) {
            ctx.status = err.status || 500;
            ctx.body = { error: err.message };
        }
        console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - start}ms`);
    });

    router.get('/api/users', async (ctx) => {
        const data = await users.find({}).toArray();
        ctx.body = { data };
    });

    router.get('/api/users/:id', async (ctx) => {
        const doc = await users.findOne({ _id: new ObjectId(ctx.params.id) });
        if (!doc) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
        ctx.body = { data: doc };
    });

    router.post('/api/users', async (ctx) => {
        const { name, email, group_name, age, course } = ctx.request.body;
        const errors = [];
        if (!name || name.length < 2) errors.push({ field: 'name', message: 'минимум 2 символа' });
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) errors.push({ field: 'email', message: 'неверный формат' });
        if (errors.length > 0) { ctx.status = 400; ctx.body = { error: 'Validation failed', details: errors }; return; }

        const exists = await users.findOne({ email });
        if (exists) { ctx.status = 409; ctx.body = { error: 'Email уже существует' }; return; }

        const result = await users.insertOne({ name, email, group_name: group_name || GROUP, age, course, created_at: new Date() });
        ctx.status = 201;
        ctx.body = { data: { _id: result.insertedId, name, email, group_name, age, course } };
    });

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(process.env.PORT || 3000, () => {
        console.log(`[INFO] Сервер на порту ${process.env.PORT || 3000}`);
    });
})();