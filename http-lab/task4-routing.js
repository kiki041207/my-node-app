const http = require('http');
const url = require('url');

let students = [
    { id: 1, name: 'Иван', group: '477' },
    { id: 2, name: 'Мария', group: '477' }
];
let nextId = 3;

function logRequest(method, path, status) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log('[' + now + '] [477] ' + method + ' ' + path + ' ' + status);
}

function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const path = parsed.pathname;
    const query = parsed.query;
    const method = req.method;

    if (method === 'GET' && path === '/api/students') {
        let result = students;
        if (query.group) {
            result = students.filter(s => s.group === query.group);
        }
        sendJSON(res, 200, result);
        logRequest(method, req.url, 200);

    } else if (method === 'GET' && path.match(/^\/api\/students\/\d+$/)) {
        const id = Number(path.split('/')[3]);
        const student = students.find(s => s.id === id);
        if (!student) {
            sendJSON(res, 404, { error: 'Not found' });
            logRequest(method, req.url, 404);
        } else {
            sendJSON(res, 200, student);
            logRequest(method, req.url, 200);
        }

    } else if (method === 'POST' && path === '/api/students') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const student = { id: nextId++, name: data.name, group: data.group || '477' };
                students.push(student);
                sendJSON(res, 201, student);
                logRequest(method, req.url, 201);
            } catch (e) {
                sendJSON(res, 400, { error: 'Invalid JSON' });
                logRequest(method, req.url, 400);
            }
        });

    } else if (method === 'PUT' && path.match(/^\/api\/students\/\d+$/)) {
        const id = Number(path.split('/')[3]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const student = students.find(s => s.id === id);
            if (!student) {
                sendJSON(res, 404, { error: 'Not found' });
                logRequest(method, req.url, 404);
                return;
            }
            try {
                const data = JSON.parse(body);
                if (data.name) student.name = data.name;
                sendJSON(res, 200, student);
                logRequest(method, req.url, 200);
            } catch (e) {
                sendJSON(res, 400, { error: 'Invalid JSON' });
                logRequest(method, req.url, 400);
            }
        });

    } else if (method === 'DELETE' && path.match(/^\/api\/students\/\d+$/)) {
        const id = Number(path.split('/')[3]);
        const index = students.findIndex(s => s.id === id);
        if (index === -1) {
            sendJSON(res, 404, { error: 'Not found' });
            logRequest(method, req.url, 404);
        } else {
            students.splice(index, 1);
            sendJSON(res, 200, { deleted: true, id: id });
            logRequest(method, req.url, 200);
        }

    } else {
        sendJSON(res, 405, { error: 'Method Not Allowed' });
        logRequest(method, req.url, 405);
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});