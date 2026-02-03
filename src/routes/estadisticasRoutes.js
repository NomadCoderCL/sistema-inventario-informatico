const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

router.get('/', (req, res) => estadisticasController.getStats(req, res));

module.exports = router;
