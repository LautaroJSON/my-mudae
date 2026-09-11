# Quickstart: Validar "Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop"

**Feature**: `003-character-series-reorder` | **Fecha**: 2026-09-11

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/quickstart.md`
(el mensaje real de `rodoifin's harem`); conviene un perfil con al menos
3 series y alguna con 3+ personajes para ver bien el wrap y el
reordenamiento. No incluye código de implementación — ver
`data-model.md`, `contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — sin dependencias nuevas
  respecto a `002` (`@dnd-kit/*` ya estaba instalado).
- `npm run dev` levantado, con un perfil activo que tenga varias series
  cargadas (pegar el harem de ejemplo si hace falta).

## Escenario 1 — Series lado a lado, tipo flex-wrap (US1, P1)

1. Con un perfil activo de 3+ series, abrir la vista principal en una
   pantalla de escritorio ancha (≥1200px). **Esperado**: al menos dos
   grupos de serie aparecen uno al lado del otro en la misma fila, cada
   uno mostrando su nombre y sus personajes agrupados como hoy.
2. Achicar progresivamente el ancho de la ventana. **Esperado**: la
   cantidad de series por fila baja a medida que hay menos espacio, sin
   que ningún grupo de serie se corte ni se superponga con otro.
3. Llevar el viewport a un ancho de mobile (~390px, DevTools modo
   responsive). **Esperado**: cada fila muestra una sola serie (por
   falta de espacio, no por una vista distinta), sin scroll horizontal.
4. Redimensionar la ventana en vivo (sin recargar) entre los pasos
   anteriores. **Esperado**: el acomodo de series se recalcula solo, sin
   necesidad de refrescar la página.

## Escenario 2 — Reordenar personajes dentro de una serie (US2, P2)

1. Elegir una serie con 3+ personajes. Arrastrar el último personaje de
   esa serie a la primera posición, dentro de la misma serie (con mouse;
   repetir con emulación táctil en DevTools).
2. **Esperado**: el personaje pasa a la primera posición de esa serie de
   inmediato; el resto de los personajes de esa serie se corre en
   consecuencia; ninguna otra serie se ve afectada.
3. Intentar arrastrar ese mismo personaje hacia el área de otra serie
   distinta y soltarlo ahí. **Esperado**: el personaje permanece dentro
   de su serie original (no se mueve a la otra serie).
4. Recargar la página. **Esperado**: el nuevo orden de esa serie se
   mantiene exactamente igual.

## Escenario 3 — Reordenar series entre sí (US3, P3)

1. Con 3+ series visibles, arrastrar (desde la manija de la serie, no
   desde una tarjeta de personaje) la última serie a la primera
   posición.
2. **Esperado**: esa serie pasa a mostrarse primero; el resto de las
   series se reacomoda en consecuencia, incluyendo su efecto en el
   layout tipo flex-wrap (qué series quedan lado a lado cambia según
   corresponda).
3. Verificar que el orden interno de personajes de cada serie no cambió
   por haber movido la serie completa.
4. Recargar la página. **Esperado**: el nuevo orden de series se
   mantiene exactamente igual.

## Escenario 4 — Harem grande, fluidez del arrastre (Principio III)

1. Usar (o construir) un perfil con 200+ personajes repartidos en varias
   series.
2. Arrastrar un personaje dentro de su serie y una serie completa entre
   las demás. **Esperado**: ambas interacciones se sienten fluidas, sin
   trabas ni "saltos" perceptibles, y no se nota que el resto de series
   no involucradas en el arrastre vuelva a dibujarse.

## Escenario 5 — Viewport móvil y touch (Principio V)

1. Repetir los Escenarios 1, 2 y 3 con las DevTools en modo responsive
   (viewport ~390×844) y emulación táctil activa. **Esperado**: el
   layout, el reordenamiento de personajes y el reordenamiento de series
   siguen siendo completamente usables con gestos táctiles, sin scroll
   horizontal ni elementos cortados.

## Escenario 6 — Aislamiento entre perfiles (FR-011)

1. Con dos perfiles cargados, reordenar personajes y series del perfil
   activo A.
2. Cambiar al perfil B (sin haber tocado su orden). **Esperado**: el
   orden de series/personajes de B es el que tenía antes, sin ningún
   cambio heredado del reordenamiento hecho en A.
3. Volver a A. **Esperado**: el reordenamiento hecho en el paso 1 sigue
   intacto.
