const { query, run, get } = require('../models/db');

class MarcasService {
    async getAll(onlyActive = true) {
        const sql = onlyActive
            ? 'SELECT * FROM marcas WHERE obsoleto = 0 ORDER BY nombre'
            : 'SELECT * FROM marcas ORDER BY nombre';
        return await query(sql);
    }

    async create(data) {
        const { nombre, descripcion } = data;
        return await run('INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    }

    async update(id, data) {
        const { nombre, descripcion, obsoleto } = data;
        const sql = `
            UPDATE marcas 
            SET nombre = ?, descripcion = ?, obsoleto = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        return await run(sql, [nombre, descripcion, obsoleto ? 1 : 0, id]);
    }
}

module.exports = new MarcasService();
