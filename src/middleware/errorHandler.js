const logger = require('../config/logger');

/**
 * Middleware centralizado de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    // Loguear el error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    // Respuesta uniforme de error
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

module.exports = errorHandler;
