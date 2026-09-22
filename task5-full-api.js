

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3000;


const firstNames = ['Анна', 'Иван', 'Мария', 'Петр', 'Ольга', 'Сергей', 'Елена', 'Дмитрий', 'Наталья', 'Алексей'];
const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов'];
const groups = ['477', '478', '479', '480'];

let students = [];
for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const group = groups[Math.floor(Math.random() * groups.length)];
    const course = Math.floor(Math.random() * 4) + 1;
    students.push({
        id: i,
        name: firstName + ' ' + lastName,
        group: group,
        course: course
    });
}
let nextId = 51;

router.get('/students', async (ctx) => {
    let result = students.slice();

   
    if (ctx.query.search) {
        const search = ctx.query.search.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(search));
    }

    // Фильтр по группе
    if (ctx.query.group) {
        result = result.filter(s => s.group === ctx.query.group);
    }


    if (ctx.query.sort) {
        const sort = ctx.query.sort;
        if (sort === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === '-name') {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sort === 'course') {
            result.sort((a, b) => a.course - b.course);
        }
    }

    const total = result.length;

   
    const limit = Number(ctx.query.limit) || 10;
    const offset = Number(ctx.query.offset) || 0;
    result = result.slice(offset, offset + limit);

    ctx.body = {
        total: total,
        limit: limit,
        offset: offset,
        students: result
    };
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
    console.log('Сгенерировано студентов: ' + students.length);
});