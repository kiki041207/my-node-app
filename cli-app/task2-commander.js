const { program } = require('commander');

program
    .name('my-cli')
    .description('CLI-приложение для лабораторной работы №17')
    .version('1.0.0');

program
    .command('generate')
    .description('сгенерировать отчёт')
    .option('-t, --type <type>', 'тип отчёта (по умолчанию: "html")', 'html')
    .option('-o, --output <path>', 'путь для сохранения')
    .option('-f, --force', 'перезаписать существующий файл')
    .option('--dry-run', 'показать что будет сделано без выполнения')
    .option('-v, --verbose', 'подробный вывод')
    .action((options) => {
        const validTypes = ['html', 'pdf', 'json', 'csv'];
        if (!validTypes.includes(options.type)) {
            console.error('Ошибка: недопустимый тип отчёта "' + options.type + '".');
            console.error('Допустимые значения: ' + validTypes.join(', '));
            process.exit(1);
        }

        const output = options.output || 'output.' + options.type;

        if (options.verbose) {
            console.log('[VERBOSE] Запуск генерации отчёта...');
            console.log('[VERBOSE] Тип отчёта: ' + options.type);
            console.log('[VERBOSE] Путь сохранения: ' + output);
        }

        if (options.dryRun) {
            console.log('[DRY-RUN] Будет сгенерирован отчёт типа: ' + options.type);
            console.log('[DRY-RUN] Файл будет сохранён в: ' + output);
            console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
            return;
        }

        console.log('Отчёт успешно сгенерирован: ' + output);
        process.exit(0);
    });

program
    .command('convert')
    .description('конвертировать файл')
    .option('-i, --input <path>', 'входной файл')
    .option('-o, --output <path>', 'выходной файл')
    .action((options) => {
        console.log('Конвертация: ' + (options.input || 'не указан') + ' -> ' + (options.output || 'не указан'));
        process.exit(0);
    });

program.parse(process.argv);