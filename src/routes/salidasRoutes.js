const express = require('express');
const router = express.Router();
const salidasController = require('../controllers/salidasController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => salidasController.getAll(req, res));
router.post('/', (req, res) => salidasController.create(req, res));
router.delete('/:id', (req, res) => salidasController.delete(req, res));

module.exports = router;
