const http = require('http');


function calculatePi(digits) {
    let pi = 0;
    for (let k = 0; k < 1000000; k++) {
        pi += (k % 2 === 0 ? 1 : -1) / (2 * k + 1);
    }
    pi *= 4;
    return pi.toFixed(digits); // digits - ваш номер журнала (2)
}

const fio = "Булыга Александра Витальевна";
const group = "477";
const journalNumber = 2; 

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
   
    res.end(`<h1>${fio}</h1><p>Группа: ${group}</p><p>Число Пи (${journalNumber} знака): ${calculatePi(journalNumber)}</p>`);
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});