// Variables globales
let equipos = [];
let categorias = [];
let ubicaciones = [];
let marcas = [];
let movimientos = [];
let salidas = [];
let equipoEditando = null;
let marcaEditando = null;

// Inicialización del sistema
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    configurarEventos();
});

async function inicializarSistema() {
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
        configurarFiltros();
    } catch (error) {
        console.error('Error al inicializar el sistema:', error);
        mostrarNotificacion('Error al cargar datos del sistema', 'error');
    }
}

function configurarEventos() {
    // Evento de búsqueda en tiempo real
    document.getElementById('busquedaEquipos').addEventListener('input', function(e) {
        if (e.target.value.length >= 3) {
            buscarEquipos(e.target.value);
        } else if (e.target.value.length === 0) {
            cargarEquipos();
        }
    });
}

// Navegación entre tabs
function cambiarTab(tabId) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(tabId).classList.add('active');
    
    // Activar botón correspondiente
    event.target.classList.add('active');
    
    // Cargar datos específicos del tab si es necesario
    switch(tabId) {
        case 'dashboard':
            cargarEstadisticas();
            break;
        case 'equipos':
            cargarEquipos();
            break;
        case 'marcas':
            cargarMarcas();
            break;
        case 'categorias':
            cargarCategorias();
            break;
        case 'ubicaciones':
            cargarUbicaciones();
            break;
        case 'salidas':
            cargarSalidas();
            break;
        case 'movimientos':
            cargarMovimientos();
            break;
        case 'reportes':
            generarReportes();
            break;
    }
}

// ==================== EQUIPOS ====================
async function cargarEquipos() {
    try {
        const response = await fetch('/api/equipos');
        equipos = await response.json();
        renderizarTablaEquipos();
    } catch (error) {
        console.error('Error al cargar equipos:', error);
        mostrarNotificacion('Error al cargar equipos', 'error');
    }
}

function renderizarTablaEquipos() {
    const tbody = document.getElementById('tbodyEquipos');
    tbody.innerHTML = '';
    
    equipos.forEach(equipo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${equipo.codigo}</td>
            <td>${equipo.nombre}</td>
            <td>${equipo.marca_nombre || 'N/A'}</td>
            <td>${equipo.modelo || 'N/A'}</td>
            <td>${equipo.tipo_dispositivo}</td>
            <td>${equipo.categoria_nombre || 'N/A'}</td>
            <td>${equipo.ubicacion_nombre || 'N/A'}</td>
            <td><span class="status-badge ${equipo.uso}">${equipo.uso}</span></td>
            <td><span class="status-badge ${equipo.estado.replace(' ', '-')}">${equipo.estado}</span></td>
            <td>${equipo.fecha_adquisicion || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarEquipo(${equipo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEquipo(${equipo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function buscarEquipos(termino) {
    try {
        const response = await fetch(`/api/equipos/buscar/${termino}`);
        equipos = await response.json();
        renderizarTablaEquipos();
    } catch (error) {
        console.error('Error al buscar equipos:', error);
        mostrarNotificacion('Error al buscar equipos', 'error');
    }
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
    
    // Filtrar valores vacíos
    const filtrosAplicados = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
    );
    
    try {
        const queryString = new URLSearchParams(filtrosAplicados).toString();
        const response = await fetch(`/api/equipos/filtros?${queryString}`);
        equipos = await response.json();
        renderizarTablaEquipos();
        mostrarNotificacion('Filtros aplicados correctamente', 'success');
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        mostrarNotificacion('Error al aplicar filtros', 'error');
    }
}

function limpiarFiltros() {
    document.getElementById('filtroMarca').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroUbicacion').value = '';
    document.getElementById('filtroUso').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroTipoDispositivo').value = '';
    cargarEquipos();
    mostrarNotificacion('Filtros limpiados', 'info');
}

function configurarFiltros() {
    // Llenar filtros con datos disponibles
    const filtroMarca = document.getElementById('filtroMarca');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroUbicacion = document.getElementById('filtroUbicacion');
    
    // Marca
    filtroMarca.innerHTML = '<option value="">Todas las marcas</option>';
    marcas.forEach(marca => {
        if (!marca.obsoleto) {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.nombre;
            filtroMarca.appendChild(option);
        }
    });
    
    // Categoría
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        filtroCategoria.appendChild(option);
    });
    
    // Ubicación
    filtroUbicacion.innerHTML = '<option value="">Todas las ubicaciones</option>';
    ubicaciones.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.id;
        option.textContent = ubicacion.nombre;
        filtroUbicacion.appendChild(option);
    });
}

function mostrarModalEquipo(equipo = null) {
    equipoEditando = equipo;
    const modal = document.getElementById('modalEquipo');
    const titulo = document.getElementById('tituloModalEquipo');
    
    if (equipo) {
        titulo.textContent = 'Editar Equipo';
        llenarFormularioEquipo(equipo);
    } else {
        titulo.textContent = 'Nuevo Equipo';
        document.getElementById('formEquipo').reset();
        // Establecer fecha actual por defecto
        document.getElementById('fecha_adquisicion').value = new Date().toISOString().split('T')[0];
    }
    
    llenarSelectsEquipo();
    modal.style.display = 'block';
}

function llenarFormularioEquipo(equipo) {
    document.getElementById('codigo').value = equipo.codigo;
    document.getElementById('nombre').value = equipo.nombre;
    document.getElementById('marca_id').value = equipo.marca_id || '';
    document.getElementById('modelo').value = equipo.modelo || '';
    document.getElementById('serie').value = equipo.serie || '';
    document.getElementById('tipo_dispositivo').value = equipo.tipo_dispositivo;
    document.getElementById('categoria_id').value = equipo.categoria_id || '';
    document.getElementById('ubicacion_id').value = equipo.ubicacion_id || '';
    document.getElementById('uso').value = equipo.uso;
    document.getElementById('estado').value = equipo.estado;
    document.getElementById('fecha_adquisicion').value = equipo.fecha_adquisicion || '';
    document.getElementById('proveedor').value = equipo.proveedor || '';
    document.getElementById('notas').value = equipo.notas || '';
}

function llenarSelectsEquipo() {
    // Llenar select de marcas
    const selectMarca = document.getElementById('marca_id');
    selectMarca.innerHTML = '<option value="">Seleccionar marca</option>';
    marcas.forEach(marca => {
        if (!marca.obsoleto) {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.nombre;
            selectMarca.appendChild(option);
        }
    });
    
    // Llenar select de categorías
    const selectCategoria = document.getElementById('categoria_id');
    selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        selectCategoria.appendChild(option);
    });
    
    // Llenar select de ubicaciones
    const selectUbicacion = document.getElementById('ubicacion_id');
    selectUbicacion.innerHTML = '<option value="">Seleccionar ubicación</option>';
    ubicaciones.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.id;
        option.textContent = ubicacion.nombre;
        selectUbicacion.appendChild(option);
    });
}

async function manejarSubmitEquipo(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosEquipo = {
        codigo: formData.get('codigo'),
        nombre: formData.get('nombre'),
        marca_id: formData.get('marca_id'),
        modelo: formData.get('modelo'),
        serie: formData.get('serie'),
        tipo_dispositivo: formData.get('tipo_dispositivo'),
        categoria_id: formData.get('categoria_id'),
        ubicacion_id: formData.get('ubicacion_id'),
        uso: formData.get('uso'),
        estado: formData.get('estado'),
        fecha_adquisicion: formData.get('fecha_adquisicion'),
        proveedor: formData.get('proveedor'),
        notas: formData.get('notas')
    };
    
    try {
        let response;
        if (equipoEditando) {
            response = await fetch(`/api/equipos/${equipoEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEquipo)
            });
        } else {
            response = await fetch('/api/equipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEquipo)
            });
        }
        
        if (response.ok) {
            mostrarNotificacion(
                equipoEditando ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente',
                'success'
            );
            cerrarModal('modalEquipo');
            cargarEquipos();
            cargarEstadisticas();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al guardar equipo:', error);
        mostrarNotificacion('Error al guardar equipo', 'error');
    }
}

async function editarEquipo(id) {
    const equipo = equipos.find(e => e.id === id);
    if (equipo) {
        mostrarModalEquipo(equipo);
    }
}

async function eliminarEquipo(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
        try {
            const response = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                mostrarNotificacion('Equipo eliminado correctamente', 'success');
                cargarEquipos();
                cargarEstadisticas();
            } else {
                throw new Error('Error al eliminar equipo');
            }
        } catch (error) {
            console.error('Error al eliminar equipo:', error);
            mostrarNotificacion('Error al eliminar equipo', 'error');
        }
    }
}

// ==================== MARCAS ====================
async function cargarMarcas() {
    try {
        const response = await fetch('/api/marcas/todas');
        marcas = await response.json();
        renderizarTablaMarcas();
    } catch (error) {
        console.error('Error al cargar marcas:', error);
        mostrarNotificacion('Error al cargar marcas', 'error');
    }
}

function renderizarTablaMarcas() {
    const tbody = document.getElementById('tbodyMarcas');
    tbody.innerHTML = '';
    
    marcas.forEach(marca => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${marca.nombre}</td>
            <td>${marca.descripcion || 'N/A'}</td>
            <td>
                <span class="status-badge ${marca.obsoleto ? 'retirado' : 'buen-estado'}">
                    ${marca.obsoleto ? 'Obsoleta' : 'Activa'}
                </span>
            </td>
            <td>${new Date(marca.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarMarca(${marca.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="toggleMarcaObsoleta(${marca.id}, ${!marca.obsoleto})">
                    <i class="fas fa-${marca.obsoleto ? 'undo' : 'ban'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalMarca(marca = null) {
    marcaEditando = marca;
    const modal = document.getElementById('modalMarca');
    const titulo = document.getElementById('tituloModalMarca');
    const obsoletoGroup = document.getElementById('obsoletoGroup');
    
    if (marca) {
        titulo.textContent = 'Editar Marca';
        document.getElementById('nombreMarca').value = marca.nombre;
        document.getElementById('descripcionMarca').value = marca.descripcion || '';
        document.getElementById('obsoleto').checked = marca.obsoleto;
        obsoletoGroup.style.display = 'block';
    } else {
        titulo.textContent = 'Nueva Marca';
        document.getElementById('formMarca').reset();
        obsoletoGroup.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

async function manejarSubmitMarca(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosMarca = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        obsoleto: marcaEditando ? formData.get('obsoleto') === 'on' : false
    };
    
    try {
        let response;
        if (marcaEditando) {
            response = await fetch(`/api/marcas/${marcaEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosMarca)
            });
        } else {
            response = await fetch('/api/marcas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosMarca)
            });
        }
        
        if (response.ok) {
            mostrarNotificacion(
                marcaEditando ? 'Marca actualizada correctamente' : 'Marca creada correctamente',
                'success'
            );
            cerrarModal('modalMarca');
            cargarMarcas();
            configurarFiltros();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al guardar marca:', error);
        mostrarNotificacion('Error al guardar marca', 'error');
    }
}

async function editarMarca(id) {
    const marca = marcas.find(m => m.id === id);
    if (marca) {
        mostrarModalMarca(marca);
    }
}

async function toggleMarcaObsoleta(id, obsoleto) {
    const accion = obsoleto ? 'marcar como obsoleta' : 'reactivar';
    if (confirm(`¿Estás seguro de que quieres ${accion} esta marca?`)) {
        try {
            const marca = marcas.find(m => m.id === id);
            const response = await fetch(`/api/marcas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: marca.nombre,
                    descripcion: marca.descripcion,
                    obsoleto: obsoleto
                })
            });
            
            if (response.ok) {
                mostrarNotificacion(`Marca ${accion} correctamente`, 'success');
                cargarMarcas();
                configurarFiltros();
            } else {
                throw new Error('Error al actualizar marca');
            }
        } catch (error) {
            console.error('Error al actualizar marca:', error);
            mostrarNotificacion('Error al actualizar marca', 'error');
        }
    }
}

// ==================== CATEGORÍAS ====================
async function cargarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        categorias = await response.json();
        renderizarTablaCategorias();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarNotificacion('Error al cargar categorías', 'error');
    }
}

function renderizarTablaCategorias() {
    const tbody = document.getElementById('tbodyCategorias');
    tbody.innerHTML = '';
    
    categorias.forEach(categoria => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${categoria.nombre}</td>
            <td>${categoria.descripcion || 'N/A'}</td>
            <td>${new Date(categoria.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarCategoria(${categoria.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalCategoria(categoria = null) {
    const modal = document.getElementById('modalCategoria');
    const titulo = document.getElementById('tituloModalCategoria');
    
    if (categoria) {
        titulo.textContent = 'Editar Categoría';
        document.getElementById('nombreCategoria').value = categoria.nombre;
        document.getElementById('descripcionCategoria').value = categoria.descripcion || '';
    } else {
        titulo.textContent = 'Nueva Categoría';
        document.getElementById('formCategoria').reset();
    }
    
    modal.style.display = 'block';
}

async function manejarSubmitCategoria(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosCategoria = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion')
    };
    
    try {
        const response = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCategoria)
        });
        
        if (response.ok) {
            mostrarNotificacion('Categoría creada correctamente', 'success');
            cerrarModal('modalCategoria');
            cargarCategorias();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        mostrarNotificacion('Error al guardar categoría', 'error');
    }
}

function editarCategoria(id) {
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
        mostrarModalCategoria(categoria);
    }
}

// ==================== UBICACIONES ====================
async function cargarUbicaciones() {
    try {
        const response = await fetch('/api/ubicaciones');
        ubicaciones = await response.json();
        renderizarTablaUbicaciones();
    } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        mostrarNotificacion('Error al cargar ubicaciones', 'error');
    }
}

function renderizarTablaUbicaciones() {
    const tbody = document.getElementById('tbodyUbicaciones');
    tbody.innerHTML = '';
    
    ubicaciones.forEach(ubicacion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ubicacion.nombre}</td>
            <td>${ubicacion.descripcion || 'N/A'}</td>
            <td>${new Date(ubicacion.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarUbicacion(${ubicacion.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalUbicacion(ubicacion = null) {
    const modal = document.getElementById('modalUbicacion');
    const titulo = document.getElementById('tituloModalUbicacion');
    
    if (ubicacion) {
        titulo.textContent = 'Editar Ubicación';
        document.getElementById('nombreUbicacion').value = ubicacion.nombre;
        document.getElementById('descripcionUbicacion').value = ubicacion.descripcion || '';
    } else {
        titulo.textContent = 'Nueva Ubicación';
        document.getElementById('formUbicacion').reset();
    }
    
    modal.style.display = 'block';
}

async function manejarSubmitUbicacion(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosUbicacion = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion')
    };
    
    try {
        const response = await fetch('/api/ubicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUbicacion)
        });
        
        if (response.ok) {
            mostrarNotificacion('Ubicación creada correctamente', 'success');
            cerrarModal('modalUbicacion');
            cargarUbicaciones();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al guardar ubicación:', error);
        mostrarNotificacion('Error al guardar ubicación', 'error');
    }
}

function editarUbicacion(id) {
    const ubicacion = ubicaciones.find(u => u.id === id);
    if (ubicacion) {
        mostrarModalUbicacion(ubicacion);
    }
}

// ==================== SALIDAS DE EQUIPOS ====================
async function cargarSalidas() {
    try {
        const response = await fetch('/api/salidas');
        salidas = await response.json();
        renderizarTablaSalidas();
    } catch (error) {
        console.error('Error al cargar salidas:', error);
        mostrarNotificacion('Error al cargar salidas', 'error');
    }
}

function renderizarTablaSalidas() {
    const tbody = document.getElementById('tbodySalidas');
    tbody.innerHTML = '';
    
    salidas.forEach(salida => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${salida.equipo_codigo} - ${salida.equipo_nombre}</td>
            <td>${salida.marca_nombre || 'N/A'}</td>
            <td>${salida.fecha_salida}</td>
            <td>${salida.motivo}</td>
            <td>${salida.destino || 'N/A'}</td>
            <td>${salida.responsable || 'N/A'}</td>
            <td>${salida.notas || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="eliminarSalida(${salida.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalSalida() {
    const modal = document.getElementById('modalSalida');
    llenarSelectEquiposSalida();
    document.getElementById('formSalida').reset();
    document.getElementById('fecha_salida').value = new Date().toISOString().split('T')[0];
    modal.style.display = 'block';
}

function llenarSelectEquiposSalida() {
    const select = document.getElementById('equipo_id');
    select.innerHTML = '<option value="">Seleccionar equipo</option>';
    
    equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.id;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        select.appendChild(option);
    });
}

async function manejarSubmitSalida(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosSalida = {
        equipo_id: formData.get('equipo_id'),
        fecha_salida: formData.get('fecha_salida'),
        motivo: formData.get('motivo'),
        destino: formData.get('destino'),
        responsable: formData.get('responsable'),
        notas: formData.get('notas')
    };
    
    try {
        const response = await fetch('/api/salidas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosSalida)
        });
        
        if (response.ok) {
            mostrarNotificacion('Salida registrada correctamente', 'success');
            cerrarModal('modalSalida');
            cargarSalidas();
            cargarEstadisticas();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al registrar salida:', error);
        mostrarNotificacion('Error al registrar salida', 'error');
    }
}

async function eliminarSalida(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta salida?')) {
        try {
            // Nota: Aquí deberías implementar el endpoint DELETE para salidas
            mostrarNotificacion('Funcionalidad de eliminación no implementada', 'warning');
        } catch (error) {
            console.error('Error al eliminar salida:', error);
            mostrarNotificacion('Error al eliminar salida', 'error');
        }
    }
}

// ==================== MOVIMIENTOS ====================
async function cargarMovimientos() {
    try {
        const response = await fetch('/api/movimientos');
        movimientos = await response.json();
        renderizarTablaMovimientos();
    } catch (error) {
        console.error('Error al cargar movimientos:', error);
        mostrarNotificacion('Error al cargar movimientos', 'error');
    }
}

function renderizarTablaMovimientos() {
    const tbody = document.getElementById('tbodyMovimientos');
    tbody.innerHTML = '';
    
    movimientos.forEach(movimiento => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movimiento.equipo_codigo} - ${movimiento.equipo_nombre}</td>
            <td>${movimiento.tipo_movimiento}</td>
            <td>${movimiento.ubicacion_origen || 'N/A'}</td>
            <td>${movimiento.ubicacion_destino || 'N/A'}</td>
            <td>${new Date(movimiento.fecha_movimiento).toLocaleDateString()}</td>
            <td>${movimiento.usuario || 'N/A'}</td>
            <td>${movimiento.notas || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalMovimiento() {
    const modal = document.getElementById('modalMovimiento');
    llenarSelectsMovimiento();
    document.getElementById('formMovimiento').reset();
    modal.style.display = 'block';
}

function llenarSelectsMovimiento() {
    // Llenar select de equipos
    const selectEquipo = document.getElementById('equipo_id_mov');
    selectEquipo.innerHTML = '<option value="">Seleccionar equipo</option>';
    equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.id;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        selectEquipo.appendChild(option);
    });
    
    // Llenar selects de ubicaciones
    const selectOrigen = document.getElementById('ubicacion_origen_id');
    const selectDestino = document.getElementById('ubicacion_destino_id');
    
    selectOrigen.innerHTML = '<option value="">Sin origen</option>';
    selectDestino.innerHTML = '<option value="">Sin destino</option>';
    
    ubicaciones.forEach(ubicacion => {
        const optionOrigen = document.createElement('option');
        optionOrigen.value = ubicacion.id;
        optionOrigen.textContent = ubicacion.nombre;
        selectOrigen.appendChild(optionOrigen);
        
        const optionDestino = document.createElement('option');
        optionDestino.value = ubicacion.id;
        optionDestino.textContent = ubicacion.nombre;
        selectDestino.appendChild(optionDestino);
    });
}

async function manejarSubmitMovimiento(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosMovimiento = {
        equipo_id: formData.get('equipo_id'),
        tipo_movimiento: formData.get('tipo_movimiento'),
        ubicacion_origen_id: formData.get('ubicacion_origen_id') || null,
        ubicacion_destino_id: formData.get('ubicacion_destino_id') || null,
        usuario: formData.get('usuario'),
        notas: formData.get('notas')
    };
    
    try {
        const response = await fetch('/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMovimiento)
        });
        
        if (response.ok) {
            mostrarNotificacion('Movimiento registrado correctamente', 'success');
            cerrarModal('modalMovimiento');
            cargarMovimientos();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al registrar movimiento:', error);
        mostrarNotificacion('Error al registrar movimiento', 'error');
    }
}

// ==================== ESTADÍSTICAS ====================
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/estadisticas');
        const stats = await response.json();
        
        // Actualizar contadores
        document.getElementById('totalEquipos').textContent = stats.totalEquipos;
        document.getElementById('equiposNuevos').textContent = stats.equiposNuevos;
        document.getElementById('equiposUsados').textContent = stats.equiposUsados;
        document.getElementById('equiposBuenEstado').textContent = stats.equiposBuenEstado;
        document.getElementById('equiposMalasCondiciones').textContent = stats.equiposMalasCondiciones;
        document.getElementById('totalSalidas').textContent = stats.totalSalidas;
        
        // Generar gráficos
        generarGraficoTipoDispositivo(stats.equiposPorTipo);
        generarGraficoUbicacion(stats.equiposPorUbicacion);
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function generarGraficoTipoDispositivo(datos) {
    const container = document.getElementById('chartTipoDispositivo');
    container.innerHTML = '';
    
    if (datos && datos.length > 0) {
        datos.forEach(item => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                margin: 0.25rem 0;
                background: #e9ecef;
                border-radius: 5px;
            `;
            bar.innerHTML = `
                <span>${item.tipo_dispositivo}</span>
                <span style="font-weight: bold; color: #3498db;">${item.total}</span>
            `;
            container.appendChild(bar);
        });
    } else {
        container.innerHTML = '<p>No hay datos disponibles</p>';
    }
}

function generarGraficoUbicacion(datos) {
    const container = document.getElementById('chartUbicacion');
    container.innerHTML = '';
    
    if (datos && datos.length > 0) {
        datos.forEach(item => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                margin: 0.25rem 0;
                background: #e9ecef;
                border-radius: 5px;
            `;
            bar.innerHTML = `
                <span>${item.nombre}</span>
                <span style="font-weight: bold; color: #3498db;">${item.total}</span>
            `;
            container.appendChild(bar);
        });
    } else {
        container.innerHTML = '<p>No hay datos disponibles</p>';
    }
}

// ==================== REPORTES ====================
function generarReportes() {
    generarReporteCategoria();
    generarReporteUbicacion();
    generarReporteEstado();
    generarReporteSalidas();
}

function generarReporteCategoria() {
    const container = document.getElementById('reporteCategoria');
    const reporte = categorias.map(cat => {
        const count = equipos.filter(eq => eq.categoria_id === cat.id).length;
        return `${cat.nombre}: ${count}`;
    }).join('<br>');
    
    container.innerHTML = reporte || 'No hay datos disponibles';
}

function generarReporteUbicacion() {
    const container = document.getElementById('reporteUbicacion');
    const reporte = ubicaciones.map(ub => {
        const count = equipos.filter(eq => eq.ubicacion_id === ub.id).length;
        return `${ub.nombre}: ${count}`;
    }).join('<br>');
    
    container.innerHTML = reporte || 'No hay datos disponibles';
}

function generarReporteEstado() {
    const container = document.getElementById('reporteEstado');
    const estados = ['buen estado', 'malas condiciones', 'mantenimiento', 'retirado'];
    const reporte = estados.map(estado => {
        const count = equipos.filter(eq => eq.estado === estado).length;
        return `${estado}: ${count}`;
    }).join('<br>');
    
    container.innerHTML = reporte || 'No hay datos disponibles';
}

function generarReporteSalidas() {
    const container = document.getElementById('reporteSalidas');
    if (salidas.length > 0) {
        const reporte = salidas.slice(0, 5).map(salida => 
            `${salida.equipo_codigo} - ${salida.fecha_salida}: ${salida.motivo}`
        ).join('<br>');
        container.innerHTML = reporte;
    } else {
        container.innerHTML = 'No hay salidas registradas';
    }
}

// ==================== UTILIDADES ====================
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    equipoEditando = null;
    marcaEditando = null;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Estilos según tipo
    switch(tipo) {
        case 'success':
            notificacion.style.background = '#28a745';
            break;
        case 'error':
            notificacion.style.background = '#dc3545';
            break;
        case 'warning':
            notificacion.style.background = '#ffc107';
            notificacion.style.color = '#212529';
            break;
        default:
            notificacion.style.background = '#17a2b8';
    }
    
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Agregar estilos CSS para las animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

