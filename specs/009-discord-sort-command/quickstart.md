# Quickstart: Comando de Orden de Harem para Discord

**Feature**: `009-discord-sort-command`

Guía de validación manual end-to-end. Ver `contracts/` para el
comportamiento detallado de cada componente y `data-model.md` para la
forma exacta del comando generado.

## Prerrequisitos

- `npm install` ya ejecutado.
- Al menos un perfil activo con **dos o más series** y varios
  personajes cargados en un orden conocido (puede crearse pegando un
  mensaje de harem de ejemplo en el flujo de alta de perfil ya
  existente).

## Setup

```bash
npm run dev
```

Abrir la URL que imprime Vite (por defecto `http://localhost:5173`).

## Escenario 1 — Comando refleja el orden visual (Historia 1, FR-004)

1. Con el perfil de prueba activo, anotar a mano el orden
   serie-por-serie y personaje-por-personaje tal como se ve en la
   pantalla principal.
2. Presionar el ícono de flecha junto al botón flotante de opciones
   (esquina inferior derecha).
3. **Verificar**: se despliega una barra con un campo de texto cuyo
   contenido es `$sm <nombre1> $ <nombre2> $ ...`, en exactamente el
   mismo orden anotado en el paso 1.

## Escenario 2 — Copiar el comando (Historia 1, FR-005/FR-006)

1. Con la barra abierta del Escenario 1, presionar "Copiar Comando".
2. **Verificar**: el botón muestra una confirmación visible (ícono/label
   de éxito).
3. Pegar el contenido del portapapeles en cualquier campo de texto
   (o en el propio Discord si se quiere probar contra un servidor de
   prueba) y **verificar** que coincide exactamente con el texto
   mostrado en el campo de la barra.

## Escenario 3 — El comando se actualiza tras reordenar (Historia 1, FR-009)

1. Con la barra abierta, arrastrar un personaje a una nueva posición
   dentro de su serie (drag & drop de `003`), o reordenar dos series
   entre sí.
2. **Verificar**: sin cerrar ni volver a abrir la barra, el texto del
   comando cambia para reflejar el nuevo orden.

## Escenario 4 — Harem vacío / sin perfil activo (Historia 1, FR-008)

1. Cambiar a un perfil sin personajes, o eliminar todos los personajes
   del perfil activo (si el flujo existente lo permite), o probar sin
   ningún perfil creado.
2. Abrir la barra con el ícono de flecha.
3. **Verificar**: se muestra un mensaje indicando que no hay nada para
   ordenar, y el botón "Copiar Comando" está deshabilitado (no genera
   ni permite copiar `"$sm"` sin nombres).

## Escenario 5 — Animación suave en ambos sentidos (Historia 2, FR-003)

1. Con la barra oculta, presionar el ícono de flecha y observar la
   aparición.
2. **Verificar**: la barra se desliza suavemente de abajo hacia arriba
   (no aparece de forma instantánea).
3. Presionar el ícono nuevamente y observar el cierre.
4. **Verificar**: la barra se desliza suavemente de vuelta hacia abajo
   hasta desaparecer (no un corte abrupto), y el ícono de flecha cambió
   de orientación entre ambos pasos (FR-010).
5. Presionar el ícono varias veces seguidas muy rápido.
6. **Verificar**: la barra no queda visualmente "trabada" a mitad de
   transición ni superpuesta consigo misma.

## Escenario 6 — Viewport móvil (Principio V)

1. Abrir las DevTools del navegador y simular un viewport angosto
   (~390px de ancho).
2. Repetir el Escenario 1 y el Escenario 5 en ese viewport.
3. **Verificar**: el ícono de flecha y la barra son completamente
   usables por touch/click, el campo de texto permite scroll horizontal
   si el comando no entra en una línea, y "Copiar Comando" nunca queda
   tapado ni fuera de pantalla.

## Escenario 7 — Performance con harem grande (Principio III)

1. Cargar (o simular) un perfil con 200+ personajes.
2. Abrir la barra y **verificar** que el comando aparece sin demora
   perceptible y sin afectar la fluidez del scroll/drag & drop del
   harem debajo.

## Automatizado (referencia para `/speckit-tasks`)

- `domain/parsing/formatSortCommand.test.ts` — casos del contrato
  `contracts/format-sort-command.md`.
- `presentation/components/SortCommandToggle/*.test.tsx`,
  `SortCommandBar/*.test.tsx` — casos de
  `contracts/sort-command-toggle-bar-ui.md`.
- `presentation/components/CopyCommandButton/*.test.tsx` — casos de
  `contracts/copy-command-button-ui.md`.
