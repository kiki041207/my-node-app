class UserService {
    constructor(userModel) {
        this.model = userModel;
    }

    async getAll() {
        return await this.model.findAll();
    }

    async getById(id) {
        const user = await this.model.findById(id);
        if (!user) {
            const err = new Error('Пользователь не найден');
            err.status = 404;
            throw err;
        }
        return user;
    }

    async create(data) {
        console.log(`[SERVICE] Создание: ${data.email}`);
        const existing = await this.model.findByEmail(data.email);
        if (existing) {
            const err = new Error('Email уже существует');
            err.status = 409;
            throw err;
        }
        const user = await this.model.create(data);
        console.log(`[SERVICE] Email отправлен: ${data.email}`);
        return user;
    }

    async update(id, data) {
        return await this.model.update(id, data);
    }

    async delete(id) {
        return await this.model.delete(id);
    }
}

module.exports = UserService;