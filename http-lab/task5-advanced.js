const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');


const middlewares = [];

function use(fn) {
    middlewares.push(fn);
}


const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), '<h1>Статика работает!</h1>');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'style.css'), 'body { color: red; }');
}

const metrics = {
    total: 0,
    byMethod: {},
    byStatus: {},
    group: '477',
    startTime: Date.now()
};

function logAccess(method, url, status) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    fs.appendFileSync('access.log', '[' + now + '] [' + metrics.group + '] ' + method + ' ' + url + ' ' + status + '\n');
}


use((req, res, next) => {
    metrics.total++;
    metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;

    const origEnd = res.end.bind(res);
    res.end = (data) => {
        metrics.byStatus[res.statusCode] = (metrics.byStatus[res.statusCode] || 0) + 1;
        logAccess(req.method, req.url, res.statusCode);
        return origEnd(data);
    };

    res.setHeader('X-Group', metrics.group);
    next();
});

const server = http.createServer((req, res) => {
    let index = 0;

    function next() {
        if (index < middlewares.length) {
            const mw = middlewares[index++];
            try {
                mw(req, res, next);
            } catch (e) {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            handleRequest(req, res);
        }
    }

    next();
});

function handleRequest(req, res) {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;


    if (pathname === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            group: metrics.group,
            total: metrics.total,
            byMethod: metrics.byMethod,
            byStatus: metrics.byStatus,
            uptime: Math.floor((Date.now() - metrics.startTime) / 1000)
        }, null, 2));
        return;
    }


    if (req.url.startsWith('/static/')) {
       
        if (req.url.includes('..') || req.url.includes('%2e') || req.url.includes('%2E')) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
        }

        let filePath = pathname.replace('/static/', '');
        const fullPath = path.join(PUBLIC_DIR, filePath);
        
        if (!fs.existsSync(fullPath)) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const ext = path.extname(fullPath);
        const mime = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'text/plain';
        res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8', 'Cache-Control': 'max-age=60' });
        fs.createReadStream(fullPath).pipe(res);
        return;
    }


    if (pathname === '/stream') {
        const bigFile = path.join(__dirname, 'big-file.txt');
        if (!fs.existsSync(bigFile)) {
            let content = '';
            for (let i = 0; i < 100000; i++) content += 'Строка ' + i + '\n';
            fs.writeFileSync(bigFile, content);
        }
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        fs.createReadStream(bigFile).pipe(res);
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>HTTP-сервер (группа 477)</h1><p>Попробуйте: <a href="/metrics">/metrics</a>, <a href="/static/index.html">/static/index.html</a>, <a href="/stream">/stream</a></p>');
}

server.listen(3000, () => {
    console.log('[INFO] HTTP-сервер запущен на порту 3000');
    console.log('[INFO] Группа: 477');
});

process.on('SIGINT', () => {
    console.log('\nСервер остановлен');
    process.exit(0);
});