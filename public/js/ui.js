import { state } from './state.js';
import { cerrarModal, mostrarNotificacion } from './utils.js';

// ==================== RENDERIZADO DE TABLAS ====================

export function renderizarTablaEquipos(onEdit, onDelete) {
    const tbody = document.getElementById('tbodyEquipos');
    tbody.innerHTML = '';

    state.equipos.forEach(equipo => {
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
                <button class="btn btn-sm btn-primary edit-btn" data-id="${equipo.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${equipo.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        row.querySelector('.edit-btn').onclick = () => onEdit(equipo.id);
        row.querySelector('.delete-btn').onclick = () => onDelete(equipo.id);

        tbody.appendChild(row);
    });
}

export function renderizarTablaMarcas(onEdit, onToggle) {
    const tbody = document.getElementById('tbodyMarcas');
    tbody.innerHTML = '';

    state.marcas.forEach(marca => {
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
                <button class="btn btn-sm btn-primary edit-btn" data-id="${marca.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger toggle-btn" data-id="${marca.id}">
                    <i class="fas fa-${marca.obsoleto ? 'undo' : 'ban'}"></i>
                </button>
            </td>
        `;

        row.querySelector('.edit-btn').onclick = () => onEdit(marca.id);
        row.querySelector('.toggle-btn').onclick = () => onToggle(marca.id, !marca.obsoleto);

        tbody.appendChild(row);
    });
}

export function renderizarTablaCategorias(onEdit) {
    const tbody = document.getElementById('tbodyCategorias');
    tbody.innerHTML = '';

    state.categorias.forEach(categoria => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${categoria.nombre}</td>
            <td>${categoria.descripcion || 'N/A'}</td>
            <td>${new Date(categoria.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${categoria.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;

        row.querySelector('.edit-btn').onclick = () => onEdit(categoria.id);

        tbody.appendChild(row);
    });
}

export function renderizarTablaUbicaciones(onEdit) {
    const tbody = document.getElementById('tbodyUbicaciones');
    tbody.innerHTML = '';

    state.ubicaciones.forEach(ubicacion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ubicacion.nombre}</td>
            <td>${ubicacion.descripcion || 'N/A'}</td>
            <td>${new Date(ubicacion.fecha_creacion).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${ubicacion.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;

        row.querySelector('.edit-btn').onclick = () => onEdit(ubicacion.id);

        tbody.appendChild(row);
    });
}

export function renderizarTablaSalidas(onDelete) {
    const tbody = document.getElementById('tbodySalidas');
    tbody.innerHTML = '';

    state.salidas.forEach(salida => {
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
                <button class="btn btn-sm btn-danger delete-btn" data-id="${salida.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        row.querySelector('.delete-btn').onclick = () => onDelete(salida.id);

        tbody.appendChild(row);
    });
}

export function renderizarTablaMovimientos() {
    const tbody = document.getElementById('tbodyMovimientos');
    tbody.innerHTML = '';

    state.movimientos.forEach(movimiento => {
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

// ==================== MODALES Y SELECTS ====================

export function llenarSelectsFiltros() {
    const filtroMarca = document.getElementById('filtroMarca');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroUbicacion = document.getElementById('filtroUbicacion');

    filtroMarca.innerHTML = '<option value="">Todas las marcas</option>';
    state.marcas.forEach(marca => {
        if (!marca.obsoleto) {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.nombre;
            filtroMarca.appendChild(option);
        }
    });

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    state.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        filtroCategoria.appendChild(option);
    });

    filtroUbicacion.innerHTML = '<option value="">Todas las ubicaciones</option>';
    state.ubicaciones.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.id;
        option.textContent = ubicacion.nombre;
        filtroUbicacion.appendChild(option);
    });
}

export function mostrarModalEquipo(equipo = null) {
    state.equipoEditando = equipo;
    const modal = document.getElementById('modalEquipo');
    const titulo = document.getElementById('tituloModalEquipo');

    if (equipo) {
        titulo.textContent = 'Editar Equipo';
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
    } else {
        titulo.textContent = 'Nuevo Equipo';
        document.getElementById('formEquipo').reset();
        document.getElementById('fecha_adquisicion').value = new Date().toISOString().split('T')[0];
    }

    llenarSelectsFormEquipo();
    modal.style.display = 'block';
}

function llenarSelectsFormEquipo() {
    const selectMarca = document.getElementById('marca_id');
    const selectCategoria = document.getElementById('categoria_id');
    const selectUbicacion = document.getElementById('ubicacion_id');

    selectMarca.innerHTML = '<option value="">Seleccionar marca</option>';
    state.marcas.forEach(marca => {
        if (!marca.obsoleto) {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.nombre;
            selectMarca.appendChild(option);
        }
    });

    selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
    state.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        selectCategoria.appendChild(option);
    });

    selectUbicacion.innerHTML = '<option value="">Seleccionar ubicación</option>';
    state.ubicaciones.forEach(ubicacion => {
        const option = document.createElement('option');
        option.value = ubicacion.id;
        option.textContent = ubicacion.nombre;
        selectUbicacion.appendChild(option);
    });
}

// ==================== CONTINUACIÓN DE MODALES ====================

export function mostrarModalMarca(marca = null) {
    state.marcaEditando = marca;
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

export function mostrarModalCategoria(categoria = null) {
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

export function mostrarModalUbicacion(ubicacion = null) {
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

export function mostrarModalSalida() {
    const modal = document.getElementById('modalSalida');
    llenarSelectEquiposSalida();
    document.getElementById('formSalida').reset();
    document.getElementById('fecha_salida').value = new Date().toISOString().split('T')[0];
    modal.style.display = 'block';
}

function llenarSelectEquiposSalida() {
    const select = document.getElementById('equipo_id');
    select.innerHTML = '<option value="">Seleccionar equipo</option>';
    state.equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.id;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        select.appendChild(option);
    });
}

export function mostrarModalMovimiento() {
    const modal = document.getElementById('modalMovimiento');
    llenarSelectsMovimiento();
    document.getElementById('formMovimiento').reset();
    modal.style.display = 'block';
}

function llenarSelectsMovimiento() {
    const selectEquipo = document.getElementById('equipo_id_mov');
    selectEquipo.innerHTML = '<option value="">Seleccionar equipo</option>';
    state.equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.id;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        selectEquipo.appendChild(option);
    });

    const selectOrigen = document.getElementById('ubicacion_origen_id');
    const selectDestino = document.getElementById('ubicacion_destino_id');
    selectOrigen.innerHTML = '<option value="">Sin origen</option>';
    selectDestino.innerHTML = '<option value="">Sin destino</option>';

    state.ubicaciones.forEach(ubicacion => {
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

// ==================== GRÁFICOS Y REPORTES ====================

export function generarGraficoTipoDispositivo(datos) {
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

export function generarGraficoUbicacion(datos) {
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

export function generarReportes() {
    const reporteCategoria = document.getElementById('reporteCategoria');
    reporteCategoria.innerHTML = state.categorias.map(cat => {
        const count = state.equipos.filter(eq => eq.categoria_id === cat.id).length;
        return `${cat.nombre}: ${count}`;
    }).join('<br>') || 'No hay datos disponibles';

    const reporteUbicacion = document.getElementById('reporteUbicacion');
    reporteUbicacion.innerHTML = state.ubicaciones.map(ub => {
        const count = state.equipos.filter(eq => eq.ubicacion_id === ub.id).length;
        return `${ub.nombre}: ${count}`;
    }).join('<br>') || 'No hay datos disponibles';

    const reporteEstado = document.getElementById('reporteEstado');
    const estados = ['buen estado', 'malas condiciones', 'mantenimiento', 'retirado'];
    reporteEstado.innerHTML = estados.map(estado => {
        const count = state.equipos.filter(eq => eq.estado === estado).length;
        return `${estado}: ${count}`;
    }).join('<br>') || 'No hay datos disponibles';

    const reporteSalidas = document.getElementById('reporteSalidas');
    if (state.salidas.length > 0) {
        reporteSalidas.innerHTML = state.salidas.slice(0, 5).map(salida =>
            `${salida.equipo_codigo} - ${salida.fecha_salida}: ${salida.motivo}`
        ).join('<br>');
    } else {
        reporteSalidas.innerHTML = 'No hay salidas registradas';
    }
}
