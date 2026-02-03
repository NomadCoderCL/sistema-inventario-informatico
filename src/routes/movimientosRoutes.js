const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');

router.get('/', (req, res) => movimientosController.getAll(req, res));
router.post('/', (req, res) => movimientosController.create(req, res));

module.exports = router;
