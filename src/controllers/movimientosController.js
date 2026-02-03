const movimientosService = require('../services/movimientosService');

class MovimientosController {
    async getAll(req, res) {
        try {
            const movimientos = await movimientosService.getAll();
            res.json(movimientos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

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
