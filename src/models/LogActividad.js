const { query, run } = require('./db');

class LogActividad {
    // Registrar una nueva actividad
    static async crear(usuarioId, accion, tablaAfectada = null, registroAfectadoId = null, datosAnteriores = null, datosNuevos = null, requestInfo = {}) {
        const { ip, userAgent } = requestInfo;
        
        await run(
            `INSERT INTO logs_actividad 
            (usuario_id, accion, tabla_afectada, registro_afectado_id, datos_anteriores, datos_nuevos, direccion_ip, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioId,
                accion,
                tablaAfectada,
                registroAfectadoId,
                datosAnterios ? JSON.stringify(datosAnterios) : null,
                datosNuevos ? JSON.stringify(datosNuevos) : null,
                ip || null,
                userAgent || null
            ]
        );
    }

    // Obtener logs con filtros
    static async buscar(filtros = {}) {
        const {
            usuarioId,
            accion,
            tablaAfectada,
            fechaInicio,
            fechaFin,
            pagina = 1,
            porPagina = 50
        } = filtros;

        const where = [];
        const params = [];
        const offset = (pagina - 1) * porPagina;

        if (usuarioId) {
            where.push('l.usuario_id = ?');
            params.push(usuarioId);
        }

        if (accion) {
            where.push('l.accion LIKE ?');
            params.push(`%${accion}%`);
        }

        if (tablaAfectada) {
            where.push('l.tabla_afectada = ?');
            params.push(tablaAfectada);
        }

        if (fechaInicio) {
            where.push('l.fecha_creacion >= ?');
            params.push(new Date(fechaInicio).toISOString());
        }

        if (fechaFin) {
            where.push('l.fecha_creacion <= ?');
            params.push(new Date(fechaFin).toISOString());
        }

        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

        // Obtener el total de registros
        const totalQuery = `
            SELECT COUNT(*) as total 
            FROM logs_actividad l
            ${whereClause}
        `;
        const totalResult = await query(totalQuery, params);
        const total = totalResult[0].total;

        // Obtener los registros paginados
        const logsQuery = `
            SELECT l.*, u.username, u.email, u.nombre_completo
            FROM logs_actividad l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ${whereClause}
            ORDER BY l.fecha_creacion DESC
            LIMIT ? OFFSET ?
        `;
        
        const registros = await query(logsQuery, [...params, porPagina, offset]);

        return {
            total,
            pagina,
            totalPaginas: Math.ceil(total / porPagina),
            porPagina,
            registros: registros.map(log => ({
                ...log,
                datos_anteriores: log.datos_anteriores ? JSON.parse(log.datos_anteriores) : null,
                datos_nuevos: log.datos_nuevos ? JSON.parse(log.datos_nuevos) : null
            }))
        };
    }

    // Métodos de ayuda para acciones comunes
    static async logInicioSesion(usuarioId, requestInfo) {
        return await this.crear(usuarioId, 'INICIO_SESION', null, null, null, null, requestInfo);
    }

    static async logCierreSesion(usuarioId, requestInfo) {
        return await this.crear(usuarioId, 'CIERRE_SESION', null, null, null, null, requestInfo);
    }

    static async logCreacion(usuarioId, tabla, registroId, datosNuevos, requestInfo) {
        return await this.crear(usuarioId, 'CREACION', tabla, registroId, null, datosNuevos, requestInfo);
    }

    static async logActualizacion(usuarioId, tabla, registroId, datosAnteriores, datosNuevos, requestInfo) {
        return await this.crear(usuarioId, 'ACTUALIZACION', tabla, registroId, datosAnteriores, datosNuevos, requestInfo);
    }

    static async logEliminacion(usuarioId, tabla, registroId, datosAnteriores, requestInfo) {
        return await this.crear(usuarioId, 'ELIMINACION', tabla, registroId, datosAnteriores, null, requestInfo);
    }
}

module.exports = LogActividad;
