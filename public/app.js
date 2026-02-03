import { state } from './js/state.js';
import { checkAuth, handleLogin, handleLogout } from './js/auth.js';
import { equipoApi, marcaApi, categoriaApi, ubicacionApi, salidaApi, movimientoApi, estadisticaApi } from './js/api.js';
import {
    renderizarTablaEquipos, renderizarTablaMarcas, renderizarTablaCategorias,
    renderizarTablaUbicaciones, renderizarTablaSalidas, renderizarTablaMovimientos,
    llenarSelectsFiltros, mostrarModalEquipo, mostrarModalMarca,
    mostrarModalCategoria, mostrarModalUbicacion, mostrarModalSalida,
    mostrarModalMovimiento, generarGraficoTipoDispositivo, generarGraficoUbicacion,
    generarReportes
} from './js/ui.js';
import { cerrarModal, mostrarNotificacion, showOverlay, hideOverlay } from './js/utils.js';

// Inicialización del sistema
document.addEventListener('DOMContentLoaded', function () {
    checkAuth(inicializarSistema);
    configurarEventosGlobales();
});

async function inicializarSistema() {
    showOverlay('Cargando sistema...');
    try {
        await Promise.all([
            cargarEquipos(),
            cargarCategorias(),
            cargarUbicaciones(),
            cargarMarcas(),
            cargarMovimientos(),
            cargarSalidas()
        ]);

        cargarEstadisticas();
        llenarSelectsFiltros();
    } catch (error) {
        console.error('Error al inicializar el sistema:', error);
        mostrarNotificacion('Error al cargar datos del sistema', 'error');
    } finally {
        hideOverlay();
    }
}

function configurarEventosGlobales() {
    // Evento de login
    document.getElementById('login-form').onsubmit = (e) => handleLogin(e, inicializarSistema);

    // Botón Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = handleLogout;

    // Búsqueda en tiempo real
    document.getElementById('busquedaEquipos').addEventListener('input', (e) => {
        if (e.target.value.length >= 3) {
            buscarEquipos(e.target.value);
        } else if (e.target.value.length === 0) {
            cargarEquipos();
        }
    });

    // Menú lateral / Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const onclickAttr = e.currentTarget.getAttribute('onclick');
            // Si el atributo existe y tiene el formato esperado
            if (onclickAttr) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    cambiarTab(match[1], e.currentTarget);
                }
            }
        };
        // No removemos el onclick del HTML por seguridad, pero el JS lo sobreescribe
    });

    // Eventos de botones "Añadir"
    setupClick('[onclick*="mostrarModalEquipo"]', () => mostrarModalEquipo());
    setupClick('[onclick*="mostrarModalMarca"]', () => mostrarModalMarca());
    setupClick('[onclick*="mostrarModalCategoria"]', () => mostrarModalCategoria());
    setupClick('[onclick*="mostrarModalUbicacion"]', () => mostrarModalUbicacion());
    setupClick('[onclick*="mostrarModalSalida"]', () => mostrarModalSalida());
    setupClick('[onclick*="mostrarModalMovimiento"]', () => mostrarModalMovimiento());

    // Formularios
    document.getElementById('formEquipo').onsubmit = manejarSubmitEquipo;
    document.getElementById('formMarca').onsubmit = manejarSubmitMarca;
    document.getElementById('formCategoria').onsubmit = manejarSubmitCategoria;
    document.getElementById('formUbicacion').onsubmit = manejarSubmitUbicacion;
    document.getElementById('formSalida').onsubmit = manejarSubmitSalida;
    document.getElementById('formMovimiento').onsubmit = manejarSubmitMovimiento;

    // Filtros
    setupClick('[onclick*="aplicarFiltros"]', aplicarFiltros);
    setupClick('[onclick*="limpiarFiltros"]', limpiarFiltros);

    // Cerrar modales (clic fuera)
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Globales mínimas
    window.cerrarModal = cerrarModal;
}

function setupClick(selector, callback) {
    const el = document.querySelector(selector);
    if (el) {
        el.onclick = (e) => {
            e.preventDefault();
            callback();
        };
    }
}

// ==================== LÓGICA DE ORQUESTACIÓN ====================

function cambiarTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    if (tabId === 'dashboard') cargarEstadisticas();
    if (tabId === 'reportes') generarReportes();
}

// --- EQUIPOS ---
async function cargarEquipos() {
    try {
        state.equipos = await equipoApi.getAll();
        renderizarTablaEquipos(editarEquipo, eliminarEquipo);
    } catch (e) { mostrarNotificacion('Error al cargar equipos', 'error'); }
}

async function buscarEquipos(termino) {
    try {
        state.equipos = await equipoApi.search(termino);
        renderizarTablaEquipos(editarEquipo, eliminarEquipo);
    } catch (e) { mostrarNotificacion('Error al buscar equipos', 'error'); }
}

async function aplicarFiltros() {
    const filtros = {
        marca_id: document.getElementById('filtroMarca').value,
        categoria_id: document.getElementById('filtroCategoria').value,
        ubicacion_id: document.getElementById('filtroUbicacion').value,
        uso: document.getElementById('filtroUso').value,
        estado: document.getElementById('filtroEstado').value,
        tipo_dispositivo: document.getElementById('filtroTipoDispositivo').value
    };
    const query = new URLSearchParams(Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v !== ''))).toString();
    showOverlay('Aplicando filtros...');
    try {
        state.equipos = await equipoApi.filter(query);
        renderizarTablaEquipos(editarEquipo, eliminarEquipo);
        mostrarNotificacion('Filtros aplicados', 'success');
    } catch (e) { mostrarNotificacion('Error al filtrar', 'error'); }
    finally { hideOverlay(); }
}

function limpiarFiltros() {
    ['filtroMarca', 'filtroCategoria', 'filtroUbicacion', 'filtroUso', 'filtroEstado', 'filtroTipoDispositivo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    cargarEquipos();
}

async function manejarSubmitEquipo(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showOverlay('Guardando equipo...');
    try {
        if (state.equipoEditando) await equipoApi.update(state.equipoEditando.id, data);
        else await equipoApi.create(data);
        mostrarNotificacion('Equipo guardado', 'success');
        cerrarModal('modalEquipo');
        await cargarEquipos();
        await cargarEstadisticas();
    } catch (e) { mostrarNotificacion('Error al guardar equipo', 'error'); }
    finally { hideOverlay(); }
}

function editarEquipo(id) {
    const equipo = state.equipos.find(e => e.id === id);
    if (equipo) mostrarModalEquipo(equipo);
}

async function eliminarEquipo(id) {
    if (confirm('¿Está seguro de que desea eliminar este equipo?')) {
        showOverlay('Eliminando equipo...');
        try {
            await equipoApi.delete(id);
            mostrarNotificacion('Equipo eliminado correctamente', 'success');
            await cargarEquipos();
            await cargarEstadisticas();
        } catch (e) { mostrarNotificacion('Error al eliminar equipo', 'error'); }
        finally { hideOverlay(); }
    }
}

// --- MARCAS ---
async function cargarMarcas() {
    try {
        state.marcas = await marcaApi.getAll();
        renderizarTablaMarcas(editarMarca, toggleMarcaObsoleta);
    } catch (e) { mostrarNotificacion('Error al cargar marcas', 'error'); }
}

function editarMarca(id) {
    const marca = state.marcas.find(m => m.id === id);
    if (marca) mostrarModalMarca(marca);
}

async function manejarSubmitMarca(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.obsoleto = data.obsoleto === 'on';
    showOverlay('Guardando marca...');
    try {
        if (state.marcaEditando) await marcaApi.update(state.marcaEditando.id, data);
        else await marcaApi.create(data);
        mostrarNotificacion('Marca guardada', 'success');
        cerrarModal('modalMarca');
        await cargarMarcas();
        llenarSelectsFiltros();
    } catch (e) { mostrarNotificacion('Error al guardar marca', 'error'); }
    finally { hideOverlay(); }
}

async function toggleMarcaObsoleta(id, obsoleto) {
    const marca = state.marcas.find(m => m.id === id);
    if (confirm(`¿Está seguro de que desea ${obsoleto ? 'desactivar' : 'activar'} esta marca?`)) {
        showOverlay('Actualizando marca...');
        try {
            await marcaApi.update(id, { ...marca, obsoleto });
            mostrarNotificacion(`Marca ${obsoleto ? 'desactivada' : 'activada'}`, 'success');
            await cargarMarcas();
            llenarSelectsFiltros();
        } catch (e) { mostrarNotificacion('Error al actualizar marca', 'error'); }
        finally { hideOverlay(); }
    }
}

// --- CATEGORIAS ---
async function cargarCategorias() {
    try {
        state.categorias = await categoriaApi.getAll();
        renderizarTablaCategorias(editarCategoria);
    } catch (e) { mostrarNotificacion('Error al cargar categorías', 'error'); }
}

async function manejarSubmitCategoria(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showOverlay('Guardando categoría...');
    try {
        await categoriaApi.create(data);
        mostrarNotificacion('Categoría guardada', 'success');
        cerrarModal('modalCategoria');
        await cargarCategorias();
        llenarSelectsFiltros();
    } catch (e) { mostrarNotificacion('Error al guardar categoría', 'error'); }
    finally { hideOverlay(); }
}

function editarCategoria(id) {
    const cat = state.categorias.find(c => c.id === id);
    if (cat) mostrarModalCategoria(cat);
}

// --- UBICACIONES ---
async function cargarUbicaciones() {
    try {
        state.ubicaciones = await ubicacionApi.getAll();
        renderizarTablaUbicaciones(editarUbicacion);
    } catch (e) { mostrarNotificacion('Error al cargar ubicaciones', 'error'); }
}

async function manejarSubmitUbicacion(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showOverlay('Guardando ubicación...');
    try {
        await ubicacionApi.create(data);
        mostrarNotificacion('Ubicación guardada', 'success');
        cerrarModal('modalUbicacion');
        await cargarUbicaciones();
        llenarSelectsFiltros();
    } catch (e) { mostrarNotificacion('Error al guardar ubicación', 'error'); }
    finally { hideOverlay(); }
}

function editarUbicacion(id) {
    const ub = state.ubicaciones.find(u => u.id === id);
    if (ub) mostrarModalUbicacion(ub);
}

// --- SALIDAS ---
async function cargarSalidas() {
    try {
        state.salidas = await salidaApi.getAll();
        renderizarTablaSalidas(eliminarSalida);
    } catch (e) { mostrarNotificacion('Error al cargar salidas', 'error'); }
}

async function manejarSubmitSalida(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showOverlay('Registrando salida...');
    try {
        await salidaApi.create(data);
        mostrarNotificacion('Salida registrada', 'success');
        cerrarModal('modalSalida');
        await cargarSalidas();
        await cargarEstadisticas();
    } catch (e) { mostrarNotificacion('Error al registrar salida', 'error'); }
    finally { hideOverlay(); }
}

async function eliminarSalida(id) {
    mostrarNotificacion('Funcionalidad de eliminación no implementada en backend', 'warning');
}

// --- MOVIMIENTOS ---
async function cargarMovimientos() {
    try {
        state.movimientos = await movimientoApi.getAll();
        renderizarTablaMovimientos();
    } catch (e) { mostrarNotificacion('Error al cargar movimientos', 'error'); }
}

async function manejarSubmitMovimiento(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showOverlay('Registrando movimiento...');
    try {
        await movimientoApi.create(data);
        mostrarNotificacion('Movimiento registrado', 'success');
        cerrarModal('modalMovimiento');
        await cargarMovimientos();
        await cargarEquipos();
    } catch (e) { mostrarNotificacion('Error al registrar movimiento', 'error'); }
    finally { hideOverlay(); }
}

// --- ESTADISTICAS ---
async function cargarEstadisticas() {
    try {
        const stats = await estadisticaApi.get();
        document.getElementById('totalEquipos').textContent = stats.totalEquipos;
        document.getElementById('equiposNuevos').textContent = stats.equiposNuevos;
        document.getElementById('equiposUsados').textContent = stats.equiposUsados;
        document.getElementById('equiposBuenEstado').textContent = stats.equiposBuenEstado;
        document.getElementById('equiposMalasCondiciones').textContent = stats.equiposMalasCondiciones;
        document.getElementById('totalSalidas').textContent = stats.totalSalidas;
        generarGraficoTipoDispositivo(stats.equiposPorTipo);
        generarGraficoUbicacion(stats.equiposPorUbicacion);
    } catch (e) { console.error('Error stats:', e); }
}
