const http = require('http');
const querystring = require('querystring');

const MAX_BODY = 1024 * 1024; // 1 MB

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;
        req.on('data', chunk => {
            size += chunk.length;
            if (size > MAX_BODY) {
                reject(new Error('413'));
                req.destroy();
                return;
            }
            body += chunk.toString();
        });
        req.on('end', () => resolve(body));
        req.on('error', err => reject(err));
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/echo') {
        try {
            const body = await readBody(req);
            const contentType = req.headers['content-type'] || '';
            console.log('Размер тела: ' + Buffer.byteLength(body) + ' байт');

            if (contentType.includes('application/json')) {
                try {
                    const data = JSON.parse(body);
                    data.group = '477';
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(data, null, 2));
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType || 'text/plain; charset=utf-8' });
                res.end(body);
            }
        } catch (err) {
            if (err.message === '413') {
                res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('413 Payload Too Large');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        }
    } else if (req.method === 'POST' && req.url === '/form') {
        try {
            const body = await readBody(req);
            const data = querystring.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data, null, 2));
        } catch (e) {
            res.writeHead(413);
            res.end('413 Payload Too Large');
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});