const sqlite3 = require('sqlite3').verbose();
const path = require('path');

require('dotenv').config();
const dbPath = path.resolve(process.env.DB_PATH || './inventario.db');
const db = new sqlite3.Database(dbPath);

// Habilitar el modo estricto para las consultas SQLite
db.get("PRAGMA foreign_keys = ON");

// Función para ejecutar consultas con promesas
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Función para ejecutar operaciones de inserción/actualización/eliminación
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

// Función para obtener un solo registro
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

module.exports = {
    db,
    query,
    run,
    get,
    close: () => db.close()
};
