const bcrypt = require('bcryptjs');
const { query, run, get } = require('./db');

class Usuario {
    // Crear un nuevo usuario
    static async create({ username, email, password, nombre_completo, rol_id }) {
        // Verificar si el usuario ya existe
        const usuarioExistente = await get('SELECT id FROM usuarios WHERE username = ? OR email = ?', [username, email]);
        if (usuarioExistente) {
            throw new Error('El nombre de usuario o correo electrónico ya está en uso');
        }

        // Hashear la contraseña
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Insertar el nuevo usuario
        const result = await run(
            'INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol_id) VALUES (?, ?, ?, ?, ?)',
            [username, email, passwordHash, nombre_completo, rol_id]
        );

        return await this.getById(result.id);
    }

    // Obtener un usuario por ID
    static async getById(id) {
        return await get('SELECT id, username, email, nombre_completo, rol_id, activo, fecha_creacion FROM usuarios WHERE id = ?', [id]);
    }

    // Obtener un usuario por nombre de usuario
    static async getByUsername(username) {
        return await get('SELECT * FROM usuarios WHERE username = ?', [username]);
    }

    // Obtener todos los usuarios
    static async getAll() {
        return await query(`
            SELECT u.id, u.username, u.email, u.nombre_completo, u.activo, u.fecha_creacion, 
                   r.nombre as rol_nombre, r.nivel_permiso
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            ORDER BY u.fecha_creacion DESC
        `);
    }

    // Actualizar un usuario
    static async update(id, { nombre_completo, email, rol_id, activo }) {
        const updates = [];
        const params = [];
        
        if (nombre_completo !== undefined) {
            updates.push('nombre_completo = ?');
            params.push(nombre_completo);
        }
        
        if (email !== undefined) {
            // Verificar si el email ya está en uso por otro usuario
            const emailEnUso = await get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
            if (emailEnUso) {
                throw new Error('El correo electrónico ya está en uso');
            }
            updates.push('email = ?');
            params.push(email);
        }
        
        if (rol_id !== undefined) {
            updates.push('rol_id = ?');
            params.push(rol_id);
        }
        
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo ? 1 : 0);
        }
        
        if (updates.length === 0) {
            return await this.getById(id);
        }
        
        params.push(id);
        
        await run(
            `UPDATE usuarios SET ${updates.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );
        
        return await this.getById(id);
    }

    // Actualizar contraseña
    static async updatePassword(id, currentPassword, newPassword) {
        const usuario = await get('SELECT password_hash FROM usuarios WHERE id = ?', [id]);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar la contraseña actual
        const esValida = await bcrypt.compare(currentPassword, usuario.password_hash);
        if (!esValida) {
            throw new Error('La contraseña actual es incorrecta');
        }

        // Hashear la nueva contraseña
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(newPassword, salt);

        // Actualizar la contraseña
        await run('UPDATE usuarios SET password_hash = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);
        return true;
    }

    // Verificar credenciales
    static async verificarCredenciales(username, password) {
        const usuario = await this.getByUsername(username);
        if (!usuario || !usuario.activo) {
            return null;
        }

        const esValida = await bcrypt.compare(password, usuario.password_hash);
        if (!esValida) {
            return null;
        }

        // Actualizar la fecha de último inicio de sesión
        await run('UPDATE usuarios SET ultimo_inicio_sesion = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id]);
        
        // No devolver la contraseña
        const { password_hash, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
    }

    // Eliminar un usuario (soft delete)
    static async delete(id) {
        // En lugar de eliminar, desactivamos el usuario
        await run('UPDATE usuarios SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return true;
    }

    // Verificar si un usuario tiene un rol con suficiente nivel de permiso
    static async tienePermiso(usuarioId, nivelRequerido) {
        const usuario = await get(
            'SELECT r.nivel_permiso FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
            [usuarioId]
        );
        
        if (!usuario) return false;
        return usuario.nivel_permiso >= nivelRequerido;
    }
}

module.exports = Usuario;
