const { v4: uuidv4 } = require('uuid');
const { query, run, get } = require('./db');

class RefreshToken {
    // Crear un nuevo token de refresco
    static async create(usuarioId, diasExpiracion = 7) {
        const token = uuidv4();
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + diasExpiracion);

        await run(
            'INSERT INTO refresh_tokens (usuario_id, token, expiracion) VALUES (?, ?, ?)',
            [usuarioId, token, fechaExpiracion.toISOString()]
        );

        return {
            token,
            expiracion: fechaExpiracion,
            usuario_id: usuarioId
        };
    }

    // Obtener un token por su valor
    static async getByToken(token) {
        return await get(
            'SELECT rt.*, u.username, u.rol_id FROM refresh_tokens rt ' +
            'JOIN usuarios u ON rt.usuario_id = u.id ' +
            'WHERE rt.token = ? AND rt.revocado = 0 AND rt.expiracion > CURRENT_TIMESTAMP',
            [token]
        );
    }

    // Revocar un token
    static async revoke(token) {
        await run(
            'UPDATE refresh_tokens SET revocado = 1 WHERE token = ?',
            [token]
        );
        return true;
    }

    // Revocar todos los tokens de un usuario
    static async revokeAllForUser(usuarioId) {
        await run(
            'UPDATE refresh_tokens SET revocado = 1 WHERE usuario_id = ?',
            [usuarioId]
        );
        return true;
    }

    // Limpiar tokens expirados
    static async limpiarExpirados() {
        await run(
            'DELETE FROM refresh_tokens WHERE expiracion <= CURRENT_TIMESTAMP OR revocado = 1'
        );
        return true;
    }
}

module.exports = RefreshToken;
