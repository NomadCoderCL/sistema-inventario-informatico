const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { JWT_SECRET = 'tu_clave_secreta' } = process.env;

class AuthController {
    // Iniciar sesión
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validar datos de entrada
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            // Buscar usuario
            const usuario = await Usuario.getByUsername(username);

            // Verificar si el usuario existe
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const esValida = await bcrypt.compare(password, usuario.password_hash);
            if (!esValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo. Contacte al administrador.'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    username: usuario.username,
                    rol_id: usuario.rol_id
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Enviar respuesta exitosa
            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    token,
                    usuario: {
                        id: usuario.id,
                        username: usuario.username,
                        nombre_completo: usuario.nombre_completo,
                        email: usuario.email,
                        rol_id: usuario.rol_id
                    }
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }

    // Verificar token
    static async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token no proporcionado'
                });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const usuario = await Usuario.getById(decoded.id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: {
                    id: usuario.id,
                    username: usuario.username,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    rol_id: usuario.rol_id
                }
            });

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }

            console.error('Error en verifyToken:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar el token',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;
