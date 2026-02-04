const bcrypt = require('bcryptjs');
const { query, run, get } = require('./db');

/**
 * Modelo para la gestión de usuarios y seguridad
 */
class Usuario {
    /**
     * Crea un nuevo usuario en el sistema
     * @param {Object} userData - Datos del usuario
     * @param {string} userData.username - Nombre de usuario
     * @param {string} userData.email - Correo electrónico
     * @param {string} userData.password - Contraseña en texto plano
     * @param {string} userData.nombre_completo - Nombre real del usuario
     * @param {number} userData.rol_id - ID del rol asignado
     * @returns {Promise<Object>} El usuario creado (sin contraseña)
     */
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

    /**
     * Obtiene un usuario por su identificador único
     * @param {number} id - Identificador del usuario
     * @returns {Promise<Object|null>} Perfil del usuario o null si no existe
     */
    static async getById(id) {
        return await get('SELECT id, username, email, nombre_completo, rol_id, activo, fecha_creacion FROM usuarios WHERE id = ?', [id]);
    }

    /**
     * Busca un usuario por su nombre de usuario (para login)
     * @param {string} username - Nombre de usuario
     * @returns {Promise<Object|null>} Registro completo del usuario incluyendo hash
     */
    static async getByUsername(username) {
        return await get('SELECT * FROM usuarios WHERE username = ?', [username]);
    }

    /**
     * Lista todos los usuarios registrados con su información de rol
     * @returns {Promise<Array>} Lista de usuarios
     */
    static async getAll() {
        return await query(`
            SELECT u.id, u.username, u.email, u.nombre_completo, u.activo, u.fecha_creacion, 
                   r.nombre as rol_nombre, r.nivel_permiso
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            ORDER BY u.fecha_creacion DESC
        `);
    }

    /**
     * Actualiza la información de un usuario existente
     * @param {number} id - ID del usuario a actualizar
     * @param {Object} updateData - Datos a modificar
     * @returns {Promise<Object>} Usuario actualizado
     */
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

    /**
     * Cambia la contraseña de un usuario verificando la anterior
     * @param {number} id - ID del usuario
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<boolean>}
     */
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

    /**
     * Valida las credenciales de un usuario
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<Object|null>} Datos del usuario si es válido, de lo contrario null
     */
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

    /**
     * Desactiva un usuario (soft delete)
     * @param {number} id - ID del usuario
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        // En lugar de eliminar, desactivamos el usuario
        await run('UPDATE usuarios SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return true;
    }

    /**
     * Verifica si un usuario tiene un nivel de permiso mínimo
     * @param {number} usuarioId - ID del usuario
     * @param {number} nivelRequerido - Nivel de permiso (ej: 50 para técnicos)
     * @returns {Promise<boolean>}
     */
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
