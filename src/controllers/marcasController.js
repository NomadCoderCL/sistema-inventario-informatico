const marcasService = require('../services/marcasService');

/**
 * Controlador para la gestión de marcas de fabricantes
 */
class MarcasController {
    /**
     * Obtiene solo las marcas activas (no obsoletas)
     */
    async getAll(req, res) {
        try {
            const marcas = await marcasService.getAll(true);
            res.json(marcas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtiene todas las marcas incluyendo las obsoletas
     */
    async getAllComplete(req, res) {
        try {
            const marcas = await marcasService.getAll(false);
            res.json(marcas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Registra una nueva marca
     */
    async create(req, res) {
        try {
            const result = await marcasService.create(req.body);
            res.json({ id: result.id, message: 'Marca creada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Actualiza la información de una marca existente
     */
    async update(req, res) {
        try {
            const result = await marcasService.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Marca no encontrada' });
            }
            res.json({ message: 'Marca actualizada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MarcasController();
