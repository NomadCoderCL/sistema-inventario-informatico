const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.test' });

module.exports = async () => {
    const dbPath = path.resolve(process.env.DB_PATH || './inventario.test.db');

    // Eliminar base de datos de prueba si existe para empezar limpio
    if (fs.existsSync(dbPath)) {
        console.log('Eliminando base de datos de prueba anterior...');
        fs.unlinkSync(dbPath);
    }

    console.log('Inicializando nueva base de datos de prueba...');
    // Ejecutar init-db con el entorno de pruebas
    // Nota: El comando init-db lee DB_PATH de process.env si está configurado
    execSync('npm run init-db', {
        stdio: 'inherit',
        env: { ...process.env, DB_PATH: dbPath }
    });
};
