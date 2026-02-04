# Estructura de la Base de Datos

El sistema utiliza **SQLite 3** para el almacenamiento de datos. A continuación se detalla el esquema de tablas y sus relaciones.

## Diagrama de Entidad-Relación (ERD)

```mermaid
erDiagram
    usuarios ||--o{ roles : "tiene"
    usuarios ||--o{ refresh_tokens : "posee"
    usuarios ||--o{ logs_actividad : "genera"
    equipos }|--|| marcas : "fabricado por"
    equipos }|--|| categorias : "clasificado en"
    equipos }|--|| ubicaciones : "situado en"
    equipos ||--o{ salidas_equipos : "registra salida"
    equipos ||--o{ historial_movimientos : "registra rastro"
    historial_movimientos }|--o| ubicaciones : "origen/destino"

    usuarios {
        int id PK
        string username
        string email
        string password_hash
        string nombre_completo
        int rol_id FK
        bool activo
        datetime ultimo_inicio_sesion
    }

    roles {
        int id PK
        string nombre
        int nivel_permiso
    }

    equipos {
        int id PK
        string codigo
        string nombre
        int marca_id FK
        string modelo
        string tipo_dispositivo
        int categoria_id FK
        int ubicacion_id FK
        string uso
        string estado
    }

    salidas_equipos {
        int id PK
        int equipo_id FK
        date fecha_salida
        string motivo
    }

    marcas {
        int id PK
        string nombre
        bool obsoleto
    }
```

## Descripción de Tablas Principales

### 1. `equipos`
Almacena el inventario principal de hardware.
- `codigo`: Identificador único (ej: PC001).
- `uso`: Enum ('nuevo', 'usado').
- `estado`: Enum ('buen estado', 'malas condiciones', 'mantenimiento', 'retirado').

### 2. `usuarios` y `roles`
Gestión de acceso y permisos.
- **Roles predefinidos**:
    - `Super Administrador` (100): Acceso total.
    - `Administrador` (80): Gestión general.
    - `Técnico` (50): Operaciones de hardware.
    - `Usuario` (10): Consulta básica.

### 3. `historial_movimientos`
Bitácora de todos los traslados físicos de los equipos entre ubicaciones.

### 4. `salidas_equipos`
Registro definitivo de equipos que abandonan el inventario (bajas, ventas, donaciones).

### 5. `logs_actividad`
Auditoría técnica de cambios en la base de datos (quién cambió qué y cuándo).

---

## Mantenimiento
Los backups se generan automáticamente con el formato `inventario-backup-YYYYMMDD_HHMMSS.db` antes de realizar operaciones críticas de estructura.
