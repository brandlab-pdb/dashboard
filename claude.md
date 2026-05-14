# Versiona PM Dashboard — Guía para Claude Code

## Contexto del Proyecto
Dashboard de project management para el equipo de Versiona (Brand Lab PDB).
Operamos en el Bajío, México. 14 clientes activos.

**Equipo:**
- Arturo → dirección, comunicación, propuestas, seguimiento de clientes
- Ek → operación, producción, diseño, video, ads
- Diego → PM, edición, coordinación

## Estructura del Repositorio
```
/
├── index.html      → Dashboard principal (login + todas las vistas)
├── style.css       → Variables de diseño, Dark Mode, animaciones
├── app.js          → Lógica, navegación, conexión Supabase
└── CLAUDE.md       → Este archivo
```

> ⚠️ No existe ningún archivo `dashboard.html`. Si aparece, elimínalo — es un duplicado de una versión anterior.

## Autenticación
- Contraseña de acceso: `versiona2025`
- Storage: `sessionStorage`, key: `versiona_auth`
- El overlay de login tiene id `login-overlay` con clase `.hidden` para ocultar

## Navegación (cómo funciona)
- Función principal: `showView('nombre-vista')`
- Los botones en el navbar tienen `data-view="nombre"` y `onclick="showView('nombre')"`
- Las secciones tienen IDs con prefijo `v-`: `v-analisis`, `v-clientes`, `v-equipo`, `v-bloqueados`, `v-ia`, `v-whatsapp`

## Vistas Existentes
| Vista | ID | Descripción |
|---|---|---|
| Análisis | `v-analisis` | Resumen semanal, KPIs, semáforo, equipo |
| Clientes | `v-clientes` | Sidebar con lista + panel de detalle |
| Equipo | `v-equipo` | Carga por persona |
| Bloqueados | `v-bloqueados` | Tareas en espera de cliente |
| IA | `v-ia` | Extracción de tareas con Claude API |
| WhatsApp | `v-whatsapp` | Briefing diario por persona |

## Supabase
- URL: `https://tceebgtgazwxkehtbmml.supabase.co`
- Client: variable `supabaseClient`
- Tabla: `proyectos`
- Columnas actuales: `id`, `created_at`, `nombre_proyecto`, `cliente`, `estado`, `prioridad`, `deadline`, `progreso`, `notas`

## Clientes Activos (Contexto de Negocio)
SG Arquitectura Arte, Micaela, MX Travel, La Chula de Barrio, Plaza Altavia,
Osos Basquetbol, Osos Flag, Gaby Mar y Tierra, Evolve, JLFC/AO,
Jessy, Editora de Café, Nura, Admin/General

## Estándares de Código
- **CSS**: Variables en `:root`, dark mode por defecto, tema claro con `[data-theme="light"]`
- **JS**: `camelCase` para funciones, `kebab-case` para IDs y clases CSS
- **Fuentes**: DM Sans (cuerpo) + DM Serif Display (títulos)
- **Colores de semáforo**: `--green: #4ade80`, `--yellow: #facc15`, `--red: #f87171`

## Flujo de Trabajo para Claude
1. Leer siempre este archivo antes de hacer cambios
2. Verificar IDs existentes en `index.html` antes de crear funciones en `app.js`
3. No romper el sistema de login
4. Mantener compatibilidad entre `style.css` y las clases usadas en `index.html`
5. Siempre crear un Pull Request — nunca push directo a `main`

## Restricciones Absolutas
- NO modificar `.github/workflows/claude.yml`
- NO cambiar la contraseña sin documentarlo aquí
- NO instalar dependencias sin aprobación explícita
- NO hacer push directo a `main` o `develop`
- NO exponer credenciales en el código fuente
- NO usar `rm -rf` ni comandos destructivos
