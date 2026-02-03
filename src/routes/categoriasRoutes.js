const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => categoriasController.getAll(req, res));

module.exports = router;
