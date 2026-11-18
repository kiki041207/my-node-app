module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        
        if (err.message.includes('24 character hex string')) {
            ctx.status = 404;
            ctx.body = { error: 'Пользователь не найден (неверный ID)' };
            return;
        }

        ctx.body = { error: err.message };
    }
};