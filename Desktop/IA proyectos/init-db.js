const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const dbPath = path.join(__dirname, 'inventario.db');
const db = new sqlite3.Database(dbPath);

// Función para hashear contraseñas
const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

db.serialize(() => {
    // Tabla de categorías (tipos de equipo)
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de ubicaciones (bodegas)
    db.run(`CREATE TABLE IF NOT EXISTS ubicaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de marcas con soft delete
    db.run(`CREATE TABLE IF NOT EXISTS marcas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        obsoleto BOOLEAN DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de equipos actualizada
    db.run(`CREATE TABLE IF NOT EXISTS equipos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        marca_id INTEGER,
        modelo TEXT,
        serie TEXT,
        tipo_dispositivo TEXT NOT NULL,
        categoria_id INTEGER,
        ubicacion_id INTEGER,
        uso TEXT CHECK(uso IN ('nuevo', 'usado')) DEFAULT 'nuevo',
        estado TEXT CHECK(estado IN ('buen estado', 'malas condiciones', 'mantenimiento', 'retirado')) DEFAULT 'buen estado',
        fecha_adquisicion DATE,
        proveedor TEXT,
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marca_id) REFERENCES marcas (id),
        FOREIGN KEY (categoria_id) REFERENCES categorias (id),
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id)
    )`);

    // Tabla de salidas de equipos
    db.run(`CREATE TABLE IF NOT EXISTS salidas_equipos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipo_id INTEGER NOT NULL,
        fecha_salida DATE NOT NULL,
        motivo TEXT NOT NULL,
        destino TEXT,
        responsable TEXT,
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipo_id) REFERENCES equipos (id)
    )`);

    // Tabla de historial de movimientos
    db.run(`CREATE TABLE IF NOT EXISTS historial_movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipo_id INTEGER NOT NULL,
        tipo_movimiento TEXT NOT NULL,
        ubicacion_origen_id INTEGER,
        ubicacion_destino_id INTEGER,
        fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuario TEXT,
        notas TEXT,
        FOREIGN KEY (equipo_id) REFERENCES equipos (id),
        FOREIGN KEY (ubicacion_origen_id) REFERENCES ubicaciones (id),
        FOREIGN KEY (ubicacion_destino_id) REFERENCES ubicaciones (id)
    )`);

    // Tabla de roles de usuario
    db.run(`CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        nivel_permiso INTEGER NOT NULL DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        nombre_completo TEXT,
        rol_id INTEGER,
        activo BOOLEAN DEFAULT 1,
        ultimo_inicio_sesion DATETIME,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles (id)
    )`);

    // Tabla de tokens de refresco
    db.run(`CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expiracion DATETIME NOT NULL,
        revocado BOOLEAN DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )`);

    // Tabla de logs de actividad
    db.run(`CREATE TABLE IF NOT EXISTS logs_actividad (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        tabla_afectada TEXT,
        registro_afectado_id INTEGER,
        datos_anteriores TEXT,
        datos_nuevos TEXT,
        direccion_ip TEXT,
        user_agent TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )`);

    // Insertar datos de ejemplo
    db.run(`INSERT OR IGNORE INTO categorias (nombre, descripcion) VALUES 
        ('Computadoras', 'Equipos de cómputo completos'),
        ('Laptops', 'Computadoras portátiles'),
        ('Monitores', 'Pantallas y displays'),
        ('Periféricos', 'Teclados, mouse, etc.'),
        ('Redes', 'Switches, routers, etc.'),
        ('Almacenamiento', 'Discos duros, SSDs, etc.')`);

    db.run(`INSERT OR IGNORE INTO ubicaciones (nombre, descripcion) VALUES 
        ('Bodega 1', 'Almacén principal de equipos'),
        ('Bodega 2', 'Almacén secundario'),
        ('Bodega 3', 'Almacén de equipos especializados'),
        ('Oficina Central', 'Ubicación administrativa'),
        ('Sala de Servidores', 'Centro de datos')`);

    db.run(`INSERT OR IGNORE INTO marcas (nombre, descripcion) VALUES 
        ('Dell', 'Fabricante de equipos informáticos'),
        ('HP', 'Hewlett-Packard'),
        ('Lenovo', 'Fabricante chino de computadoras'),
        ('Samsung', 'Electrónicos y displays'),
        ('LG', 'Monitores y displays'),
        ('Apple', 'Equipos Mac y dispositivos iOS'),
        ('ASUS', 'Placas base y laptops'),
        ('MSI', 'Gaming y equipos especializados')`);

    // Insertar roles por defecto
    db.run(`INSERT OR IGNORE INTO roles (id, nombre, descripcion, nivel_permiso) VALUES 
        (1, 'Super Administrador', 'Acceso total al sistema', 100),
        (2, 'Administrador', 'Administra el sistema con restricciones', 80),
        (3, 'Técnico', 'Puede gestionar equipos y mantenimientos', 50),
        (4, 'Usuario', 'Acceso básico de solo lectura', 10)`);

    // Insertar usuario administrador por defecto (usuario: admin, contraseña: Admin123!)
    const adminPassword = hashPassword('Admin123!');
    db.run(`INSERT OR IGNORE INTO usuarios (id, username, email, password_hash, nombre_completo, rol_id) VALUES 
        (1, 'admin', 'admin@inventario.local', '${adminPassword}', 'Administrador del Sistema', 1)`);

    db.run(`INSERT OR IGNORE INTO equipos (codigo, nombre, marca_id, modelo, serie, tipo_dispositivo, categoria_id, ubicacion_id, uso, estado, fecha_adquisicion, proveedor, notas) VALUES 
        ('PC001', 'PC Dell OptiPlex', 1, 'OptiPlex 7090', 'SN001', 'PC', 1, 1, 'nuevo', 'buen estado', '2024-01-15', 'Dell Directo', 'Equipo de oficina'),
        ('LAP001', 'Laptop HP EliteBook', 2, 'EliteBook 840', 'SN002', 'laptop', 2, 1, 'usado', 'buen estado', '2023-06-20', 'HP Store', 'Laptop ejecutiva'),
        ('MON001', 'Monitor Samsung', 4, '24" LED', 'SN003', 'monitor', 3, 2, 'nuevo', 'buen estado', '2024-02-10', 'Samsung Store', 'Monitor de 24 pulgadas'),
        ('PC002', 'PC Lenovo ThinkCentre', 3, 'ThinkCentre M90', 'SN004', 'PC', 1, 1, 'usado', 'malas condiciones', '2022-12-05', 'Lenovo Store', 'Necesita mantenimiento'),
        ('LAP002', 'Laptop Dell Latitude', 1, 'Latitude 5520', 'SN005', 'laptop', 2, 3, 'nuevo', 'buen estado', '2024-03-01', 'Dell Directo', 'Laptop para desarrollo')`);

    console.log('Base de datos inicializada correctamente');
});

db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos cerrada');
    }
});

