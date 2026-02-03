const ubicacionesService = require('../services/ubicacionesService');

class UbicacionesController {
    async getAll(req, res) {
        try {
            const ubicaciones = await ubicacionesService.getAll();
            res.json(ubicaciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UbicacionesController();
