# heriamezcua.com

Web personal y portfolio de Heri Amezcua, hecha con Astro.

## Requisitos

Node.js 22.23.4 o superior (versiones pares: 22, 24).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias. Solo la primera vez. |
| `npm run dev` | Arranca la web en local, en http://localhost:4321 |
| `npm run build` | Genera la web final en `dist/` |
| `npm run preview` | Sirve en local lo generado en `dist/` |

## Dónde está cada cosa

- `src/pages/index.astro`: la página, que monta las secciones en orden.
- `src/components/`: una sección por archivo (Hero, Projects, Experience, About, Contact).
- `src/scripts/platform.js`: el diagrama interactivo de la portada.
- `src/styles/global.css`: colores, tipografías y estilos.
- `src/layouts/Base.astro`: cabecera HTML, metadatos y fuentes.
- `public/`: archivos que se copian tal cual (favicon, robots.txt).
