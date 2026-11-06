const { runTests } = require('../services/test');

function testCommand() {
    const result = runTests();
    console.log('✔ Пройдено: ' + result.passed + '/' + result.total + ' тестов');
    console.log('✔ Покрытие: ' + result.coverage + '%');
}

module.exports = { testCommand };