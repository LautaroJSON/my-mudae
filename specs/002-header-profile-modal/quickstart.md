# Quickstart: Validar "Header con Modal de Perfiles"

**Feature**: `002-header-profile-modal` | **Fecha**: 2026-09-11

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/quickstart.md`
(el mensaje real de `rodoifin's harem`). No incluye código de
implementación — ver `data-model.md`, `contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`), incluyendo `@dnd-kit/core`,
  `@dnd-kit/sortable`, `@dnd-kit/utilities` (nuevas de esta feature).
- `npm run dev` levantado.

## Escenario 1 — Header siempre visible + modal (US1, P1)

1. Con `localStorage` vacío, abrir la app. **Esperado**: se ve el header
   con "MyMudae" y, a la derecha, una invitación a crear un perfil (no
   hay ninguna lista de perfiles visible en la página principal).
2. Presionar el control de perfil del header. **Esperado**: se abre un
   modal con la lista vacía y la posibilidad de pegar un harem.
3. Pegar el harem de ejemplo dentro del modal. **Esperado**: aparece en
   la lista, el header pasa a mostrar su alias, y la página principal
   (detrás del modal, o al cerrarlo) muestra su harem.
4. Hacer scroll en la página principal. **Esperado**: el header sigue
   visible arriba en todo momento.

## Escenario 2 — Reordenar perfiles con drag-and-drop (US2, P2)

1. Crear 3 perfiles distintos (pegando 3 harems de ejemplo con nombres
   distintos en la primera línea).
2. Dentro del modal, arrastrar el tercero al principio de la lista (con
   mouse; repetir con emulación táctil en DevTools).
3. Cerrar y reabrir el modal, y refrescar la página. **Esperado**: el
   orden se mantiene igual en ambos casos.
4. Verificar que el perfil activo no cambió por el solo hecho de
   reordenar.

## Escenario 3 — Tamaño del harem en la lista (US3, P2)

1. Con perfiles de distinto tamaño de harem ya creados, abrir el modal.
   **Esperado**: cada fila muestra, debajo del alias, la cantidad de
   personajes y el valor total (suma de kakera) correctos para ese
   perfil.
2. Crear un perfil cuyos personajes no tengan kakera (pegando líneas sin
   el fragmento `<num> ka`). **Esperado**: su fila muestra el valor total
   como `0`, sin romperse.

## Escenario 4 — Sincronizar un perfil re-pegando su harem (US4, P2)

1. Con el perfil `rodoifin` ya creado (harem de ejemplo completo), abrir
   "nuevo perfil" en el modal y pegar una variante del mismo mensaje
   (misma primera línea `rodoifin's harem`) donde:
   - un personaje mantiene el mismo claim rank pero con otro valor de
     kakera,
   - aparece un personaje con un claim rank nuevo,
   - falta un personaje que sí estaba en el pegado original.
2. **Esperado**: sigue existiendo un solo perfil `rodoifin` (no se crea
   un duplicado); el personaje con kakera distinto se actualiza, el
   nuevo se agrega, el que falta desaparece del harem.

## Escenario 5 — Abrir un perfil en pestaña nueva (US5, P3)

1. Con dos perfiles creados, presionar el botón "abrir en pestaña nueva"
   del que NO está activo en la pestaña actual.
2. **Esperado**: se abre una pestaña nueva del navegador con `?id=<id>`
   en la URL, mostrando el harem de ESE perfil — sin cambiar cuál
   perfil estaba activo en la pestaña original.
3. Editar `?id=` a mano por uno que no exista y recargar esa pestaña.
   **Esperado**: se muestra un estado de "perfil no encontrado", no un
   error roto ni el harem de otro perfil sustituido en silencio.

## Escenario 6 — Renombrar y eliminar desde el modal (US6, P3)

1. Dentro del modal, editar el alias de un perfil. **Esperado**: el
   nuevo alias se ve en la fila y, si era el activo, también en el
   header; el `id` interno no cambia (verificable re-pegando el mismo
   harem original después: sigue sincronizando al mismo perfil, no crea
   uno nuevo con el alias editado).
2. Eliminar un perfil (con la confirmación existente, ahora como diálogo
   anidado sobre el modal). **Esperado**: desaparece de la lista junto
   con su harem; si estaba activo, el header dice reflejarlo.

## Escenario 7 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1, 2 y 5 con las DevTools en modo responsive
   (viewport ~390×844). **Esperado**: header, modal y drag-and-drop
   (con emulación táctil) siguen siendo completamente usables, sin
   scroll horizontal ni elementos cortados.
