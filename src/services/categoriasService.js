const { query } = require('../models/db');

/**
 * Servicio para la gestión de categorías en la base de datos
 */
class CategoriasService {
    /**
     * Recupera todas las categorías ordenadas alfabéticamente
     * @returns {Promise<Array>}
     */
    async getAll() {
        return await query('SELECT * FROM categorias ORDER BY nombre');
    }
}

module.exports = new CategoriasService();
