const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');

program
    .name('my-cli')
    .description('CLI-приложение с форматированным выводом')
    .version('1.0.0');

program
    .command('process')
    .description('обработка файлов')
    .option('--files <files...>', 'список файлов')
    .action(async (options) => {
        const files = options.files || [];
        if (files.length === 0) {
            console.error(chalk.red('Ошибка: укажите файлы через --files'));
            process.exit(1);
        }

        const spinner = ora('Проверка файлов...').start();
        await new Promise(resolve => setTimeout(resolve, 1000));
        spinner.succeed(chalk.green('Файлы найдены (' + files.length + ' шт.)'));

        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(files.length, 0);
        for (let i = 0; i < files.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            bar.update(i + 1);
        }
        bar.stop();

        console.log(chalk.green('✔ Обработка завершена'));
        console.log(chalk.blue('Результат сохранён: output.json'));
        process.exit(0);
    });

program.parse(process.argv);