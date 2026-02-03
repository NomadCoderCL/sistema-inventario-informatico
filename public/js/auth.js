import { state } from './state.js';

export function showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

export function showApp() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    const userDisplay = document.getElementById('display-user');
    if (userDisplay && state.currentUser) {
        userDisplay.textContent = `Bienvenido, ${state.currentUser.nombre_completo || state.currentUser.username}`;
    }
}

export async function checkAuth(onSuccess, onFailure) {
    if (!state.authToken) {
        showLogin();
        if (onFailure) onFailure();
        return;
    }

    try {
        const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${state.authToken}` }
        });

        if (response.ok) {
            const result = await response.json();
            state.currentUser = result.data;
            showApp();
            if (onSuccess) onSuccess();
        } else {
            handleLogout();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        handleLogout();
    }
}

export async function handleLogin(event, onSuccess) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.style.display = 'none';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            state.authToken = result.data.token;
            state.currentUser = result.data.usuario;
            localStorage.setItem('authToken', state.authToken);
            showApp();
            if (onSuccess) onSuccess();
        } else {
            errorDiv.textContent = result.message || 'Error al iniciar sesión';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorDiv.textContent = 'Error de conexión con el servidor';
        errorDiv.style.display = 'block';
    }
}

export function handleLogout() {
    state.authToken = null;
    state.currentUser = null;
    localStorage.removeItem('authToken');
    showLogin();
}
