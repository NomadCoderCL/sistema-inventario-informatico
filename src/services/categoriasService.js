const { query } = require('../models/db');

class CategoriasService {
    async getAll() {
        return await query('SELECT * FROM categorias ORDER BY nombre');
    }
}

module.exports = new CategoriasService();
