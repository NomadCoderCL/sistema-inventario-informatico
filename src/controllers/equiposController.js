const equiposService = require('../services/equiposService');

/**
 * Controlador para manejar peticiones HTTP relacionadas con equipos
 */
class EquiposController {
    /**
     * Obtiene todos los equipos
     */
    async getAll(req, res) {
        try {
            const equipos = await equiposService.getAll();
            res.json({
                success: true,
                data: equipos
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Obtiene un equipo por su ID
     */
    async getById(req, res) {
        try {
            const equipo = await equiposService.getById(req.params.id);
            if (!equipo) {
                return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
            }
            res.json({
                success: true,
                data: equipo
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Crea un nuevo equipo
     */
    async create(req, res) {
        try {
            const result = await equiposService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Equipo creado exitosamente',
                data: { id: result.id }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Actualiza un equipo existente
     */
    async update(req, res) {
        try {
            const result = await equiposService.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
            }
            res.json({
                success: true,
                message: 'Equipo actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Elimina un equipo
     */
    async delete(req, res) {
        try {
            const result = await equiposService.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
            }
            res.json({
                success: true,
                message: 'Equipo eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Busca equipos por término general
     */
    async search(req, res) {
        try {
            const equipos = await equiposService.search(req.params.termino);
            res.json({
                success: true,
                data: equipos
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Filtra equipos por múltiples criterios
     */
    async filter(req, res) {
        try {
            const equipos = await equiposService.filter(req.query);
            res.json({
                success: true,
                data: equipos
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new EquiposController();
