const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    group_name: Joi.string().pattern(/^ББМО-\d{2}-\d{2}$/).required(),
    age: Joi.number().min(16).max(100),
    course: Joi.number().min(1).max(4)
});

class UserController {
    constructor(userService) {
        this.service = userService;
    }

    async getAll(ctx) {
        ctx.body = { data: await this.service.getAll() };
    }

    async getById(ctx) {
        ctx.body = { data: await this.service.getById(ctx.params.id) };
    }

    async create(ctx) {
        const { error, value } = schema.validate(ctx.request.body);
        if (error) {
            ctx.status = 400;
            ctx.body = { error: 'Validation failed', details: error.details.map(d => ({ field: d.path[0], message: d.message })) };
            return;
        }
        ctx.status = 201;
        ctx.body = { data: await this.service.create(value) };
    }

    async update(ctx) {
        ctx.body = { data: await this.service.update(ctx.params.id, ctx.request.body) };
    }

    async delete(ctx) {
        await this.service.delete(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = UserController;