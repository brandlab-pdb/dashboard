/* ══ CONFIGURACIÓN DE CONEXIÓN ══ */
const SUPABASE_URL = 'https://tceebgtgazwxkehtbmml.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_XKmgTy_rVTW8pSYCeD7XUQ_oYp5UQ0F';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══ CONFIGURACIÓN DE ACCESO ══ */
const ACCESS_CODE = 'usuario1';
const SESSION_KEY = 'versiona_auth';

/* ══ NAVEGACIÓN DE PESTAÑAS ══ */
function switchTab(tabId) {
    // Quitar 'active' de todos los botones y ocultar todos los contenidos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    
    // Activar el botón presionado
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    // Mostrar el contenido correspondiente
    const activeContent = document.getElementById(tabId);
    if(activeContent) activeContent.classList.remove('hidden');

    console.log("Navegando a:", tabId);
}

/* ══ LÓGICA DE DATOS (Supabase) ══ */
async function fetchProyectos() {
    console.log("Conectando con Supabase...");
    const { data, error } = await supabaseClient
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al traer datos:', error.message);
    } else {
        console.log('Datos sincronizados:', data);
        renderProyectos(data);
    }
}

function renderProyectos(proyectos) {
    const container = document.getElementById('proyectos-grid');
    if(!container) return;

    if (proyectos.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay proyectos en la nube.</div>';
        return;
    }

    container.innerHTML = proyectos.map(p => `
        <div class="project-card">
            <h3>${p.nombre_proyecto || 'Sin nombre'}</h3>
            <p>Estado: <span class="status-tag">${p.estado || 'Pendiente'}</span></p>
            <div class="progress-bar">
                <div class="progress" style="width: ${p.progreso || 0}%"></div>
            </div>
        </div>
    `).join('');
}

/* ══ LÓGICA DE ACCESO (Login) ══ */
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    const overlay = document.getElementById('login-overlay');
    
    if (session === 'ok') {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        fetchProyectos(); // Carga los proyectos de Supabase al entrar
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
        setTimeout(() => errorMsg.classList.remove('show'), 2000);
    }
}

// Iniciar sistema
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
