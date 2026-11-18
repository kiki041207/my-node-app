module.exports = async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - start}ms`);
};