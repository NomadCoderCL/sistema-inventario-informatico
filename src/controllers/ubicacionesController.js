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
            res.json({ success: true, data: ubicaciones });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UbicacionesController();
