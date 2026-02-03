const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de logs
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'inventario-api' },
    transports: [
        // Errores en archivo separado
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        // Todo en combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        })
    ]
});

// En desarrollo, también mostrar en consola con formato amigable
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;
