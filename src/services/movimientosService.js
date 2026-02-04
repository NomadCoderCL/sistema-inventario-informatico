const { query, run } = require('../models/db');

/**
 * Servicio para registrar y recuperar la trazabilidad de los equipos
 */
class MovimientosService {
    /**
     * Obtiene todos los movimientos registrados con detalles de equipo y ubicación
     * @returns {Promise<Array>}
     */
    async getAll() {
        const sql = `
            SELECT m.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre,
                   uo.nombre as ubicacion_origen, ud.nombre as ubicacion_destino
            FROM historial_movimientos m
            LEFT JOIN equipos e ON m.equipo_id = e.id
            LEFT JOIN ubicaciones uo ON m.ubicacion_origen_id = uo.id
            LEFT JOIN ubicaciones ud ON m.ubicacion_destino_id = ud.id
            ORDER BY m.fecha_movimiento DESC
        `;
        return await query(sql);
    }

    /**
     * Registra un nuevo evento en el historial
     * @param {Object} data - Datos del movimiento
     * @returns {Promise<Object>}
     */
    async create(data) {
        const { equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas } = data;
        const sql = 'INSERT INTO historial_movimientos (equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas) VALUES (?, ?, ?, ?, ?, ?)';
        return await run(sql, [equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas]);
    }
}

module.exports = new MovimientosService();
