const estadisticasService = require('../services/estadisticasService');

/**
 * Controlador para la generación de reportes y estadísticas
 */
class EstadisticasController {
    /**
     * Obtiene el resumen global de estadísticas para el dashboard
     */
    async getStats(req, res) {
        try {
            const stats = await estadisticasService.getGlobalStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new EstadisticasController();
