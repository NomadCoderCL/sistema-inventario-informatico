const { query, run, get } = require('./db');

class Rol {
    // Obtener todos los roles
    static async getAll() {
        return await query('SELECT * FROM roles ORDER BY nivel_permiso DESC');
    }

    // Obtener un rol por ID
    static async getById(id) {
        return await get('SELECT * FROM roles WHERE id = ?', [id]);
    }

    // Crear un nuevo rol
    static async create({ nombre, descripcion, nivel_permiso }) {
        const result = await run(
            'INSERT INTO roles (nombre, descripcion, nivel_permiso) VALUES (?, ?, ?)',
            [nombre, descripcion, nivel_permiso]
        );
        return { id: result.id, nombre, descripcion, nivel_permiso };
    }

    // Actualizar un rol
    static async update(id, { nombre, descripcion, nivel_permiso }) {
        await run(
            'UPDATE roles SET nombre = ?, descripcion = ?, nivel_permiso = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
            [nombre, descripcion, nivel_permiso, id]
        );
        return { id, nombre, descripcion, nivel_permiso };
    }

    // Eliminar un rol
    static async delete(id) {
        // Verificar si hay usuarios con este rol
        const usuarios = await query('SELECT id FROM usuarios WHERE rol_id = ?', [id]);
        if (usuarios.length > 0) {
            throw new Error('No se puede eliminar el rol porque tiene usuarios asociados');
        }
        
        await run('DELETE FROM roles WHERE id = ?', [id]);
        return true;
    }

    // Verificar si un nivel de permiso es suficiente para realizar una acción
    static async tienePermiso(nombreRol, nivelRequerido) {
        const rol = await get('SELECT nivel_permiso FROM roles WHERE nombre = ?', [nombreRol]);
        if (!rol) return false;
        return rol.nivel_permiso >= nivelRequerido;
    }
}

module.exports = Rol;
