const categoriasService = require('../services/categoriasService');

/**
 * Controlador para gestionar las categorías de los equipos
 */
class CategoriasController {
    /**
     * Obtiene la lista completa de categorías
     * @param {Object} req - Objeto de petición Express
     * @param {Object} res - Objeto de respuesta Express
     */
    async getAll(req, res) {
        try {
            const categorias = await categoriasService.getAll();
            res.json({ success: true, data: categorias });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CategoriasController();
