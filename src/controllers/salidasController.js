const salidasService = require('../services/salidasService');

class SalidasController {
    async getAll(req, res) {
        try {
            const salidas = await salidasService.getAll();
            res.json(salidas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

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
