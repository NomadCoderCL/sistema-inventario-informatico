const { query } = require('../models/db');

class UbicacionesService {
    async getAll() {
        return await query('SELECT * FROM ubicaciones ORDER BY nombre');
    }
}

module.exports = new UbicacionesService();
