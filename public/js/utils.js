import { state } from './state.js';

export function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    state.equipoEditando = null;
    state.marcaEditando = null;
}

export function mostrarNotificacion(mensaje, tipo = 'info') {
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

    switch (tipo) {
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

    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

export function showOverlay(mensaje = 'Cargando...') {
    let overlay = document.getElementById('global-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-overlay';
        overlay.className = 'overlay-loader';
        overlay.innerHTML = `
            <div class="loader"></div>
            <p style="margin-top: 1rem; font-weight: 500; color: #2c3e50;">${mensaje}</p>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('p').textContent = mensaje;
        overlay.style.display = 'flex';
    }
}

export function hideOverlay() {
    const overlay = document.getElementById('global-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Inicializar estilos de animación si no existen
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
}
