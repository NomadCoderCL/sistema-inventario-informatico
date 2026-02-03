const { body, validationResult } = require('express-validator');

/**
 * Middleware para manejar los resultados de la validación
 */
const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validaciones para equipos
 */
exports.validateEquipo = [
    body('codigo').trim().notEmpty().withMessage('El código es obligatorio'),
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('tipo_dispositivo').notEmpty().withMessage('El tipo de dispositivo es obligatorio'),
    body('categoria_id').isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    body('ubicacion_id').isInt({ min: 1 }).withMessage('ID de ubicación inválido'),
    validateResults
];

/**
 * Validaciones para marcas
 */
exports.validateMarca = [
    body('nombre').trim().notEmpty().withMessage('El nombre de la marca es obligatorio'),
    validateResults
];

/**
 * Validaciones para login
 */
exports.validateLogin = [
    body('username').trim().notEmpty().withMessage('El usuario es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    validateResults
];
