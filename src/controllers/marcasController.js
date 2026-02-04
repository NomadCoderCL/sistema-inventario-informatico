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
            res.json({ success: true, data: marcas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Obtiene todas las marcas incluyendo las obsoletas
     */
    async getAllComplete(req, res) {
        try {
            const marcas = await marcasService.getAll(false);
            res.json({ success: true, data: marcas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Registra una nueva marca
     */
    async create(req, res) {
        try {
            const result = await marcasService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Marca creada exitosamente',
                data: { id: result.id }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Actualiza la información de una marca existente
     */
    async update(req, res) {
        try {
            const result = await marcasService.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Marca no encontrada' });
            }
            res.json({
                success: true,
                message: 'Marca actualizada exitosamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new MarcasController();
