const express = require('express');
const router = express.Router();
const ubicacionesController = require('../controllers/ubicacionesController');

router.get('/', (req, res) => ubicacionesController.getAll(req, res));

module.exports = router;
