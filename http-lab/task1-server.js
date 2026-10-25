const http = require('http');

function logRequest(method, url, status) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('[' + now + '] ' + method + ' ' + url + ' ' + status);
}

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Главная страница</h1>');
        logRequest('GET', '/', 200);
    } else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>О сайте</h1>');
        logRequest('GET', '/about', 200);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 — страница не найдена</h1>');
        logRequest('GET', req.url, 404);
    }
});

server.listen(3000, () => {
    console.log('HTTP-сервер запущен на порту 3000');
});