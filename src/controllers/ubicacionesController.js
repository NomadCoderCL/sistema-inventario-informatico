const ubicacionesService = require('../services/ubicacionesService');

/**
 * Controlador para la gestión de ubicaciones físicas
 */
class UbicacionesController {
    /**
     * Lista todas las ubicaciones registradas
     */
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
