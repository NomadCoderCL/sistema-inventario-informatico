const { query, run, get } = require('../models/db');

/**
 * Servicio para la gestión lógica de marcas de equipos
 */
class MarcasService {
    /**
     * Obtiene marcas con opción de filtrar por estado activo
     * @param {boolean} onlyActive - Si es true, solo retorna marcas no obsoletas
     * @returns {Promise<Array>}
     */
    async getAll(onlyActive = true) {
        const sql = onlyActive
            ? 'SELECT * FROM marcas WHERE obsoleto = 0 ORDER BY nombre'
            : 'SELECT * FROM marcas ORDER BY nombre';
        return await query(sql);
    }

    /**
     * Inserta una nueva marca en el sistema
     * @param {Object} data - Datos de la marca
     * @returns {Promise<Object>} Resultado de la ejecución
     */
    async create(data) {
        const { nombre, descripcion } = data;
        return await run('INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    }

    /**
     * Modifica los datos de una marca
     * @param {number} id - ID de la marca
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>} Resultado de la DB
     */
    async update(id, data) {
        const { nombre, descripcion, obsoleto } = data;
        const sql = `
            UPDATE marcas 
            SET nombre = ?, descripcion = ?, obsoleto = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        return await run(sql, [nombre, descripcion, obsoleto ? 1 : 0, id]);
    }
}

module.exports = new MarcasService();
