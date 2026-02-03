const { query, run, get } = require('../models/db');

/**
 * Servicio para gestionar la lógica de negocio de equipos informáticos
 */
class EquiposService {
    /**
     * Obtiene todos los equipos con sus categorías, ubicaciones y marcas relacionadas
     * @returns {Promise<Array>} Lista de equipos
     */
    async getAll() {
        const sql = `
            SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
            FROM equipos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
            LEFT JOIN marcas m ON e.marca_id = m.id
            ORDER BY e.fecha_creacion DESC
        `;
        return await query(sql);
    }

    /**
     * Obtiene un equipo específico por su ID
     * @param {number} id - ID del equipo
     * @returns {Promise<Object>} Registro del equipo
     */
    async getById(id) {
        const sql = `
            SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
            FROM equipos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
            LEFT JOIN marcas m ON e.marca_id = m.id
            WHERE e.id = ?
        `;
        return await get(sql, [id]);
    }

    /**
     * Crea un nuevo equipo en la base de datos
     * @param {Object} equipoData - Datos del equipo a crear
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async create(equipoData) {
        const {
            codigo, nombre, marca_id, modelo, serie, tipo_dispositivo,
            categoria_id, ubicacion_id, uso, estado, fecha_adquisicion,
            proveedor, notas
        } = equipoData;

        const sql = `
            INSERT INTO equipos (
                codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, 
                categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, 
                proveedor, notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return await run(sql, [
            codigo, nombre, marca_id, modelo, serie, tipo_dispositivo,
            categoria_id, ubicacion_id, uso, estado, fecha_adquisicion,
            proveedor, notas
        ]);
    }

    /**
     * Actualiza un equipo existente
     * @param {number} id - ID del equipo a actualizar
     * @param {Object} equipoData - Nuevos datos del equipo
     * @returns {Promise<Object>} Resultado de la actualización
     */
    async update(id, equipoData) {
        const {
            codigo, nombre, marca_id, modelo, serie, tipo_dispositivo,
            categoria_id, ubicacion_id, uso, estado, fecha_adquisicion,
            proveedor, notas
        } = equipoData;

        const sql = `
            UPDATE equipos 
            SET codigo = ?, nombre = ?, marca_id = ?, modelo = ?, serie = ?, tipo_dispositivo = ?, 
                categoria_id = ?, ubicacion_id = ?, uso = ?, estado = ?, fecha_adquisicion = ?, 
                proveedor = ?, notas = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        return await run(sql, [
            codigo, nombre, marca_id, modelo, serie, tipo_dispositivo,
            categoria_id, ubicacion_id, uso, estado, fecha_adquisicion,
            proveedor, notas, id
        ]);
    }

    /**
     * Elimina un equipo por su ID
     * @param {number} id - ID del equipo
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async delete(id) {
        return await run('DELETE FROM equipos WHERE id = ?', [id]);
    }

    /**
     * Busca equipos por un término de búsqueda general
     * @param {string} termino - Término a buscar
     * @returns {Promise<Array>} Lista de equipos que coinciden
     */
    async search(termino) {
        const wildTerm = `%${termino}%`;
        const sql = `
            SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
            FROM equipos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
            LEFT JOIN marcas m ON e.marca_id = m.id
            WHERE e.codigo LIKE ? OR e.nombre LIKE ? OR m.nombre LIKE ? OR e.modelo LIKE ? 
                  OR c.nombre LIKE ? OR u.nombre LIKE ? OR e.tipo_dispositivo LIKE ?
            ORDER BY e.fecha_creacion DESC
        `;

        return await query(sql, [
            wildTerm, wildTerm, wildTerm, wildTerm,
            wildTerm, wildTerm, wildTerm
        ]);
    }

    /**
     * Filtra equipos por múltiples criterios específicos
     * @param {Object} filters - Criterios de filtrado
     * @returns {Promise<Array>} Lista de equipos filtrados
     */
    async filter(filters) {
        const { marca_id, categoria_id, ubicacion_id, uso, estado, tipo_dispositivo } = filters;
        let conditions = [];
        let params = [];

        if (marca_id) {
            conditions.push('e.marca_id = ?');
            params.push(marca_id);
        }
        if (categoria_id) {
            conditions.push('e.categoria_id = ?');
            params.push(categoria_id);
        }
        if (ubicacion_id) {
            conditions.push('e.ubicacion_id = ?');
            params.push(ubicacion_id);
        }
        if (uso) {
            conditions.push('e.uso = ?');
            params.push(uso);
        }
        if (estado) {
            conditions.push('e.estado = ?');
            params.push(estado);
        }
        if (tipo_dispositivo) {
            conditions.push('e.tipo_dispositivo = ?');
            params.push(tipo_dispositivo);
        }

        let sql = `
            SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
            FROM equipos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
            LEFT JOIN marcas m ON e.marca_id = m.id
        `;

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY e.fecha_creacion DESC';

        return await query(sql, params);
    }
}

module.exports = new EquiposService();
