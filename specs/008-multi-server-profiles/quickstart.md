# Quickstart: Validar "Servidores Múltiples por Usuario"

**Feature**: `008-multi-server-profiles` | **Fecha**: 2026-09-12

Reutiliza el harem de ejemplo de `specs/001-multi-profile-harems/
quickstart.md` (mensaje real de `rodoifin's harem`), y una segunda
variante con otro `username` para probar independencia entre
servidores. No incluye código de implementación — ver `data-model.md`,
`contracts/` y `tasks.md`.

## Prerrequisitos

- Dependencias instaladas (`npm install`) — esta feature no agrega
  ninguna dependencia nueva.
- `npm run dev` levantado, sin ningún perfil/servidor cargado todavía
  (no hay migración de datos previos, ver `research.md`).

## Escenario 1 — Alta de un perfil con servidor nuevo (US1, P1)

1. Abrir "Nuevo perfil" y pegar el harem de ejemplo (`rodoifin's harem`).
   **Esperado**: en vez de crear el perfil, se abre un pedido de
   servidor con un input de texto vacío y ningún servidor listado
   (todavía no hay ninguno).
2. Escribir "Server A" en el input y confirmar. **Esperado**: se crea el
   perfil `rodoifin`, asociado al servidor "Server A" recién creado.

## Escenario 2 — Alta de un segundo perfil eligiendo el servidor existente (US1, P1)

1. Dar de alta un segundo perfil con un `username` distinto (ej.
   `otrousuario's harem`).
2. En el pedido de servidor, **Esperado**: aparece "Server A" listado
   con un radio button. Elegirlo. **Esperado**: el input de texto de
   arriba se deshabilita/opaca.
3. Confirmar. **Esperado**: el nuevo perfil queda asociado a "Server A"
   (el mismo de antes), no a un servidor nuevo.

## Escenario 3 — El mismo nombre de usuario en dos servidores distintos (US1, P1)

1. Dar de alta un perfil con el mismo `username` que `rodoifin`
   (repegar el mismo mensaje de ejemplo), pero esta vez escribiendo un
   servidor nuevo, "Server B", en vez de elegir "Server A".
2. **Esperado**: se crea un perfil `rodoifin` NUEVO e independiente,
   asociado a "Server B" — no sincroniza ni reemplaza al `rodoifin` de
   "Server A".
3. Verificar (Escenario 5 de `specs/005-update-harem-paste/quickstart.md`,
   adaptado): actualizar el harem del `rodoifin` de "Server A" no
   modifica en absoluto al `rodoifin` de "Server B".

## Escenario 4 — Ver los perfiles agrupados por servidor (US3, P2)

1. Con los perfiles de los Escenarios 1 a 3 ya cargados, abrir la lista
   de perfiles. **Esperado**: se ven "Server A" y "Server B" como nivel
   superior (acordeón), no una lista plana.
2. Desplegar "Server A". **Esperado**: se ven únicamente sus perfiles
   (`rodoifin`, `otrousuario`). Desplegar también "Server B" sin
   colapsar "Server A". **Esperado**: ambos quedan expandidos a la vez,
   cada uno mostrando solo sus propios perfiles.

## Escenario 5 — Eliminar un servidor vacío desde el alta (US2, P2)

1. Abrir "Nuevo perfil" y pegar cualquier harem válido para llegar al
   pedido de servidor, y escribir un servidor nuevo ("Server Vacío")
   sin confirmar el alta todavía — cancelar el pedido de servidor sin
   confirmar (o completar el alta y luego eliminar su único perfil
   desde la lista, para dejar el servidor sin perfiles).
2. Volver a abrir "Nuevo perfil" con cualquier otro pegado válido.
   **Esperado**: "Server Vacío" aparece listado con radio button
   (aunque no tenga perfiles) y con una opción de eliminar.
3. Eliminarlo. **Esperado**: desaparece de la lista de inmediato, sin
   ningún diálogo de confirmación adicional.

## Escenario 6 — Eliminar un servidor con perfiles cargados (US2, P2)

1. Abrir "Nuevo perfil" para llegar al pedido de servidor, con "Server
   A" (2 perfiles, de los Escenarios 1-2) todavía cargado.
2. Tocar "Eliminar" en la fila de "Server A". **Esperado**: aparece una
   advertencia indicando que tiene 2 perfiles cargados, con la lista de
   sus nombres (`rodoifin`, `otrousuario`) debajo, en un cuadro que
   ocupa el ancho completo del diálogo.
3. Cancelar. **Esperado**: "Server A" y sus 2 perfiles siguen intactos.
4. Repetir y esta vez confirmar. **Esperado**: "Server A" desaparece de
   la lista de servidores, junto con `rodoifin` y `otrousuario` (ambos
   dejan de existir como perfiles).

## Escenario 7 — Reordenar servidores y perfiles dentro de un servidor (US4, P3)

1. Con 2+ servidores y 2+ perfiles dentro de uno de ellos, arrastrar un
   servidor a otra posición. **Esperado**: el nuevo orden se refleja de
   inmediato y persiste tras recargar la página.
2. Arrastrar un perfil dentro de su servidor a otra posición.
   **Esperado**: el nuevo orden persiste, sin afectar el orden de
   perfiles de ningún otro servidor.

## Escenario 8 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1, 4 y 6 con las DevTools en modo responsive
   (viewport ~390×844), incluyendo el toque de radios/botones con
   emulación táctil. **Esperado**: el pedido de servidor, el acordeón
   de dos niveles y la advertencia de eliminación (con su lista
   scrolleable) se leen completos, sin desbordar horizontalmente.
