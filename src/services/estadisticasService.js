const { query, get } = require('../models/db');

/**
 * Servicio para recopilar datos métricos de todo el sistema
 */
class EstadisticasService {
    /**
     * Calcula y agrupa todas las estadísticas para el Dashboard
     * @returns {Promise<Object>} Objeto con contadores y agrupaciones
     */
    async getGlobalStats() {
        const stats = {};

        // Total de equipos
        const totalRow = await get('SELECT COUNT(*) as total FROM equipos');
        stats.totalEquipos = totalRow.total;

        // Equipos por uso
        const nuevosRow = await get('SELECT COUNT(*) as total FROM equipos WHERE uso = "nuevo"');
        stats.equiposNuevos = nuevosRow.total;

        const usadosRow = await get('SELECT COUNT(*) as total FROM equipos WHERE uso = "usado"');
        stats.equiposUsados = usadosRow.total;

        // Equipos por estado
        const buenEstadoRow = await get('SELECT COUNT(*) as total FROM equipos WHERE estado = "buen estado"');
        stats.equiposBuenEstado = buenEstadoRow.total;

        const malEstadoRow = await get('SELECT COUNT(*) as total FROM equipos WHERE estado = "malas condiciones"');
        stats.equiposMalasCondiciones = malEstadoRow.total;

        // Equipos por tipo de dispositivo
        stats.equiposPorTipo = await query('SELECT tipo_dispositivo, COUNT(*) as total FROM equipos GROUP BY tipo_dispositivo');

        // Equipos por ubicación
        const ubicacionSql = `
            SELECT u.nombre, COUNT(e.id) as total 
            FROM ubicaciones u 
            LEFT JOIN equipos e ON u.id = e.ubicacion_id 
            GROUP BY u.id, u.nombre
        `;
        stats.equiposPorUbicacion = await query(ubicacionSql);

        // Total de salidas
        const salidasRow = await get('SELECT COUNT(*) as total FROM salidas_equipos');
        stats.totalSalidas = salidasRow.total;

        return stats;
    }
}

module.exports = new EstadisticasService();
