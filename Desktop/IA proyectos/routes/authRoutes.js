const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Rutas de autenticación
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verifyToken);

module.exports = router;
