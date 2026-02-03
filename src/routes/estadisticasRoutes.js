const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => estadisticasController.getStats(req, res));

module.exports = router;
