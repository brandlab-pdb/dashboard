/* ══ CONFIGURACIÓN ══ */
const ACCESS_CODE = 'usuario1'; // Nueva contraseña solicitada
const SESSION_KEY = 'versiona_auth';

/* ══ AUTH LOGIC ══ */
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    const overlay = document.getElementById('login-overlay');
    if (session === 'ok') {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }
}

function attemptLogin() {
    const input = document.getElementById('lo-in');
    const errorMsg = document.getElementById('lo-err');
    const val = input.value.trim();

    if (val === ACCESS_CODE) {
        sessionStorage.setItem(SESSION_KEY, 'ok');
        const overlay = document.getElementById('login-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.classList.add('hidden');
            checkAuth();
        }, 300);
    } else {
        errorMsg.classList.add('show');
        input.value = '';
        input.focus();
        // Quitar mensaje de error tras 2 segundos
        setTimeout(() => errorMsg.classList.remove('show'), 2000);
    }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Permitir "Enter" en el input
    const loginInput = document.getElementById('lo-in');
    if(loginInput) {
        loginInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
});
