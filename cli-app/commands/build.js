const { buildProject } = require('../services/build');

function buildCommand() {
    const result = buildProject();
    if (result.success) {
        console.log('✔ ' + result.message);
        console.log('Результат: ' + result.output);
    }
}

module.exports = { buildCommand };