const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');
const { validateEquipo } = require('../middleware/validators');

// Definición de rutas para equipos
router.get('/', (req, res) => equiposController.getAll(req, res));
router.get('/buscar/:termino', (req, res) => equiposController.search(req, res));
router.get('/filtros', (req, res) => equiposController.filter(req, res));
router.get('/:id', (req, res) => equiposController.getById(req, res));
router.post('/', validateEquipo, (req, res) => equiposController.create(req, res));
router.put('/:id', validateEquipo, (req, res) => equiposController.update(req, res));
router.delete('/:id', (req, res) => equiposController.delete(req, res));

module.exports = router;
