# Quickstart: Validar "Compartir Harem por Portapapeles"

**Feature**: `004-share-harem-clipboard` | **Fecha**: 2026-09-11

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/
quickstart.md` (mensaje real de `rodoifin's harem`). No incluye código de
implementación — ver `data-model.md`, `contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — esta feature no agrega
  ninguna dependencia nueva.
- `npm run dev` levantado.
- Al menos un perfil creado con harem no vacío (pegar el mensaje de
  ejemplo si no hay ninguno todavía).

## Escenario 1 — Compartir con éxito por Clipboard API (US1, P1)

1. Con un perfil activo con harem cargado, mirar la esquina superior
   derecha del header. **Esperado**: se ve el icono redondo "Compartir
   harem" (icono de copiar) junto al control de perfil existente.
2. Tocar el icono. **Esperado**: aparece un mensaje de confirmación
   (feedback) indicando que el harem fue copiado, en menos de 1 segundo.
3. Pegar el contenido del portapapeles en cualquier editor de texto.
   **Esperado**: el texto tiene la forma `"<alias>'s harem"` seguido de
   los encabezados de serie y líneas de personaje del perfil activo.

## Escenario 2 — Round-trip completo entre dos perfiles (US1, P1)

1. Copiar el harem del perfil activo con el icono (Escenario 1).
2. Abrir "Nuevo perfil" (modal de perfiles → pegar) y pegar el texto
   copiado en el `PasteHaremScreen` existente.
3. **Esperado**: se crea (o sincroniza, si el alias coincide con un
   perfil ya existente en esa misma instalación) un perfil nuevo con el
   mismo nombre, la misma cantidad de series y la misma cantidad de
   personajes (mismo nombre/kakera/rango de claim) que el perfil
   original.

## Escenario 3 — Icono deshabilitado sin perfil o con harem vacío (US1, edge case)

1. Sin ningún perfil activo (por ejemplo, en una instalación nueva sin
   perfiles). **Esperado**: el icono "Compartir harem" se ve
   deshabilitado; tocarlo no copia nada ni muestra feedback de éxito.
2. Si es posible dejar un perfil activo con harem vacío (0 series/0
   personajes), repetir la verificación. **Esperado**: mismo
   comportamiento deshabilitado.

## Escenario 4 — Fallback cuando la Clipboard API falla o no existe (US1, edge case)

1. En las DevTools del navegador, deshabilitar/bloquear el permiso de
   portapapeles del sitio (o simular ausencia de `navigator.clipboard`
   desde la consola antes de recargar).
2. Tocar el icono "Compartir harem". **Esperado**: no se muestra un
   error de entrada — aparece un diálogo con el texto del harem ya
   seleccionado dentro de un cuadro de texto, invitando a copiarlo
   manualmente (`Ctrl+C` o selección táctil).
3. Copiar manualmente y confirmar con el botón del diálogo ("Listo, ya
   lo copié"). **Esperado**: se muestra el mismo feedback de éxito que
   en el Escenario 1.
4. Repetir el paso 2 pero cerrando el diálogo sin confirmar (Escape o
   click afuera). **Esperado**: no se muestra feedback de éxito ni de
   error — simplemente se cierra.

## Escenario 5 — El texto copiado refleja el orden visual actual (Principio II)

1. Con un harem de 2+ series y 2+ personajes por serie, reordenar
   manualmente (drag-and-drop, feature `003`) tanto el orden de las
   series como el orden de los personajes dentro de una de ellas.
2. Tocar "Compartir harem" y pegar el resultado en un editor de texto.
   **Esperado**: el orden de series y personajes en el texto coincide
   exactamente con el orden visual actual del harem en pantalla, no con
   el orden original en el que se cargaron.

## Escenario 6 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1 y 2 con las DevTools en modo responsive
   (viewport ~390×844), incluyendo el toque del icono con emulación
   táctil. **Esperado**: el icono "Compartir harem" y el control de
   perfil existente conviven en el header sin scroll horizontal ni
   elementos cortados; el feedback (toast o diálogo de copiado manual)
   se lee completo sin salirse de la pantalla.
