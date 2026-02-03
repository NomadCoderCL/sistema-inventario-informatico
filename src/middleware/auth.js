const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Middleware para proteger rutas mediante JWT
 */
const auth = (req, res, next) => {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(`Intento de acceso no autorizado a ${req.url} - IP: ${req.ip}`);
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. No se proporcionó un token válido.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar datos del usuario al objeto request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado. Por favor, inicie sesión nuevamente.'
            });
        }

        logger.error(`Error de validación de token: ${error.message} - IP: ${req.ip}`);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o malformado.'
        });
    }
};

/**
 * Middleware para restringir acceso por rol
 * @param {Array} rolesPermitidos - Lista de IDs de roles permitidos
 */
const authorize = (rolesPermitidos = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado.'
            });
        }

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(req.user.rol_id)) {
            logger.warn(`Usuario ${req.user.username} intentó acceder a ruta restringida: ${req.url}`);
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos suficientes para realizar esta acción.'
            });
        }

        next();
    };
};

module.exports = { auth, authorize };
