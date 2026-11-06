const os = require('os');
const fs = require('fs');

function getCpuLoad() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length
    };
}

let startMeasure = getCpuLoad();
let warnings = 0;

function formatTime() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
}

function logWarning(msg) {
    const line = '[' + formatTime() + '] [477] Предупреждение: ' + msg + '\n';
    fs.appendFileSync('monitor.log', line);
}

console.log('Мониторинг (группа 477). Ctrl+C для выхода.\n');

const interval = setInterval(() => {
    const endMeasure = getCpuLoad();
    const idleDiff = endMeasure.idle - startMeasure.idle;
    const totalDiff = endMeasure.total - startMeasure.total;
    const cpuUsage = (100 - (100 * idleDiff / totalDiff)).toFixed(1);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);
    const freeGB = (freeMem / (1024 * 1024 * 1024)).toFixed(2);

    let status = 'норма';
    if (cpuUsage > 80) {
        status = 'КРИТИЧНО';
        warnings++;
        logWarning('CPU перегружен: ' + cpuUsage + '%');
    } else if (cpuUsage > 50) {
        status = 'предупреждение';
        warnings++;
        logWarning('Высокая загрузка CPU: ' + cpuUsage + '%');
    }

    if (freeMem / totalMem < 0.1) {
        status += ', мало памяти';
        warnings++;
        logWarning('Мало свободной памяти: ' + freeGB + ' ГБ');
    }

    console.log('CPU: ' + cpuUsage + '% | RAM: ' + usedPercent + '% (' + freeGB + ' ГБ свободно) | ' + status);

    startMeasure = endMeasure;
}, 2000);

process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\nМониторинг остановлен. Предупреждений: ' + warnings);
    process.exit(0);
});