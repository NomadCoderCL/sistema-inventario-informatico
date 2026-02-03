const express = require('express');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('./inventario.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// API para equipos
app.get('/api/equipos', (req, res) => {
    const query = `
        SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
        LEFT JOIN marcas m ON e.marca_id = m.id
        ORDER BY e.fecha_creacion DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/equipos/:id', (req, res) => {
    const query = `
        SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
        LEFT JOIN marcas m ON e.marca_id = m.id
        WHERE e.id = ?
    `;

    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Equipo no encontrado' });
            return;
        }
        res.json(row);
    });
});

app.post('/api/equipos', (req, res) => {
    const { codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas } = req.body;

    const query = `
        INSERT INTO equipos (codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Equipo creado exitosamente' });
    });
});

app.put('/api/equipos/:id', (req, res) => {
    const { codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas } = req.body;

    const query = `
        UPDATE equipos 
        SET codigo = ?, nombre = ?, marca_id = ?, modelo = ?, serie = ?, tipo_dispositivo = ?, 
            categoria_id = ?, ubicacion_id = ?, uso = ?, estado = ?, fecha_adquisicion = ?, 
            proveedor = ?, notas = ?, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(query, [codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas, req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Equipo no encontrado' });
            return;
        }
        res.json({ message: 'Equipo actualizado exitosamente' });
    });
});

app.delete('/api/equipos/:id', (req, res) => {
    db.run('DELETE FROM equipos WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Equipo no encontrado' });
            return;
        }
        res.json({ message: 'Equipo eliminado exitosamente' });
    });
});

// Búsqueda de equipos con filtros
app.get('/api/equipos/buscar/:termino', (req, res) => {
    const termino = `%${req.params.termino}%`;
    const query = `
        SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
        LEFT JOIN marcas m ON e.marca_id = m.id
        WHERE e.codigo LIKE ? OR e.nombre LIKE ? OR m.nombre LIKE ? OR e.modelo LIKE ? 
              OR c.nombre LIKE ? OR u.nombre LIKE ? OR e.tipo_dispositivo LIKE ?
        ORDER BY e.fecha_creacion DESC
    `;

    db.all(query, [termino, termino, termino, termino, termino, termino, termino], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Filtros específicos
app.get('/api/equipos/filtros', (req, res) => {
    const { marca_id, categoria_id, ubicacion_id, uso, estado, tipo_dispositivo } = req.query;
    let conditions = [];
    let params = [];

    if (marca_id) {
        conditions.push('e.marca_id = ?');
        params.push(marca_id);
    }
    if (categoria_id) {
        conditions.push('e.categoria_id = ?');
        params.push(categoria_id);
    }
    if (ubicacion_id) {
        conditions.push('e.ubicacion_id = ?');
        params.push(ubicacion_id);
    }
    if (uso) {
        conditions.push('e.uso = ?');
        params.push(uso);
    }
    if (estado) {
        conditions.push('e.estado = ?');
        params.push(estado);
    }
    if (tipo_dispositivo) {
        conditions.push('e.tipo_dispositivo = ?');
        params.push(tipo_dispositivo);
    }

    let query = `
        SELECT e.*, c.nombre as categoria_nombre, u.nombre as ubicacion_nombre, m.nombre as marca_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN ubicaciones u ON e.ubicacion_id = u.id
        LEFT JOIN marcas m ON e.marca_id = m.id
    `;

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.fecha_creacion DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API para categorías
app.get('/api/categorias', (req, res) => {
    db.all('SELECT * FROM categorias ORDER BY nombre', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API para ubicaciones
app.get('/api/ubicaciones', (req, res) => {
    db.all('SELECT * FROM ubicaciones ORDER BY nombre', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API para marcas
app.get('/api/marcas', (req, res) => {
    db.all('SELECT * FROM marcas WHERE obsoleto = 0 ORDER BY nombre', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/marcas/todas', (req, res) => {
    db.all('SELECT * FROM marcas ORDER BY nombre', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/marcas', (req, res) => {
    const { nombre, descripcion } = req.body;

    db.run('INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Marca creada exitosamente' });
    });
});

app.put('/api/marcas/:id', (req, res) => {
    const { nombre, descripcion, obsoleto } = req.body;

    db.run('UPDATE marcas SET nombre = ?, descripcion = ?, obsoleto = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
        [nombre, descripcion, obsoleto ? 1 : 0, req.params.id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Marca no encontrada' });
                return;
            }
            res.json({ message: 'Marca actualizada exitosamente' });
        });
});

// API para salidas de equipos
app.get('/api/salidas', (req, res) => {
    const query = `
        SELECT s.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre, m.nombre as marca_nombre
        FROM salidas_equipos s
        LEFT JOIN equipos e ON s.equipo_id = e.id
        LEFT JOIN marcas m ON e.marca_id = m.id
        ORDER BY s.fecha_salida DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/salidas', (req, res) => {
    const { equipo_id, fecha_salida, motivo, destino, responsable, notas } = req.body;

    db.run('INSERT INTO salidas_equipos (equipo_id, fecha_salida, motivo, destino, responsable, notas) VALUES (?, ?, ?, ?, ?, ?)',
        [equipo_id, fecha_salida, motivo, destino, responsable, notas], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Salida registrada exitosamente' });
        });
});

// API para movimientos
app.get('/api/movimientos', (req, res) => {
    const query = `
        SELECT m.*, e.codigo as equipo_codigo, e.nombre as equipo_nombre,
               uo.nombre as ubicacion_origen, ud.nombre as ubicacion_destino
        FROM historial_movimientos m
        LEFT JOIN equipos e ON m.equipo_id = e.id
        LEFT JOIN ubicaciones uo ON m.ubicacion_origen_id = uo.id
        LEFT JOIN ubicaciones ud ON m.ubicacion_destino_id = ud.id
        ORDER BY m.fecha_movimiento DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/movimientos', (req, res) => {
    const { equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas } = req.body;

    db.run('INSERT INTO historial_movimientos (equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas) VALUES (?, ?, ?, ?, ?, ?)',
        [equipo_id, tipo_movimiento, ubicacion_origen_id, ubicacion_destino_id, usuario, notas], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Movimiento registrado exitosamente' });
        });
});

// API para estadísticas
app.get('/api/estadisticas', (req, res) => {
    const stats = {};

    // Total de equipos
    db.get('SELECT COUNT(*) as total FROM equipos', [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        stats.totalEquipos = row.total;

        // Equipos por uso
        db.get('SELECT COUNT(*) as total FROM equipos WHERE uso = "nuevo"', [], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            stats.equiposNuevos = row.total;

            db.get('SELECT COUNT(*) as total FROM equipos WHERE uso = "usado"', [], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                stats.equiposUsados = row.total;

                // Equipos por estado
                db.get('SELECT COUNT(*) as total FROM equipos WHERE estado = "buen estado"', [], (err, row) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    stats.equiposBuenEstado = row.total;

                    db.get('SELECT COUNT(*) as total FROM equipos WHERE estado = "malas condiciones"', [], (err, row) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        stats.equiposMalasCondiciones = row.total;

                        // Equipos por tipo de dispositivo
                        db.all('SELECT tipo_dispositivo, COUNT(*) as total FROM equipos GROUP BY tipo_dispositivo', [], (err, rows) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            stats.equiposPorTipo = rows;

                            // Equipos por ubicación
                            db.all(`
                                SELECT u.nombre, COUNT(e.id) as total 
                                FROM ubicaciones u 
                                LEFT JOIN equipos e ON u.id = e.ubicacion_id 
                                GROUP BY u.id, u.nombre
                            `, [], (err, rows) => {
                                if (err) {
                                    res.status(500).json({ error: err.message });
                                    return;
                                }
                                stats.equiposPorUbicacion = rows;

                                // Total de salidas
                                db.get('SELECT COUNT(*) as total FROM salidas_equipos', [], (err, row) => {
                                    if (err) {
                                        res.status(500).json({ error: err.message });
                                        return;
                                    }
                                    stats.totalSalidas = row.total;

                                    res.json(stats);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

