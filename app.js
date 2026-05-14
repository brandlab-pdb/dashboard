/* ══ CONFIGURACIÓN DE CONEXIÓN ══ */
const SUPABASE_URL = 'https://tceebgtgazwxkehtbmml.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_XKmgTy_rVTW8pSYCeD7XUQ_oYp5UQ0F';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══ CONFIGURACIÓN DE ACCESO ══ */
const ACCESS_CODE = 'versiona2025'; // Ajustado al código que tienes en tu HTML
const SESSION_KEY = 'versiona_auth';

/* ══ NAVEGACIÓN DE PESTAÑAS (Ajustado a tu HTML) ══ */
function showView(viewId) {
    // 1. Quitar 'active' de todos los botones de navegación
    document.querySelectorAll('.ntab').forEach(btn => btn.classList.remove('active'));
    
    // 2. Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    
    // 3. Activar el botón correcto
    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    // 4. Mostrar la sección correcta
    const targetView = document.getElementById(`v-${viewId}`);
    if(targetView) targetView.classList.add('active');

    console.log("Cambiando a vista:", viewId);
}

/* ══ LÓGICA DE DATOS (Supabase) ══ */
async function fetchDashboardData() {
    console.log("Sincronizando con Supabase...");
    
    // Intentamos traer los proyectos para la vista de análisis o clientes
    const { data, error } = await supabaseClient
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error de conexión:', error.message);
        document.getElementById('save-ind').innerText = 'error ✕';
        document.getElementById('save-ind').style.color = 'var(--red)';
    } else {
        console.log('Datos recibidos:', data);
        document.getElementById('save-ind').innerText = 'sync ●';
        document.getElementById('save-ind').style.color = 'var(--green)';
        
        // Aquí podrías llamar a funciones que pinten los datos en el dashboard
        // renderProyectos(data); 
    }
}

/* ══ LÓGICA DE ACCESO (Login) ══ */
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    const overlay = document.getElementById('login-overlay');
    
    if (session === 'ok') {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        fetchDashboardData(); 
    } else {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}

function attemptLogin() {
    const input = document.getElementById('lo-in');
    const errorMsg = document.getElementById('lo-err');
    
    if (input.value.trim() === ACCESS_CODE) {
        sessionStorage.setItem(SESSION_KEY, 'ok');
        checkAuth();
    } else {
        errorMsg.classList.add('show');
        input.value = '';
        setTimeout(() => errorMsg.classList.remove('show'), 2000);
    }
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
}

/* ══ INICIO ══ */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Si la URL tiene un hash, intentar ir a esa pestaña
    const hash = window.location.hash.replace('#', '');
    if (hash) showView(hash);
});
