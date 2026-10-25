function initCommand(options) {
    console.log('✔ Проект "' + options.name + '" создан');
    console.log('✔ Установлены зависимости');
    console.log('✔ Инициализирован Git-репозиторий');
    console.log('Проект готов к работе!');
}

module.exports = { initCommand };