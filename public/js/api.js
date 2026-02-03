import { state } from './state.js';
import { handleLogout } from './auth.js';

export async function apiFetch(url, options = {}) {
    if (!state.authToken) {
        handleLogout();
        throw new Error('No hay token de sesión');
    }

    const headers = {
        'Authorization': `Bearer ${state.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            handleLogout();
            throw new Error('Sesión expirada');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }

        return result;
    } catch (error) {
        console.error(`Error en apiFetch (${url}):`, error);
        throw error;
    }
}

// Equipos
export const equipoApi = {
    getAll: () => apiFetch('/api/equipos'),
    search: (termino) => apiFetch(`/api/equipos/buscar/${termino}`),
    filter: (queryString) => apiFetch(`/api/equipos/filtros?${queryString}`),
    getById: (id) => apiFetch(`/api/equipos/${id}`),
    create: (data) => apiFetch('/api/equipos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/equipos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/api/equipos/${id}`, { method: 'DELETE' })
};

// Marcas
export const marcaApi = {
    getAll: () => apiFetch('/api/marcas/todas'),
    create: (data) => apiFetch('/api/marcas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/marcas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// Categorías
export const categoriaApi = {
    getAll: () => apiFetch('/api/categorias'),
    create: (data) => apiFetch('/api/categorias', { method: 'POST', body: JSON.stringify(data) })
};

// Ubicaciones
export const ubicacionApi = {
    getAll: () => apiFetch('/api/ubicaciones'),
    create: (data) => apiFetch('/api/ubicaciones', { method: 'POST', body: JSON.stringify(data) })
};

// Salidas
export const salidaApi = {
    getAll: () => apiFetch('/api/salidas'),
    create: (data) => apiFetch('/api/salidas', { method: 'POST', body: JSON.stringify(data) })
};

// Movimientos
export const movimientoApi = {
    getAll: () => apiFetch('/api/movimientos'),
    create: (data) => apiFetch('/api/movimientos', { method: 'POST', body: JSON.stringify(data) })
};

// Estadísticas
export const estadisticaApi = {
    get: () => apiFetch('/api/estadisticas')
};
