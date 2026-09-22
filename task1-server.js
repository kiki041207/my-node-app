

const Koa = require('koa');
const app = new Koa();

const PORT = 3000;

app.use(async (ctx) => {
    const now = new Date().toLocaleString('ru-RU');
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = `
        <h1>Лабораторная работа №15</h1>
        <p>Студент: Булыга Александра</p>
        <p>Группа: 477</p>
        <p>Дата и время: ${now}</p>
        <p>Добро пожаловать!</p>
    `;
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});