const movimientosService = require('../services/movimientosService');

/**
 * Controlador para la bitácora de movimientos de hardware
 */
class MovimientosController {
    /**
     * Obtiene el historial completo de movimientos
     */
    async getAll(req, res) {
        try {
            const movimientos = await movimientosService.getAll();
            res.json({ success: true, data: movimientos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Registra un nuevo movimiento de equipo
     */
    async create(req, res) {
        try {
            const result = await movimientosService.create(req.body);
            res.json({ id: result.id, message: 'Movimiento registrado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MovimientosController();
