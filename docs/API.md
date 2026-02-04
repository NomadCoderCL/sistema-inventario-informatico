# Documentación de la API REST

Todas las peticiones a la API (excepto `/api/auth/login`) requieren el encabezado `Authorization: Bearer <JWT_TOKEN>`.

## 🔐 Autenticación

### POST `/api/auth/login`
Inicia sesión y obtiene el token JWT.
- **Body**: `{ "username": "...", "password": "..." }`
- **Response**: `200 OK` con el token y datos del usuario.

### GET `/api/auth/verify`
Valida el token actual.
- **Header**: `Authorization: Bearer <token>`
- **Response**: `200 OK` con los datos del usuario.

---

## 💻 Equipos

### GET `/api/equipos`
Obtiene todos los equipos del inventario.

### GET `/api/equipos/buscar/:termino`
Busca equipos por código, nombre, marca o modelo.

### GET `/api/equipos/filtros`
Filtra equipos mediante Query Params.
- **Params**: `marca_id`, `categoria_id`, `ubicacion_id`, `uso`, `estado`.

### POST `/api/equipos`
Crea un nuevo equipo.
- **Body**: `{ "codigo": "...", "nombre": "...", "marca_id": 1, ... }`

---

## 🏷️ Marcas, Categorías y Ubicaciones

### GET `/api/marcas/todas`
Retorna todas las marcas (incluyendo obsoletas).

### GET `/api/categorias`
Lista todas las categorías.

### GET `/api/ubicaciones`
Lista todas las ubicaciones.

---

## 📊 Estadísticas y Otros

### GET `/api/estadisticas`
Obtiene contadores globales y agrupaciones para el Dashboard.

### GET `/api/movimientos`
Historial de trazabilidad.

### POST `/api/salidas`
Registra la salida (baja) de un equipo.
- **Body**: `{ "equipo_id": 1, "motivo": "...", "responsable": "..." }`

---

## Códigos de Respuesta comunes

- `200 OK`: Petición exitosa.
- `201 Created`: Recurso creado exitosamente.
- `401 Unauthorized`: Token faltante o inválido.
- `403 Forbidden`: Nivel de permiso insuficiente.
- `404 Not Found`: El recurso solicitado no existe.
- `500 Internal Server Error`: Error inesperado en el servidor.
