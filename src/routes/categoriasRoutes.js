const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

router.get('/', (req, res) => categoriasController.getAll(req, res));

module.exports = router;
