/* ══ CONFIGURACIÓN ══ */
const ACCESS_CODE = 'usuario1'; // NUEVA CONTRASEÑA
const SESSION_KEY = 'versiona_auth';

console.log("Sistema Versiona Cargado. Contraseña activa: " + ACCESS_CODE);

/* ══ LÓGICA DE ACCESO ══ */
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    const overlay = document.getElementById('login-overlay');
    
    if (!overlay) return; // Seguridad por si el DOM no carga a tiempo

    if (session === 'ok') {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    } else {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}

function attemptLogin() {
    const input = document.getElementById('lo-in');
    const errorMsg = document.getElementById('lo-err');
    const val = input.value.trim();

    console.log("Intento de login con:", val); // Para que veas qué está leyendo el sistema

    if (val === ACCESS_CODE) {
        sessionStorage.setItem(SESSION_KEY, 'ok');
        const overlay = document.getElementById('login-overlay');
        
        // Animación de salida
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            checkAuth();
        }, 400);
    } else {
        // Error visual
        errorMsg.classList.add('show');
        input.value = '';
        input.focus();
        
        // Quitar mensaje de error tras 2 segundos
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 2000);
    }
}

// Inicialización cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
