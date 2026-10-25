const os = require('os');

function maskMac(mac) {
    const parts = mac.split(':');
    if (parts.length >= 3) {
        return parts[0] + ':' + parts[1] + ':' + parts[2] + ':****:****';
    }
    return '****';
}

console.log('=== Сетевые интерфейсы (группа 477) ===');

const interfaces = os.networkInterfaces();
let mainInterface = null;

for (const name in interfaces) {
    const addrs = interfaces[name];
    for (const addr of addrs) {
        console.log('\nИнтерфейс: ' + name);
        console.log('  IP: ' + addr.address);
        console.log('  MAC: ' + maskMac(addr.mac));
        console.log('  Тип: ' + (addr.internal ? 'внутренний' : 'внешний'));

        if (!addr.internal && addr.family === 'IPv4' && !mainInterface) {
            mainInterface = { name: name, address: addr.address };
        }
    }
}

if (mainInterface) {
    console.log('\n=== Основной интерфейс ===');
    console.log(mainInterface.name + ' (' + mainInterface.address + ')');
}

const userInfo = os.userInfo();
console.log('\n=== Информация о пользователе ===');
console.log('Имя: ' + userInfo.username);
console.log('UID: ' + userInfo.uid);
console.log('GID: ' + userInfo.gid);
console.log('Домашняя директория: ' + os.homedir());
console.log('Shell: ' + (userInfo.shell || 'не определён'));

console.log('\n=== Проверка root ===');
if (userInfo.username === 'root' || userInfo.uid === 0) {
    console.log('Пользователь: root (ДА)');
} else {
    console.log('Пользователь не root');
}