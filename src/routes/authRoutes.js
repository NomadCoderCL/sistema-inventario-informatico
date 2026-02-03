const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateLogin } = require('../middleware/validators');

// Rutas de autenticación
router.post('/login', validateLogin, AuthController.login);
router.get('/verify', AuthController.verifyToken);

module.exports = router;
