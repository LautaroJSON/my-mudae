# Quickstart: Ordenar por Valor de Kakera (Temporal)

**Feature**: `010-sort-by-kakera-value`

Guía de validación manual end-to-end. No reemplaza los tests
automatizados (`sort-haremby-kakera.md`, `kakera-sort-panel-ui.md`) —
es la verificación humana previa a dar la feature por terminada,
incluyendo los criterios de aceptación de la constitución (Principios
II, III, V).

## Prerrequisitos

- Repo instalado (`npm install`) y corriendo en modo dev (`npm run
  dev`).
- Un perfil con harem cargado que tenga:
  - Al menos 3 series distintas.
  - Al menos una serie con 2+ personajes de distinto valor de kakera.
  - Al menos un personaje **sin** valor de kakera (para validar FR-013).
  - Dos series (o dos personajes dentro de una misma serie) con la
    **misma** suma/valor de kakera, para validar el criterio de empate
    (FR-014).
- Para la validación de performance (Principio III): un segundo perfil
  o el mismo, pero con 200+ personajes cargados (se puede generar
  pegando un harem grande de prueba vía "Actualizar harem", `005`).

## Escenario 1 — Activar y desactivar el ordenamiento (User Story 1)

1. Abrir la app con el perfil de prueba activo.
2. Presionar el botón circular de filtrado en la esquina superior
   derecha (`HeaderActions`) → se despliega el panel de fondo acento
   justo debajo del header.
3. Presionar "Ordenamiento" → aparecen "Valor de Kakera" y "Rank".
4. Presionar "Valor de Kakera" → **Verificar**: la lista se reordena de
   inmediato; dentro de cada serie, los personajes quedan de mayor a
   menor kakera (el que no tiene valor cargado queda al final, tratado
   como 0); las series quedan ordenadas de mayor a menor según la suma
   de kakera de sus personajes.
5. Presionar "Valor de Kakera" de nuevo → **Verificar**: la lista vuelve
   exactamente al orden manual que tenía antes del paso 4 (mismo orden
   de series y de personajes dentro de cada una).

## Escenario 2 — Alternar dirección (User Story 2)

1. Con el ordenamiento activo (paso 4 del Escenario 1), **Verificar**:
   aparece la flecha de dirección junto a "Valor de Kakera".
2. Presionar la flecha → **Verificar**: la lista se reordena de forma
   ascendente (series y personajes de menor a mayor).
3. Presionar la flecha de nuevo → **Verificar**: vuelve a descendente.
4. Desactivar el ordenamiento (interruptor) y **Verificar**: la flecha
   deja de tener efecto sobre la lista (probar presionarla mientras está
   inactivo, si sigue visible/alcanzable, no debe cambiar nada).

## Escenario 3 — Acceso desde el header y opción "Rank" (User Story 3)

1. Con el panel de ordenamiento cerrado, **Verificar**: el botón
   circular de filtrado es visible dentro de `HeaderActions`, junto a
   los botones ya existentes de compartir/actualizar harem.
2. Abrir el panel, abrir "Ordenamiento", presionar "Rank" →
   **Verificar**: no ocurre ningún cambio en el harem renderizado ni en
   ningún otro estado visible.
3. Cerrar el panel con click afuera y volver a abrirlo con Escape sobre
   el foco del botón → **Verificar**: mismo comportamiento de
   apertura/cierre que `SettingsFab` (007)/`SortCommandToggle` (009).

## Escenario 4 — Integridad del comando exportado (Principio II / FR-012)

**Este es el escenario más importante de verificar manualmente antes de
dar la feature por terminada.**

1. Con el perfil de prueba activo y el ordenamiento por kakera **activo**
   (cualquier dirección), abrir la barra de comando existente (ícono de
   flecha junto al botón flotante de opciones, `009`) y copiar el
   comando `$sm`.
2. **Verificar**: el comando copiado enumera los personajes en el orden
   **manual persistido** (el mismo que se vería con el ordenamiento por
   kakera desactivado), NO en el orden temporal visible en pantalla.
3. Desactivar el ordenamiento por kakera y volver a copiar el comando →
   **Verificar**: es idéntico al del paso 2 (confirma que el comando
   nunca dependió del estado del toggle).

## Escenario 5 — Drag-and-drop deshabilitado mientras el ordenamiento está activo (FR-015)

1. Con el ordenamiento por kakera activo, intentar arrastrar una serie
   para reordenarla, y luego un personaje dentro de una serie →
   **Verificar**: ninguno de los dos gestos inicia un arrastre (sin
   cursor de "agarrar", sin animación de levantar la tarjeta).
2. Desactivar el ordenamiento → **Verificar**: el drag-and-drop de
   series y de personajes vuelve a funcionar exactamente como antes de
   esta feature (`003`).

## Escenario 6 — Performance con harem grande (Principio III)

1. Cargar o activar el perfil con 200+ personajes.
2. Activar el ordenamiento por kakera → **Verificar**: el reordenamiento
   visual ocurre sin bloqueo perceptible de la interfaz (sin jank
   notorio al togglear).
3. Alternar la dirección un par de veces → **Verificar**: cada cambio se
   siente instantáneo, sin degradación progresiva.

## Escenario 7 — Viewport móvil (Principio V)

1. Reducir el viewport a ~390px de ancho (o usar el modo responsive del
   navegador).
2. Repetir el Escenario 1 completo por touch (tap en vez de click) →
   **Verificar**: el botón, el panel y sus opciones son alcanzables y
   operables por touch, el panel no desborda la pantalla ni fuerza
   scroll horizontal de la página.

## Criterios de éxito (resumen ligado a `spec.md`)

- SC-001/SC-002: activar y desactivar el ordenamiento (Escenario 1) es
  inmediato y siempre reversible al orden manual exacto.
- SC-003: cambiar de dirección (Escenario 2) es una sola acción con
  actualización inmediata.
- SC-004: el comando exportado (Escenario 4) nunca refleja el orden
  temporal — este es el escenario que bloquea el release si falla
  (Principio II, bug crítico).
