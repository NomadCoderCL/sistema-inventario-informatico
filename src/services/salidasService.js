const { query, run } = require('../models/db');

/**
 * Servicio para registrar y consultar bajas de equipos
 */
class SalidasService {
    /**
     * Recupera el historial de salidas con información extendida del equipo
     * @returns {Promise<Array>}
     */
    async getAll() {
        const sql = `
            SELECT s.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre, m.nombre as marca_nombre
            FROM salidas_equipos s
            LEFT JOIN equipos e ON s.equipo_id = e.id
            LEFT JOIN marcas m ON e.marca_id = m.id
            ORDER BY s.fecha_salida DESC
        `;
        return await query(sql);
    }

    /**
     * Crea un registro de salida y marca el equipo (lógica a futuro)
     * @param {Object} data - Datos de la salida
     * @returns {Promise<Object>}
     */
    async create(data) {
        const { equipo_id, fecha_salida, motivo, destino, responsable, notas } = data;
        const sql = 'INSERT INTO salidas_equipos (equipo_id, fecha_salida, motivo, destino, responsable, notas) VALUES (?, ?, ?, ?, ?, ?)';
        return await run(sql, [equipo_id, fecha_salida, motivo, destino, responsable, notas]);
    }

    /**
     * Elimina un registro de salida
     * @param {number} id - ID de la salida
     * @returns {Promise<Object>}
     */
    async delete(id) {
        return await run('DELETE FROM salidas_equipos WHERE id = ?', [id]);
    }
}

module.exports = new SalidasService();
