const { query } = require('../models/db');

/**
 * Servicio para el acceso a datos de ubicaciones
 */
class UbicacionesService {
    /**
     * Obtiene todas las sedes o salas físicas ordenadas por nombre
     * @returns {Promise<Array>}
     */
    async getAll() {
        return await query('SELECT * FROM ubicaciones ORDER BY nombre');
    }
}

module.exports = new UbicacionesService();
