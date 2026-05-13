# Versiona PM Dashboard - Guía de Desarrollo

## Estructura del Proyecto
- `index.html`: Estructura principal y contenedores.
- `style.css`: Variables de diseño (Dark Mode), animaciones y layout.
- `app.js`: Lógica de negocio, gestión de LocalStorage y autenticación.

## Reglas de Código
- **Nomenclatura**: Usar camelCase para JavaScript y kebab-case para clases CSS.
- **Estilo**: Mantener la estética minimalista y oscura (#0a0a0a).
- **Auth**: La contraseña actual es `usuario1`. No eliminar el sistema de `sessionStorage`.
- **Datos**: Los leads y tareas se guardan en `localStorage`.

## Comandos Útiles
- Para actualizar el diseño: Editar variables en `:root` dentro de `style.css`.
- Para nuevas secciones: Añadir el contenedor en `index.html` y la función de render en `app.js`.
