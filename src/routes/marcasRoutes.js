const express = require('express');
const router = express.Router();
const marcasController = require('../controllers/marcasController');
const { validateMarca } = require('../middleware/validators');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => marcasController.getAll(req, res));
router.get('/todas', (req, res) => marcasController.getAllComplete(req, res));
router.post('/', validateMarca, (req, res) => marcasController.create(req, res));
router.put('/:id', validateMarca, (req, res) => marcasController.update(req, res));

module.exports = router;
