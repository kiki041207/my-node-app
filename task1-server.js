const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    const now = new Date().toLocaleString('ru-RU');
    res.send(
        '<h1>Лабораторная работа №16</h1>' +
        '<p>Студент: Булыга Александра</p>' +
        '<p>Группа: 477</p>' +
        '<p>Дата и время: ' + now + '</p>' +
        '<p>Добро пожаловать!</p>' +
        '<h3>Доступные маршруты:</h3>' +
        '<ul>' +
            '<li><a href="/">/</a> — главная</li>' +
            '<li><a href="/about">/about</a> — о разработчике</li>' +
            '<li><a href="/contacts">/contacts</a> — контакты</li>' +
        '</ul>'
    );
});

app.get('/about', (req, res) => {
    res.send(
        '<h1>О разработчике</h1>' +
        '<p>Студент: Булыга Александра Витальевна</p>' +
        '<p>Группа: 477</p>' +
        '<p>Лабораторная работа №16: Express.js</p>'
    );
});

app.get('/contacts', (req, res) => {
    res.send(
        '<h1>Контакты</h1>' +
        '<p>Email: likeroman803@gmail.com</p>' +
        '<p>GitHub: kiki041207</p>'
    );
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});