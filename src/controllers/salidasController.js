const salidasService = require('../services/salidasService');

/**
 * Controlador para gestionar la salida física de equipos del inventario
 */
class SalidasController {
    /**
     * Lista todas las salidas registradas
     */
    async getAll(req, res) {
        try {
            const salidas = await salidasService.getAll();
            res.json(salidas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Registra una nueva salida definitiva de un equipo
     */
    async create(req, res) {
        try {
            const result = await salidasService.create(req.body);
            res.json({ id: result.id, message: 'Salida registrada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SalidasController();
