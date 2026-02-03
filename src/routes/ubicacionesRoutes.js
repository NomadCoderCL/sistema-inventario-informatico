const express = require('express');
const router = express.Router();
const ubicacionesController = require('../controllers/ubicacionesController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => ubicacionesController.getAll(req, res));

module.exports = router;
