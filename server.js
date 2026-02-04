const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const equiposRoutes = require('./src/routes/equiposRoutes');
const marcasRoutes = require('./src/routes/marcasRoutes');
const categoriasRoutes = require('./src/routes/categoriasRoutes');
const ubicacionesRoutes = require('./src/routes/ubicacionesRoutes');
const salidasRoutes = require('./src/routes/salidasRoutes');
const movimientosRoutes = require('./src/routes/movimientosRoutes');
const estadisticasRoutes = require('./src/routes/estadisticasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y utilidad
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar si causa problemas con CDNs externos en desarrollo
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Registro de peticiones simple con winston
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/salidas', salidasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo centralizado de errores
app.use(errorHandler);

// Solo escuchar si se ejecuta directamente (no en tests)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
