const { query, run } = require('../models/db');

class SalidasService {
    async getAll() {
        const sql = `
            SELECT s.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre, m.nombre as marca_nombre
            FROM salidas_equipos s
            LEFT JOIN equipos e ON s.equipo_id = e.id
            LEFT JOIN marcas m ON e.marca_id = m.id
            ORDER BY s.fecha_salida DESC
        `;
        return await query(sql);
    }

    async create(data) {
        const { equipo_id, fecha_salida, motivo, destino, responsable, notas } = data;
        const sql = 'INSERT INTO salidas_equipos (equipo_id, fecha_salida, motivo, destino, responsable, notas) VALUES (?, ?, ?, ?, ?, ?)';
        return await run(sql, [equipo_id, fecha_salida, motivo, destino, responsable, notas]);
    }
}

module.exports = new SalidasService();
