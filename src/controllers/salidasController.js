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
            res.json({ success: true, data: salidas });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Registra una nueva salida definitiva de un equipo
     */
    async create(req, res) {
        try {
            const result = await salidasService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Salida registrada exitosamente',
                data: { id: result.id }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Elimina una salida registrada
     */
    async delete(req, res) {
        try {
            const result = await salidasService.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Salida no encontrada' });
            }
            res.json({
                success: true,
                message: 'Salida eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new SalidasController();
