# Feliz día de las flores amarillas 💛

Una experiencia web romántica e interactiva construida con **HTML, CSS y JavaScript puro** (sin frameworks ni librerías externas). Todos los elementos visuales —girasoles, mariposas, partículas y el papel de regalo— se generan y animan en tiempo real con código, no con imágenes ni video.

## Cómo abrir el proyecto

1. Abre la carpeta en Visual Studio Code.
2. Instala la extensión **Live Server** (si no la tienes).
3. Clic derecho sobre `index.html` → **Open with Live Server**.
4. También funciona abriendo `index.html` directamente en el navegador (doble clic), aunque se recomienda Live Server para evitar restricciones del navegador con `file://`.

## Estructura del proyecto

```
/
├── index.html      → estructura de la pantalla de bienvenida y la escena
├── style.css       → variables, fondo, animaciones y estilos responsive
├── script.js       → generación de girasoles/mariposas/partículas y la línea de tiempo
├── README.md
└── assets/
    └── music.mp3   → (opcional) agrega aquí tu propia canción
```

## Qué hace la experiencia

1. **Pantalla de bienvenida**: minimalista, con el botón "Abrir mi regalo 💛".
2. Al hacer clic, aparece la escena nocturna con una transición suave y comienza una animación de **~35-40 segundos** dividida en 5 fases:
   - **Fase 1 (0-7s)**: partículas doradas y las primeras mariposas cruzan la pantalla.
   - **Fase 2 (7-15s)**: aparecen más mariposas, los primeros girasoles del ramo y el texto principal.
   - **Fase 3 (15-25s)**: el ramo se completa, aumentan las mariposas y aparecen los primeros mensajes.
   - **Fase 4 (25-35s)**: el ramo se vuelve el elemento protagonista (brillo suave), se suman más mariposas, partículas y los mensajes finales.
   - **Fase 5 (35-40s)**: estado final cálido: el ramo respira suavemente, las mariposas y partículas siguen con vida y los mensajes flotan alrededor.
3. Todo continúa animándose de forma sutil después de la fase 5 (las mariposas se reciclan con nuevas trayectorias, las partículas parpadean, el ramo respira).

## Controles

- **Abrir mi regalo 💛**: inicia la experiencia.
- **🔈 Botón de sonido** (esquina inferior derecha): activa o silencia la música de fondo. **Nunca se reproduce audio automáticamente**; requiere una interacción explícita del usuario.
- **↺ Botón de reinicio** (esquina inferior derecha, discreto): reinicia toda la animación desde la Fase 1 sin recargar la página ni volver a la pantalla de bienvenida.

## Música (opcional)

El proyecto está preparado para reproducir música de fondo, pero **no incluye ningún archivo de audio** (para no depender de contenido con derechos de autor). Para activarla:

1. Coloca tu archivo en `assets/music.mp3`.
2. Listo — el botón de sonido detectará el archivo automáticamente y permitirá reproducirlo/pausarlo.

Si el archivo no existe, el botón de sonido se deshabilita solo (sin generar errores en consola).

## Detalles técnicos

- **Girasoles**: generados como SVG desde `script.js` (pétalos con `<path>`, centro con degradado radial y textura de semillas siguiendo el ángulo áureo/phyllotaxis), sin imágenes externas.
- **Mariposas**: SVG generado dinámicamente con alas de dos lóbulos por lado y aleteo animado por CSS (`@keyframes flap-left/flap-right`). El movimiento (curvas, velocidad, profundidad delante/detrás del ramo) se calcula por JavaScript usando `requestAnimationFrame`.
- **Partículas**: dibujadas en un `<canvas>` con brillo (`shadowBlur`) y parpadeo sutil, también animadas con `requestAnimationFrame`.
- **Papel de regalo**: forma cónica lograda con `clip-path`, degradados y capas superpuestas (`::before`/`::after` y "pliegues") para simular dobleces de papel.
- **Responsive**: el ramo ocupa ~55-65% del ancho en celular y se centra con espacio lateral en escritorio; no hay scroll horizontal; los textos usan `clamp()` para escalar.
- **Accesibilidad**: respeta `prefers-reduced-motion` reduciendo/quitando animaciones no esenciales.

## Personalizar

- **Textos y frases**: edita los arreglos `MESSAGES` y los textos del `<header>` en `index.html` / `script.js`.
- **Colores**: todos los colores están centralizados como variables CSS en `:root` dentro de `style.css`.
- **Cantidad de girasoles/mariposas/partículas**: ajusta `SUNFLOWER_SLOTS`, `butterflyTarget` y `particleTarget` en `script.js`.
- **Tiempos de la animación**: modifica los valores de `after(ms, …)` dentro de la función `runTimeline()` en `script.js`.
