# Quickstart: Validar "Actualizar Harem por Re-Pegado"

**Feature**: `005-update-harem-paste` | **Fecha**: 2026-09-11

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/
quickstart.md` (mensaje real de `rodoifin's harem`). No incluye código
de implementación — ver `data-model.md`, `contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — esta feature no agrega
  ninguna dependencia nueva.
- `npm run dev` levantado.
- Al menos un perfil creado y activo (por ejemplo, pegando el mensaje de
  ejemplo `rodoifin's harem`); idealmente un segundo perfil con otro
  nombre para el Escenario 3.

## Escenario 1 — Actualizar con éxito re-pegando el mismo perfil (US1, P1)

1. Con `rodoifin` como perfil activo, mirar la esquina superior derecha
   del header. **Esperado**: junto al icono "Compartir harem" (de `004`)
   aparece un segundo icono redondo, "Actualizar harem".
2. Tocarlo. **Esperado**: se abre un modal con una zona para pegar texto.
3. Pegar una variante del mismo mensaje (`rodoifin's harem` con algún
   personaje nuevo, alguno con kakera distinto, y alguno ausente
   respecto del harem actual). **Esperado**: el modal se cierra solo y
   aparece una confirmación de que el harem fue actualizado.
4. Verificar el harem del perfil `rodoifin`. **Esperado**: el personaje
   ausente del nuevo pegado ya no aparece, el de kakera distinto se
   actualizó, y el nuevo aparece — exactamente como describe el texto
   recién pegado.

## Escenario 2 — Formato inválido no modifica nada (US1, edge case)

1. Con `rodoifin` activo, abrir "Actualizar harem" y pegar un texto
   cualquiera que no sea un mensaje de harem de Mudae (por ejemplo,
   "hola, esto no es un harem"). **Esperado**: aparece un mensaje de
   error de formato inválido, el modal permanece abierto, y el harem de
   `rodoifin` no cambió.

## Escenario 3 — Advertencia cuando el nombre de perfil no coincide (US1, P1)

1. Con `rodoifin` activo (y, si existe, un segundo perfil `otrousuario`
   ya creado en la misma instalación), abrir "Actualizar harem" y pegar
   un mensaje de harem cuyo encabezado sea `"otrousuario's harem"` (ya
   sea el perfil `otrousuario` real, o un nombre que no corresponda a
   ningún perfil existente). **Esperado**: NO se cierra el modal con
   éxito — aparece una advertencia indicando que el texto pegado
   pertenece a "otrousuario" y que no corresponde al perfil que se está
   actualizando (`rodoifin`).
2. Verificar el harem de `rodoifin` y, si existía, el de `otrousuario`.
   **Esperado**: ninguno de los dos cambió.
3. Tocar "Reintentar" dentro de la advertencia. **Esperado**: vuelve a
   verse la zona de pegado, lista para un nuevo intento, sin cerrar el
   modal.
4. Cerrar el modal (Escape o el botón "X") sin reintentar. **Esperado**:
   el modal se cierra sin ningún mensaje de éxito ni de error, y el
   harem de `rodoifin` sigue sin cambios.

## Escenario 4 — Actualizar un perfil con harem vacío (US1, edge case)

1. Con un perfil activo cuyo harem no tiene ningún personaje cargado
   (harem vacío), abrir "Actualizar harem". **Esperado**: el icono está
   habilitado igual (a diferencia de "Compartir harem", que exige harem
   no vacío).
2. Pegar un mensaje de harem válido con el mismo nombre de ese perfil.
   **Esperado**: el harem pasa de vacío a tener el contenido del pegado,
   con la misma confirmación de éxito del Escenario 1.

## Escenario 5 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1 y 3 con las DevTools en modo responsive
   (viewport ~390×844), incluyendo el pegado con emulación táctil.
   **Esperado**: el nuevo icono, el modal, su zona de pegado y la vista
   de advertencia se leen completos sin scroll horizontal ni elementos
   cortados.
