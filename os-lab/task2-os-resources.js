const os = require('os');

const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;

const totalGB = (totalMem / (1024 * 1024 * 1024)).toFixed(2);
const freeGB = (freeMem / (1024 * 1024 * 1024)).toFixed(2);
const usedPercent = ((usedMem / totalMem) * 100).toFixed(1);

console.log(' Ресурсы системы (группа 477) ');
console.log('Всего памяти: ' + totalGB + ' ГБ');
console.log('Свободно: ' + freeGB + ' ГБ (' + usedPercent + '% использовано)');
console.log('Группа: 477');

if (freeMem / totalMem < 0.1) {
    console.log('ВНИМАНИЕ: Мало свободной памяти!');
} else {
    console.log('Память в норме');
}

const userInfo = os.userInfo();
console.log('\n Информация о пользователе ');
console.log('Имя пользователя: ' + userInfo.username);
console.log('Домашняя директория: ' + os.homedir());
console.log('Платформа: ' + os.platform());

const cpus = os.cpus();
console.log('\n Процессор ');
console.log('Модель: ' + cpus[0].model);
console.log('Количество ядер: ' + cpus.length);

console.log('\n Средняя загрузка ');
const loadAvg = os.loadavg();
console.log('За последнюю минуту: ' + loadAvg[0].toFixed(2));
console.log('За 5 минут: ' + loadAvg[1].toFixed(2));
console.log('За 15 минут: ' + loadAvg[2].toFixed(2));
