const express = require('express');
const router = express.Router();
const salidasController = require('../controllers/salidasController');

router.get('/', (req, res) => salidasController.getAll(req, res));
router.post('/', (req, res) => salidasController.create(req, res));

module.exports = router;
