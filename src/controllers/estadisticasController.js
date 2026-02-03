const estadisticasService = require('../services/estadisticasService');

class EstadisticasController {
    async getStats(req, res) {
        try {
            const stats = await estadisticasService.getGlobalStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new EstadisticasController();
