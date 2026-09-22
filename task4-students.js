

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3000;

let students = [
    { id: 1, name: 'Анна Сидорова', group: '477', course: 2 },
    { id: 2, name: 'Иван Петров', group: '477', course: 2 },
    { id: 3, name: 'Мария Иванова', group: '478', course: 3 }
];
let nextId = 4;


router.get('/students', async (ctx) => {
    const group = ctx.query.group;
    if (group) {
        ctx.body = students.filter(s => s.group === group);
    } else {
        ctx.body = students;
    }
});


router.get('/students/:id', async (ctx) => {
    const id = Number(ctx.params.id);
    const student = students.find(s => s.id === id);
    if (!student) {
        ctx.status = 404;
        ctx.body = { error: 'Студент не найден', status: 404 };
        return;
    }
    ctx.body = student;
});


router.post('/students', async (ctx) => {
    const { name, group, course } = ctx.request.body;
    if (!name || !group || !course) {
        ctx.status = 400;
        ctx.body = { error: 'Неверные данные', status: 400 };
        return;
    }
    const student = { id: nextId++, name, group, course };
    students.push(student);
    ctx.status = 201;
    ctx.body = student;
});


router.put('/students/:id', async (ctx) => {
    const id = Number(ctx.params.id);
    const student = students.find(s => s.id === id);
    if (!student) {
        ctx.status = 404;
        ctx.body = { error: 'Студент не найден', status: 404 };
        return;
    }
    const { name, group, course } = ctx.request.body;
    if (name) student.name = name;
    if (group) student.group = group;
    if (course) student.course = course;
    ctx.body = student;
});


router.delete('/students/:id', async (ctx) => {
    const id = Number(ctx.params.id);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = { error: 'Студент не найден', status: 404 };
        return;
    }
    students.splice(index, 1);
    ctx.body = { message: 'Студент удалён' };
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});