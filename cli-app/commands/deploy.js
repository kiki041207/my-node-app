const inquirer = require('inquirer');

async function deployCommand(options) {
    if (!options.force) {
        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Вы собираетесь развернуть проект. Продолжить?',
                default: false
            }
        ]);
        if (!answer.confirm) {
            console.log('Отменено');
            return;
        }
    }
    console.log('✔ Развёрнуто успешно');
    console.log('URL: https://my-app.example.com');
}

module.exports = { deployCommand };