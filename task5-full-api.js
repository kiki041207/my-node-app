const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const titles = ['Война и мир', 'Анна Каренина', 'Преступление и наказание', 'Идиот', 'Мастер и Маргарита', '1984', 'Скотный двор', 'Гарри Поттер', 'Властелин колец', 'Хоббит'];
const authors = ['Толстой', 'Достоевский', 'Булгаков', 'Оруэлл', 'Роулинг', 'Толкин', 'Пушкин', 'Лермонтов', 'Гоголь', 'Чехов'];
const genres = ['роман', 'фэнтези', 'антиутопия', 'поэма', 'рассказ'];

let books = [];
for (let i = 1; i <= 100; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)] + ' (том ' + i + ')';
    const author = authors[Math.floor(Math.random() * authors.length)];
    const year = 1800 + Math.floor(Math.random() * 200);
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const isbn = '978-' + Math.floor(Math.random() * 1000000000);
    const available = Math.random() > 0.3;
    books.push({ id: i, title, author, year, genre, isbn, available });
}
let nextId = 101;

app.get('/api/books', (req, res) => {
    let result = books.slice();

    if (req.query.author) {
        result = result.filter(b => b.author.toLowerCase().includes(req.query.author.toLowerCase()));
    }
    if (req.query.genre) {
        result = result.filter(b => b.genre === req.query.genre);
    }
    if (req.query.available === 'true') {
        result = result.filter(b => b.available === true);
    }
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        result = result.filter(b =>
            b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s)
        );
    }

    if (req.query.sort) {
        const sort = req.query.sort;
        if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === '-title') result.sort((a, b) => b.title.localeCompare(a.title));
        else if (sort === 'year') result.sort((a, b) => a.year - b.year);
        else if (sort === '-year') result.sort((a, b) => b.year - a.year);
    }

    const total = result.length;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    result = result.slice(offset, offset + limit);

    res.json({ total, page, limit, books: result });
});

app.get('/api/books/available', (req, res) => {
    res.json(books.filter(b => b.available));
});

app.get('/api/books/recommendations', (req, res) => {
    const genre = req.query.genre;
    if (!genre) {
        return res.status(400).json({ error: 'Укажите genre', status: 400 });
    }
    const result = books.filter(b => b.genre === genre).slice(0, 5);
    res.json(result);
});

app.get('/api/books/export', (req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="books.json"');
    res.json(books);
});

app.get('/api/books/stats', (req, res) => {
    const total = books.length;
    const byAuthor = {};
    const byGenre = {};
    let oldestYear = Infinity;
    let newestYear = -Infinity;

    books.forEach(b => {
        byAuthor[b.author] = (byAuthor[b.author] || 0) + 1;
        byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
        if (b.year < oldestYear) oldestYear = b.year;
        if (b.year > newestYear) newestYear = b.year;
    });

    res.json({ total, byAuthor, byGenre, oldestYear, newestYear });
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    res.json(book);
});

app.post('/api/books', (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Неверные данные', status: 400 });
    }
    const isbn = '978-' + Math.floor(Math.random() * 1000000000);
    const book = { id: nextId++, title, author, year, genre: genre || 'неизвестно', isbn, available: true };
    books.push(book);
    res.status(201).json(book);
});

app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    const { title, author, year, genre, available } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (year) book.year = year;
    if (genre) book.genre = genre;
    if (typeof available === 'boolean') book.available = available;
    res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    books.splice(index, 1);
    res.json({ message: 'Книга удалена' });
});

app.post('/api/books/:id/reviews', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    const { text, rating } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Текст отзыва обязателен', status: 400 });
    }
    if (!book.reviews) book.reviews = [];
    book.reviews.push({ text, rating: rating || 5, date: new Date().toISOString() });
    res.status(201).json(book.reviews);
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
    console.log('Сгенерировано книг: ' + books.length);
});