# Sistema de Inventario de Equipos Informáticos

Un sistema completo y moderno para la gestión de inventario de equipos informáticos, desarrollado con Node.js, Express y SQLite.

## 🚀 Características

- **Dashboard completo** con estadísticas en tiempo real
- **Gestión de equipos** (CRUD completo)
- **Categorización** de equipos por tipo
- **Control de ubicaciones** con edificios y pisos
- **Seguimiento de movimientos** (entrada, salida, transferencia, mantenimiento)
- **Búsqueda avanzada** de equipos
- **Reportes detallados** del inventario
- **Interfaz moderna y responsive** con diseño Material Design
- **Base de datos SQLite** para fácil despliegue

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Iconos**: Font Awesome
- **Diseño**: CSS Grid, Flexbox, Gradientes

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto
```bash
# Si tienes Git instalado
git clone <url-del-repositorio>
cd sistema-inventario-equipos

# O simplemente descarga y extrae el archivo ZIP
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Inicializar la base de datos
```bash
npm run init-db
```

### 4. Iniciar el servidor
```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

### 5. Acceder al sistema
Abre tu navegador y ve a: `http://localhost:3000`

## 📱 Uso del Sistema

### Dashboard
- **Vista general** del inventario
- **Estadísticas en tiempo real** (total equipos, activos, en mantenimiento, retirados)
- **Gráficos** de distribución por categoría y ubicación
- **Valor total** del inventario

### Gestión de Equipos
- **Agregar nuevos equipos** con información completa
- **Editar equipos** existentes
- **Eliminar equipos** del inventario
- **Buscar equipos** por código, nombre, marca, modelo o serie
- **Filtros por estado** (Activo, Inactivo, Mantenimiento, Retirado)

### Categorías
- **Crear categorías** para organizar equipos
- **Gestionar descripciones** de cada categoría
- **Vista en tarjetas** para fácil navegación

### Ubicaciones
- **Definir ubicaciones** físicas (edificios, pisos)
- **Organizar equipos** por ubicación
- **Control de espacios** de almacenamiento

### Movimientos
- **Registrar entradas** de nuevos equipos
- **Controlar salidas** de equipos
- **Seguir transferencias** entre ubicaciones
- **Registrar mantenimientos** y reparaciones
- **Historial completo** de todos los movimientos

### Reportes
- **Distribución por categoría** con conteos
- **Estado de equipos** con estadísticas visuales
- **Movimientos recientes** del inventario

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `equipos`
- Información completa de cada equipo
- Código único, nombre, marca, modelo, serie
- Categoría y ubicación (relaciones)
- Estado, fecha de adquisición, valor
- Proveedor y notas adicionales

#### `categorias`
- Organización de equipos por tipo
- Nombre y descripción

#### `ubicaciones`
- Ubicaciones físicas de almacenamiento
- Edificio, piso y descripción

#### `historial_movimientos`
- Registro completo de todos los movimientos
- Tipo de movimiento, fechas, responsables
- Ubicaciones de origen y destino

## 🔧 Configuración

### Variables de Entorno
El sistema utiliza el puerto 3000 por defecto. Puedes cambiarlo modificando la variable `PORT` en `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### Base de Datos
La base de datos SQLite se crea automáticamente en el directorio raíz como `inventario.db`. Para cambiar la ubicación, modifica la ruta en `server.js`:

```javascript
const db = new sqlite3.Database('./inventario.db');
```

## 📊 API Endpoints

### Equipos
- `GET /api/equipos` - Obtener todos los equipos
- `GET /api/equipos/:id` - Obtener equipo por ID
- `POST /api/equipos` - Crear nuevo equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo
- `GET /api/equipos/buscar/:termino` - Buscar equipos

### Categorías
- `GET /api/categorias` - Obtener todas las categorías
- `POST /api/categorias` - Crear nueva categoría

### Ubicaciones
- `GET /api/ubicaciones` - Obtener todas las ubicaciones
- `POST /api/ubicaciones` - Crear nueva ubicación

### Movimientos
- `GET /api/movimientos` - Obtener historial de movimientos
- `POST /api/movimientos` - Registrar nuevo movimiento

### Estadísticas
- `GET /api/estadisticas` - Obtener estadísticas del inventario

## 🎨 Personalización

### Colores y Estilos
Los estilos se pueden personalizar editando `public/styles.css`. El sistema utiliza variables CSS para facilitar la personalización.

### Iconos
El sistema utiliza Font Awesome. Puedes cambiar los iconos modificando las clases en el HTML.

### Funcionalidades
Para agregar nuevas funcionalidades, puedes:
1. Crear nuevas rutas en `server.js`
2. Agregar nuevos campos en la base de datos
3. Extender la interfaz en `public/index.html`
4. Implementar la lógica en `public/script.js`

## 🚀 Despliegue en Producción

### 1. Preparar el servidor
```bash
# Instalar dependencias de producción
npm install --production

# Construir la aplicación (si es necesario)
npm run build
```

### 2. Configurar variables de entorno
```bash
export PORT=3000
export NODE_ENV=production
```

### 3. Usar un gestor de procesos
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start server.js --name "inventario-equipos"

# Configurar inicio automático
pm2 startup
pm2 save
```

### 4. Configurar proxy reverso (Nginx)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que SQLite3 esté instalado correctamente
- Asegúrate de que el directorio tenga permisos de escritura
- Ejecuta `npm run init-db` para recrear la base de datos

### Puerto ya en uso
- Cambia el puerto en `server.js`
- O termina el proceso que esté usando el puerto 3000

### Errores de dependencias
- Elimina `node_modules` y `package-lock.json`
- Ejecuta `npm install` nuevamente

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda:

- Abre un issue en el repositorio
- Revisa la documentación de la API
- Consulta los logs del servidor para debugging

## 🔮 Próximas Características

- [ ] Exportación a Excel/PDF
- [ ] Códigos QR para equipos
- [ ] Sistema de usuarios y permisos
- [ ] Notificaciones por email
- [ ] API REST completa
- [ ] Aplicación móvil
- [ ] Backup automático de base de datos
- [ ] Logs de auditoría detallados

---

**¡Disfruta usando tu sistema de inventario! 🎉**





