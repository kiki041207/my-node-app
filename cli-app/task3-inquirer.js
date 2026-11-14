const { program } = require('commander');
const inquirer = require('inquirer');
program
    .name('my-cli')
    .description('CLI-приложение с интерактивным режимом')
    .version('1.0.0');

program
    .command('init')
    .description('инициализация проекта')
    .option('--name <name>', 'название проекта')
    .option('--type <type>', 'тип проекта (web, cli, library, microservice)')
    .option('--typescript', 'добавить TypeScript')
    .option('--prettier', 'добавить Prettier')
    .option('--eslint', 'добавить ESLint')
    .option('--jest', 'добавить Jest')
    .option('--git', 'использовать Git')
    .option('--no-interactive', 'отключить интерактивный режим')
    .action(async (options) => {
        let name = options.name;
        let type = options.type;
        let opts = [];
        let useGit = options.git;

        if (options.typescript) opts.push('TypeScript');
        if (options.prettier) opts.push('Prettier');
        if (options.eslint) opts.push('ESLint');
        if (options.jest) opts.push('Jest');

        if (options.interactive === false) {
            if (!name || !type) {
                console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
                process.exit(1);
            }
        } else if (!name || !type) {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Введите название проекта:',
                    default: 'my-project'
                },
                {
                    type: 'list',
                    name: 'type',
                    message: 'Выберите тип проекта:',
                    choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис']
                },
                {
                    type: 'checkbox',
                    name: 'opts',
                    message: 'Выберите дополнительные опции:',
                    choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest']
                },
                {
                    type: 'confirm',
                    name: 'git',
                    message: 'Использовать Git?',
                    default: true
                },
                {
                    type: 'password',
                    name: 'token',
                    message: 'Введите токен доступа:',
                    mask: '*'
                }
            ]);
            name = answers.name;
            type = answers.type;
            opts = answers.opts;
            useGit = answers.git;
        }

        console.log('✔ Проект "' + name + '" успешно инициализирован!');
        console.log('Тип: ' + type);
        console.log('Опции: ' + (opts.length > 0 ? opts.join(', ') : 'нет'));
        console.log('Git: ' + (useGit ? 'да' : 'нет'));
        process.exit(0);
    });

program.parse(process.argv);