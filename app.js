/* ══ CONFIGURACIÓN DE CONEXIÓN ══ */
const SUPABASE_URL = 'ESCRIBE_AQUI_TU_URL'; // La sacas de tu captura
const SUPABASE_KEY = 'ESCRIBE_AQUI_TU_ANON_KEY'; // La sacas de tu captura
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══ CONFIGURACIÓN DE ACCESO ══ */
const ACCESS_CODE = 'usuario1';
const SESSION_KEY = 'versiona_auth';

console.log("Sistema Versiona conectado a Supabase.");

/* ══ LÓGICA DE DATOS (CRUD) ══ */

// Función para leer proyectos de la base de datos
async function fetchProyectos() {
    const { data, error } = await supabaseClient
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar proyectos:', error);
    } else {
        console.log('Proyectos cargados:', data);
        // Aquí llamarás a tu función de renderizado, ej: renderProyectos(data);
    }
}

/* ══ LÓGICA DE ACCESO (Login) ══ */
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    const overlay = document.getElementById('login-overlay');
    if (!overlay) return;

    if (session === 'ok') {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        fetchProyectos(); // Cargamos datos solo si está logueado
    } else {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
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
        overlay.style.transition = 'opacity 0.4s ease';
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            checkAuth();
        }, 400);
    } else {
        errorMsg.classList.add('show');
        input.value = '';
        input.focus();
        setTimeout(() => errorMsg.classList.remove('show'), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
