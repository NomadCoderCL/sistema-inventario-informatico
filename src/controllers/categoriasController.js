const categoriasService = require('../services/categoriasService');

class CategoriasController {
    async getAll(req, res) {
        try {
            const categorias = await categoriasService.getAll();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CategoriasController();
