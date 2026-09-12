---

description: "Task list template for feature implementation"
---

# Tasks: Copiar Nombre de Personaje al Pasar el Mouse

**Input**: Design documents from `/specs/006-copy-character-name/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`-`005`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: `spec.md` de esta feature tiene una única historia de usuario (US1, P1) — toda la funcionalidad solicitada vive en esa historia; no hay Setup ni Foundational compartidos entre historias porque no hay una segunda historia con la que compartir nada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`005`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react`, `@dnd-kit/*`, `copyToClipboard`, `Toast` y `ManualCopyDialog` de `004` ya instalados/existentes; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — no hay ningún tipo de dominio que cambie de forma
(`Character` queda intacto, ver `data-model.md`) ni ninguna migración
pendiente. Al haber una sola historia de usuario, todo el trabajo vive
directamente en la Fase 3.

---

## Phase 3: User Story 1 - Copiar el nombre de un personaje desde su tarjeta (Priority: P1) 🎯 MVP

**Goal**: un botón redondo pequeño en la esquina superior derecha de
cada `CharacterCard`, revelado por hover/foco en dispositivos con
puntero fino y siempre visible en táctiles, copia `character.name` al
portapapeles con feedback de éxito o fallback de copiado manual, sin
interferir con el reordenamiento por arrastre ya existente (`003`).

**Independent Test**: con un perfil activo con al menos un personaje,
pasar el mouse sobre su tarjeta, tocar el icono que aparece, y verificar
que el portapapeles queda con el nombre exacto de ese personaje, que
aparece una confirmación visible, y que arrastrar la tarjeta desde
cualquier otro punto sigue reordenando con normalidad.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test en `tests/component/presentation/CharacterCard.copyName.test.tsx`: `CharacterCard` renderiza `CopyNameButton` con el atributo marcador `data-copy-name-button` dentro de una `Card`; click en el botón con `copyTextToClipboard` mockeado a `true` → aparece `Toast` de éxito, y `copyTextToClipboard` fue llamado exactamente con `character.name`; click con `copyTextToClipboard` mockeado a `false` → aparece `ManualCopyDialog` con `character.name` como texto (no un `Toast` de entrada); confirmar dentro del diálogo → `Toast` de éxito; cerrar sin confirmar → sin `Toast`; un `pointerdown` disparado sobre el botón, estando anidado dentro de un elemento con su propio listener de `pointerdown` (simulando el ancestro de arrastre de `CharacterListItem`), NO dispara ese listener ancestro — verifica el mecanismo anti-conflicto de arrastre descrito en `research.md` — según `contracts/copy-name-button-ui.md` y `data-model.md`

### Implementation for User Story 1

- [X] T002 [P] [US1] Crear `CopyNameButton` en `src/presentation/components/CopyNameButton/{index.tsx,styles.tsx}`: botón redondo pequeño con icono `Copy` de `lucide-react` y atributo `data-copy-name-button`; detiene la propagación de `pointerdown` (y defensivamente `onClick`) para que un click nunca sea interpretado como inicio de arrastre (`research.md`); al activarse llama a `copyTextToClipboard(characterName)` (reutilizado de `004`), éxito muestra `Toast` (`004`, sin modificar), fallo abre `ManualCopyDialog` (`004`, sin modificar); oculto por defecto (`opacity:0; pointer-events:none`) dentro de `@media (hover: hover) and (pointer: fine)`, visible por defecto fuera de esa media query (siempre visible en táctil); `aria-label` que incluya `characterName` — según `contracts/copy-name-button-ui.md` y `data-model.md`; hace pasar T001 (junto con T003)
- [X] T003 [US1] Modificar `src/presentation/components/CharacterCard/{index.tsx,styles.tsx}`: montar `<CopyNameButton characterName={character.name} />` como hijo de `Card`; `Card` gana `position: relative` y la regla de revelado por selector de atributo dentro de la misma media query (`&:hover [data-copy-name-button], &:focus-within [data-copy-name-button] { opacity: 1; pointer-events: auto; }`) — según `contracts/copy-name-button-ui.md` y `research.md` (depende de T002); hace pasar T001 — **ajustado en ejecución**: dos tests existentes de `003` (`SeriesGroup.dragdrop.test.tsx`, `HaremView.dragdrop.test.tsx`) contaban tarjetas vía `getAllByRole('button')`, y ahora también capturan el nuevo `CopyNameButton` (mismo rol); se ajustaron esas queries para excluir `[data-copy-name-button]`, sin debilitar lo que verificaban originalmente
- [X] T004 [US1] Verificar manualmente los Escenarios 1 a 5 de `quickstart.md` (copiar con éxito, el icono solo aparece sobre la tarjeta con el mouse encima, el arrastre existente sigue funcionando igual y no se dispara al tocar el icono, fallback de copiado manual, disponible en dispositivos táctiles sin depender de hover) — cubierto end-to-end por T001; se levantó el dev server (`npm run dev`) y sirvió el shell de la app sin errores, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`-`005`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (única historia de esta feature = MVP completo)

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T005 [P] Extender `tests/component/presentation/HaremView.performance.test.tsx` (de `003`) para confirmar que un harem de 200+ personajes con `CopyNameButton` en cada tarjeta sigue renderizando sin errores y en tiempo acotado (Escenario 6 de `quickstart.md`, Principio III) — el conteo esperado de superficies `role="button"` pasó de `240` a `240 + 210` (un `CopyNameButton` por cada uno de los 210 personajes); sigue renderizando y contando correctamente en el mismo presupuesto de tiempo
- [X] T006 [P] Revisar que `CopyNameButton` cumple la convención de carpeta/tipado del Principio VII (grep de `React.FC`, `styled.` fuera de `styles.tsx`, presencia de interface `ICopyNameButton` en `index.tsx`, `export default` al final) y que ningún `styles.tsx` nuevo/modificado usa un valor de color/tipografía/spacing hardcodeado fuera de `theme.ts` — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, `ICopyNameButton` presente, `export default` al final; sin colores hardcodeados fuera de `theme.ts`
- [X] T007 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final: 0 errores de tipos, lint sin errores nuevos (mismas 2 advertencias preexistentes ya documentadas en `003`-`005`), **134/136 tests en verde** (los 2 restantes son la regresión preexistente y ajena a esta feature de `HeaderActions`, ver nota al final de este archivo — no `CharacterCard`/`CopyNameButton`), build de producción exitoso (345.85 kB / gzip 108.05 kB)

---

## Addendum (post-planning, pedido durante `/speckit-implement`): feedback visual de hover y de arrastre en `CharacterCard`

Dos ajustes visuales pedidos directamente al ejecutar `/speckit-implement`
(fuera del `spec.md`/`plan.md`/`tasks.md` originales de esta feature, pero
aplicados sobre los mismos archivos que esta feature ya estaba tocando):

- [X] T008 [P] Agregar un efecto de hover a `Card` (`src/presentation/components/CharacterCard/styles.tsx`): `border-color` pasa a `theme.colors.accent` y aparece `box-shadow: theme.colors.shadowSm` en `:hover`, con una transición corta (`theme.motion.duration.fast`) — feedback visual de que la tarjeta es interactiva, independiente del revelado de `CopyNameButton`. Solo propiedades de pintura (sin `transform`/reflow) para no agregar costo en harems de 200+ personajes (Principio III).
- [X] T009 [P] Mostrar la tarjeta con opacidad reducida mientras se arrastra (`src/presentation/components/CharacterListItem/index.tsx`): se lee `isDragging` de `useSortable()` y se agrega `opacity: isDragging ? 0.5 : undefined` al mismo objeto de estilo en línea que ya fija `transform`/`transition` del arrastre — mismo criterio ya usado por listas ordenables de `@dnd-kit`, sin tocar `SeriesGroup` ni los sensores. Se actualizó también el comentario de este archivo (desactualizado por `CopyNameButton`: ya no es cierto que "`CharacterCard` no tiene ningún control interactivo propio").

No se agregó ningún test automatizado nuevo para T008/T009 (son ajustes puramente visuales/CSS, no observables de forma confiable en jsdom — mismo criterio que el resto de la app para efectos de hover/transición); se verificaron con el mismo gate de T007 (lint/tipos/tests/build) sin regresiones, y quedan pendientes de confirmación visual manual en navegador real (misma limitación de entorno que T004).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: sin tareas, nada que bloquee el inicio de la historia
- **User Story 1 (Phase 3)**: única historia de esta feature; no depende de ninguna otra (reutiliza `Toast`/`ManualCopyDialog`/`copyToClipboard` de `004` sin modificarlos, y no toca `SeriesGroup`/`CharacterListItem` de `003`)
- **Polish (Phase 4)**: depende de que la Phase 3 esté completa

### Within User Story 1

- Test (T001) antes que la implementación que lo hace pasar
- `CopyNameButton` (T002) antes que su montaje en `CharacterCard` (T003), que lo consume

### Parallel Opportunities

- T001 y T002 pueden escribirse en paralelo (archivos distintos); T001 solo pasará una vez completado T003
- T005/T006 (Polish, verificaciones independientes) en paralelo

---

## Parallel Example: User Story 1

```bash
# El test y la implementación del botón, en paralelo:
Task: "Test en tests/component/presentation/CharacterCard.copyName.test.tsx"
Task: "Crear CopyNameButton en src/presentation/components/CopyNameButton/"
```

---

## Implementation Strategy

### MVP First (y única entrega)

1. Completar Phase 3: User Story 1
2. **DETENERSE y VALIDAR**: Escenarios 1-5 de `quickstart.md`
3. Completar Phase 4: Polish (rendimiento con harem grande, convención de componentes, gate de lint/tipos/tests/build)
4. Desplegar/demostrar

### Incremental Delivery

Al haber una sola historia de usuario, la entrega es única: Setup/
Foundational (sin tareas) → User Story 1 completa → Polish → listo para
demo.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- No se modifica `SeriesGroup`, `CharacterListItem` ni la configuración
  de sensores de `@dnd-kit`; el conflicto de arrastre se resuelve
  enteramente dentro de `CopyNameButton` (ver `research.md`)
- `copyToClipboard`, `Toast` y `ManualCopyDialog` (`004`) se reutilizan
  sin ninguna modificación
- Verificar que el test (T001) falla antes de implementar (T002-T003)
- **Nota fuera de alcance de esta feature**: al momento de escribir estas
  tareas, `HeaderActions/index.tsx` tiene una edición hecha fuera de este
  flujo que oculta por completo los iconos de `004`/`005` cuando no hay
  perfil activo (en vez de mostrarlos deshabilitados), lo cual deja 2
  tests de `Header.test.tsx` en rojo. Es independiente de esta feature
  (no toca `CharacterCard`/`CopyNameButton`) y no se corrige acá; T007
  (gate final) lo va a seguir reportando como fallo hasta que se resuelva
  explícitamente en una sesión aparte.

---

## Addendum 2 (post-implementación, sesión posterior): feedback de "copiado" en el propio icono, sin `Toast`

- [X] T010 Reemplazar el `Toast` de `CopyNameButton` por feedback en el propio icono (relleno `theme.colors.accent` + icono `Check` de `lucide-react` en vez de `Copy`, por 2500ms) — mismo pedido explícito del usuario documentado en el Addendum de `004/tasks.md`, ver Addendum de `research.md` de esta feature. Ajuste propio de este componente: la regla de opacidad de `RoundIconButton` (oculto por defecto salvo hover/foco de la tarjeta) ahora también se mantiene visible mientras `$feedback === 'success'`, para que el checkmark no desaparezca si el mouse se aleja de la tarjeta justo después de copiar. Se actualizaron los tests de `tests/component/presentation/CharacterCard.copyName.test.tsx` que buscaban el texto del `Toast` para en cambio verificar el `aria-label` del botón (`/nombre copiado/i`) mientras dura el feedback. `Toast` en sí no se modificó — sigue en uso por `UpdateHaremButton` (`005`).
