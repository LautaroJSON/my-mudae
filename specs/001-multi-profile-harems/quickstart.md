# Quickstart: Validar "Perfiles Múltiples con Harem Propio"

**Feature**: `001-multi-profile-harems` | **Fecha**: 2026-09-11

Esta guía valida la feature de punta a punta. No incluye código de
implementación — para eso ver `data-model.md`, `contracts/` y, más
adelante, `tasks.md`.

## Prerrequisitos

- Node.js LTS instalado.
- Dependencias del proyecto instaladas (`npm install`), scaffolded desde
  la plantilla `react-ts` de Vite conforme a `research.md`.
- El texto de harem de ejemplo (usado también en los tests del contrato
  `parseHaremMessage`, ver `contracts/parse-harem-message.md`), guardado
  a mano o copiado desde la sesión de clarificación de este feature:

  ```text
  rodoifin's harem
  ​
  Total value: 23,899:kakera:

  Amagami - 5/11
  #15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png
  #18,351 - Ai Nanasaki 46 ka - https://mudae.net/uploads/3176609/d7FP_dc~G8tEHIS.png
  Imagen
  Imagen

  Black Clover - 1/124
  #182 - Noelle Silva 479 ka - https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png
  ```

## Levantar la app

```bash
npm run dev
```

Abrir la URL que imprime Vite (por defecto `http://localhost:5173`).

## Escenario 1 — Crear el primer perfil pegando el harem (US1, P1)

1. Con la app recién abierta y sin datos en `localStorage`, verificar que
   se muestra la pantalla inicial de pegado (no una lista de perfiles
   vacía ni un error).
2. Pegar el texto de ejemplo de arriba sobre la zona de pegado (Ctrl+V o
   pegado táctil) — no es un campo de texto para escribir, solo detecta
   el pegado; no hay ningún botón que confirmar: el perfil se crea
   automáticamente en el momento del pegado.
3. **Esperado**: se crea un perfil llamado `rodoifin`, queda activo, y se
   ve su harem agrupado por serie (`Amagami` con 2 personajes, `Black
   Clover` con 1), cada personaje con nombre, imagen, kakera y claim rank
   visibles. Cumple SC-001.
4. Pegar un texto que no tenga ninguna línea de serie ni de personaje
   (por ejemplo, `"hola"`). **Esperado**: se rechaza, se muestra un
   mensaje de error, y no aparece ningún perfil nuevo (FR-007, SC-006).

## Escenario 2 — Persistencia automática (Principio I de la constitución)

1. Con el perfil `rodoifin` ya creado, refrescar la página (F5) o cerrar
   y volver a abrir la pestaña.
2. **Esperado**: el perfil `rodoifin` y su harem siguen ahí, sin haber
   guardado nada manualmente.

## Escenario 3 — Agregar un segundo perfil y cambiar el activo (US2, P2)

1. Desde la acción de "nuevo perfil" (visible con al menos un perfil ya
   creado), pegar un segundo mensaje de harem con un nombre de usuario
   distinto en la primera línea (por ejemplo, `"otroUsuario's harem"` con
   al menos una serie/personaje).
2. **Esperado**: el nuevo perfil se crea y pasa a ser el activo
   automáticamente; el harem visible es el del nuevo perfil, no el de
   `rodoifin` (FR-014).
3. Usar el selector de perfiles para volver a activar `rodoifin`.
   **Esperado**: el harem visible vuelve a ser el de `rodoifin`; en
   ningún momento intermedio se ven ambos harems a la vez ni ninguno
   activo (FR-012, FR-013, SC-003, SC-004).
4. Eliminar el perfil activo. **Esperado**: el otro perfil restante pasa
   a activo automáticamente (FR-015).
5. Eliminar el único perfil restante. **Esperado**: se vuelve a mostrar
   la pantalla inicial de pegado (0 perfiles, FR-010).

## Escenario 4 — Renombrar y eliminar (US3, P3)

1. Crear un perfil pegando el harem de ejemplo.
2. Editar su nombre a uno elegido a mano. **Esperado**: el nombre nuevo
   se muestra y persiste tras un refresh (FR-009).
3. Eliminarlo. **Esperado**: el perfil y todos sus personajes/series
   desaparecen; no queda rastro accesible desde la UI (FR-011, SC-002).

## Escenario 5 — Viewport móvil (Principio V de la constitución)

1. Repetir los Escenarios 1 y 3 con las DevTools del navegador en modo
   responsive, usando un viewport móvil representativo (ej. 390×844).
2. **Esperado**: la pantalla de pegado, el selector de perfiles y la
   vista de harem agrupada por serie son completamente usables (sin
   scroll horizontal, sin elementos cortados, sin necesidad de zoom) en
   ese viewport. Esta feature no incluye drag-and-drop, así que no hay
   verificación táctil de arrastre en este quickstart.

## Escenario 6 — Serie que se queda vacía (edge case, FR-022)

1. En un perfil con una serie que tiene un solo personaje, eliminar ese
   personaje (si la feature expone eliminar personajes individuales; si
   no, validar este caso a nivel de test unitario de `domain/` contra
   `Series`/`Harem` en lugar de manualmente).
2. **Esperado**: la serie deja de listarse — no aparece vacía en la
   `HaremView`.
