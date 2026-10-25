#!/usr/bin/env node
const { program } = require('commander');
const { initCommand } = require('../commands/init');
const { buildCommand } = require('../commands/build');
const { testCommand } = require('../commands/test');
const { deployCommand } = require('../commands/deploy');

program
    .name('my-cli')
    .description('Полноценное CLI-приложение')
    .version('1.0.0');

program
    .command('init')
    .option('--name <name>', 'название проекта', 'my-app')
    .option('--type <type>', 'тип проекта', 'cli')
    .action(initCommand);

program
    .command('build')
    .action(buildCommand);

program
    .command('test')
    .action(testCommand);

program
    .command('deploy')
    .option('--env <env>', 'окружение', 'production')
    .option('--force', 'без подтверждения')
    .action(deployCommand);

process.on('uncaughtException', (err) => {
    if (process.env.NODE_ENV === 'production') {
        console.error('Ошибка: ' + err.message);
    } else {
        console.error(err.stack);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Необработанная ошибка: ' + reason);
    process.exit(1);
});

program.parse(process.argv);