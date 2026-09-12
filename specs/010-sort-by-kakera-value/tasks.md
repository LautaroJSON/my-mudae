---

description: "Task list template for feature implementation"
---

# Tasks: Ordenar por Valor de Kakera (Temporal)

**Input**: Design documents from `/specs/010-sort-by-kakera-value/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: la constitución y el histórico de features (`001`-`009`) establecen una estrategia de testing automatizada para cada pieza nueva de dominio/presentación — las tareas de test de abajo están incluidas siguiendo ese mismo patrón.

**Organization**: `spec.md` tiene tres historias de usuario (US1 sorting, US2 dirección, US3 acceso desde el header + "Rank"). En la práctica, US1 no es alcanzable por un usuario real sin algún control que la dispare, así que — mismo criterio que usó `009` (donde el toggle+barra completos ya vivían en su US1) — la Fase 3 (US1) construye la cadena mínima de acceso completa (botón, panel, acordeón "Ordenamiento", interruptor "Valor de Kakera") junto con el efecto de ordenamiento en sí. US2 solo agrega el control de dirección sobre ese interruptor ya existente. US3 solo agrega la fila "Rank" (placeholder inerte) al panel ya construido — es deliberadamente la porción más chica, porque el resto de lo que `spec.md` describe en su Historia 3 (abrir el panel, desplegar "Ordenamiento") ya es un prerrequisito de US1, no trabajo adicional.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`009`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/{unit,component,infrastructure}/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `@dnd-kit/core`/`@dnd-kit/sortable` y `lucide-react` -íconos `Filter`/`ArrowUp`, confirmados presentes en la versión instalada-, ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la función pura de ordenamiento y el estado efímero on/off + dirección, compartidos por las tres historias — ninguna historia tiene valor propio sin esto.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Test de `sortHaremByKakera` en `tests/unit/domain/harem.test.ts` (extiende el archivo existente): personajes `[5, 20, 1]` en una serie → `'desc'` da `[20,5,1]`, `'asc'` da `[1,5,20]`; dos series con la misma suma de kakera mantienen su orden relativo original en ambas direcciones; un personaje sin `kakera` se trata como `0`; el `harem` recibido no se muta (comparar referencias/contenido antes y después de la llamada); el conjunto de ids de series y de personajes de la salida es igual al de la entrada; harem con `series: []` → `{ ...harem, series: [] }` sin error — según `contracts/sort-haremby-kakera.md`
- [X] T002 [P] Test de `HaremSortContext` en `tests/unit/presentation/HaremSortContext.test.tsx` (nuevo, envolviendo con `ProfilesProvider` + `InMemoryProfileRepository` con al menos dos perfiles, mismo patrón que `useThemePreference.test.ts`/`SettingsFab.test.tsx`): estado inicial `{ isActive: false, direction: 'desc' }`; `toggleActive()` estando apagado → `isActive: true`, `direction: 'desc'`; `toggleActive()` estando encendido → `isActive: false`; `toggleDirection()` con `isActive: false` → no cambia `direction` (no-op, FR-009); con `isActive: true`, `toggleDirection()` alterna `'desc'`/`'asc'`; activar el perfil B mientras el A tiene `isActive: true` → se resetea a `{ isActive: false, direction: 'desc' }` (FR-011)
- [X] T003 [P] Implementar `KakeraSortDirection` y `sortHaremByKakera(harem, direction)` en `src/domain/harem/Harem.ts`, junto a `reorderSeries`/`reorderCharactersInSeries`/`sumKakera` ya existentes: por cada serie, clona y ordena `characters` por `character.kakera ?? 0` (factor `-1` si `direction === 'desc'`, `1` si `'asc'`); luego ordena las series clonadas por la suma de kakera de sus personajes con el mismo factor; usa el `sort` nativo (estable) sin comparador de desempate explícito — hace pasar T001; según `contracts/sort-haremby-kakera.md` (depende de T001)
- [X] T004 [P] Crear `HaremSortContext` en `src/presentation/context/HaremSortContext.tsx`: `HaremSortProvider` anidado dentro de `ProfilesProvider` (usa `useProfiles()` para leer `activeProfile?.id`); estado `isActive`/`direction` con `useState`; `useEffect` sobre `activeProfile?.id` que resetea a `{ isActive: false, direction: 'desc' }` en cada cambio; `toggleActive()` y `toggleDirection()` (no-op si `!isActive`) como se describe arriba; hook `useHaremSort()` que lanza si se usa fuera del provider (mismo patrón que `useProfiles()`) — hace pasar T002; según `data-model.md`/`research.md` §5 (depende de T002)
- [X] T005 Modificar `src/presentation/App.tsx`: envolver `<AppContent />` con `<HaremSortProvider>` dentro de `<ProfilesProvider>` (así `HaremSortProvider` puede leer `useProfiles()`) — no cambia ningún otro comportamiento existente (depende de T004)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Ver el harem ordenado por valor de kakera (Priority: P1) 🎯 MVP

**Goal**: presionar el botón circular de filtrado en `HeaderActions` despliega, justo debajo del header y con fondo de acento, un panel donde "Ordenamiento" revela el interruptor "Valor de Kakera"; activarlo reordena el harem visible (series por suma de kakera, personajes por su propio valor) de forma descendente; desactivarlo restaura exactamente el orden manual. El comando `$sm` existente (`009`) sigue reflejando siempre el orden manual, nunca el temporal. El drag-and-drop queda deshabilitado mientras el ordenamiento está activo.

**Independent Test**: con un harem de varias series y valores de kakera distintos, abrir el panel, expandir "Ordenamiento", activar "Valor de Kakera" y verificar el reordenamiento descendente descrito arriba; desactivarlo y verificar que la lista vuelve exactamente al orden manual original; con el ordenamiento activo, copiar el comando `$sm` y verificar que sigue en el orden manual; intentar arrastrar una serie o un personaje y verificar que no inicia el gesto.

### Tests for User Story 1 ⚠️

- [X] T006 [P] [US1] Test de integración en `tests/component/presentation/HaremView.kakeraSort.test.tsx` (nuevo, `ProfilesProvider` + `InMemoryProfileRepository` + `HaremSortProvider`, harem de prueba con varias series/valores y un personaje sin kakera): con el ordenamiento inactivo, `HaremView` renderiza el orden manual persistido; con `isActive: true`/`direction: 'desc'` (invocado directamente sobre el contexto, sin pasar por la UI de T007), reordena series por suma de kakera y personajes por su propio valor, tratando el personaje sin kakera como `0`; al volver a `isActive: false`, restaura exactamente la secuencia de ids original; con `isActive: true`, simular un intento de drag sobre una serie y sobre un personaje y verificar que NO dispara `reorderSeries`/`reorderCharactersInSeries` — según `contracts/kakera-sort-panel-ui.md`, `research.md` §4
- [X] T007 [P] [US1] Test de `HaremSortButton`+`HaremSortPanel`+`KakeraSortOption` (solo interruptor on/off, sin flecha — la flecha es de US2) en `tests/component/presentation/HaremSortButton.test.tsx` (mismo patrón que `SettingsFab.test.tsx`): sin `activeProfile` no se renderiza; click en el botón abre `HaremSortPanel` con fondo `theme.colors.accent`; click en "Ordenamiento" despliega "Valor de Kakera" (`aria-pressed="false"`); click en "Valor de Kakera" lo activa (`aria-pressed="true"`) y el harem debajo se reordena descendente; click de nuevo lo desactiva y restaura el orden; cierre del panel por click afuera del `wrapperRef` o Escape — según `contracts/kakera-sort-panel-ui.md`

### Implementation for User Story 1

- [X] T008 [US1] Modificar `src/presentation/components/HaremView/index.tsx`: leer `{ isActive, direction }` de `useHaremSort()`; calcular `const displayedHarem = isActive ? sortHaremByKakera(harem, direction) : harem`; usar `displayedHarem.series`/`displayedHarem.series.map(s => s.id)` en vez de `harem.series`/`seriesIds` para el render y el `SortableContext`; pasar `dragDisabled={isActive}` a cada `<SeriesGroupItem />` — hace pasar la mitad de T006 (depende de T003, T004)
- [X] T009 [P] [US1] Modificar `src/presentation/components/SeriesGroupItem/index.tsx`: aceptar prop opcional `dragDisabled?: boolean`; `useSortable({ id: series.id, disabled: dragDisabled })`; reenviar `dragDisabled` a `<SeriesGroup dragHandleProps={...} dragDisabled={dragDisabled} .../>` (depende de T008 para el contrato del prop, pero es un archivo distinto — puede escribirse en paralelo con T010/T011)
- [X] T010 [P] [US1] Modificar `src/presentation/components/SeriesGroup/index.tsx`: aceptar prop opcional `dragDisabled?: boolean`; agregar `disabled={dragDisabled}` al botón `DragHandle`; reenviar `dragDisabled` a cada `<CharacterListItem dragDisabled={dragDisabled} .../>` (mismo criterio de paralelismo que T009)
- [X] T011 [P] [US1] Modificar `src/presentation/components/CharacterListItem/index.tsx`: aceptar prop opcional `dragDisabled?: boolean`; `useSortable({ id: character.id, disabled: dragDisabled })` — hace pasar la segunda mitad de T006 en conjunto con T008-T010 (mismo criterio de paralelismo)
- [X] T012 [US1] Crear `KakeraSortOption` (solo el interruptor on/off en esta tarea) en `src/presentation/components/KakeraSortOption/{index.tsx,styles.tsx}`: consume `useHaremSort()`; botón con `aria-pressed={isActive}`, label "Valor de Kakera"; al activarse llama `toggleActive()`; estilo con fill/borde distinto cuando `isActive` (legible sobre `theme.colors.accent`, texto en `theme.colors.onAccent`) — depende de T004
- [X] T013 [US1] Crear `HaremSortPanel` en `src/presentation/components/HaremSortPanel/{index.tsx,styles.tsx}`: `position: absolute; top: 100%; left: 0; right: 0; z-index: theme.zIndex.dropdown; background: theme.colors.accent; color: theme.colors.onAccent`; fila/botón "Ordenamiento" con estado local `isSortSectionOpen` (arranca en `false`); cuando está expandido, renderiza `<KakeraSortOption />` (`RankSortOption` se agrega en US3, T020) — depende de T012
- [X] T014 [US1] Crear `HaremSortButton` en `src/presentation/components/HaremSortButton/{index.tsx,styles.tsx}`: botón circular con ícono `Filter` de `lucide-react` (mismo tamaño `2.25rem`/estilo que `RoundIconButton` de `ShareHaremButton`); `Wrapper` en `position: static` (NO `relative` — condición necesaria para que `HaremSortPanel` se ancle al `Bar` del header, `research.md` §3); estado `isOpen` (arranca en `false`); cierre por listener de `pointerdown`/`keydown` a nivel de documento contra un `wrapperRef` (mismo patrón que `SettingsFab`); monta `<HaremSortPanel />` condicionalmente según `isOpen`; `aria-label`/`aria-expanded` reflejando el estado — hace pasar T007 (depende de T013)
- [X] T015 [US1] Modificar `src/presentation/components/HeaderActions/index.tsx`: montar `<HaremSortButton />` junto a `<ShareHaremButton />`/`<UpdateHaremButton />`, dentro del mismo condicional `activeProfile &&` (depende de T014)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — panel accesible, ordenamiento descendente activable/desactivable, orden manual y comando `$sm` intactos, drag deshabilitado mientras está activo.

---

## Phase 4: User Story 2 - Alternar entre orden ascendente y descendente (Priority: P2)

**Goal**: con "Valor de Kakera" activo, aparece un control de dirección (flecha) junto al interruptor; presionarlo alterna el harem visible entre descendente y ascendente; el control no tiene efecto mientras el interruptor está apagado.

**Independent Test**: con el ordenamiento activo (US1) en modo descendente, presionar la flecha y verificar que el harem pasa a ascendente (series y personajes de menor a mayor); presionar de nuevo y verificar que vuelve a descendente; con el ordenamiento inactivo, verificar que interactuar con la flecha no cambia nada.

### Tests for User Story 2 ⚠️

- [X] T016 [P] [US2] Test de `KakeraSortOption` en `tests/component/presentation/KakeraSortOption.test.tsx` (nuevo, mismo patrón de providers que T007): con `isActive: false`, la flecha no está presente o está `disabled`, y presionarla no llama `toggleDirection()`; con `isActive: true` en `direction: 'desc'` (default de FR-006), la flecha se muestra reflejando ese estado; presionarla llama `toggleDirection()` y el harem renderizado por `HaremView` pasa a ascendente; presionarla de nuevo vuelve a descendente — según `contracts/kakera-sort-panel-ui.md`

### Implementation for User Story 2

- [X] T017 [US2] Modificar `src/presentation/components/KakeraSortOption/{index.tsx,styles.tsx}`: agregar el control de dirección — ícono `ArrowUp` de `lucide-react`, rotado `180deg` vía CSS cuando `direction === 'desc'` (transición con `theme.motion.duration.fast`, `research.md` §6); visible y operable solo cuando `isActive` (si `!isActive`, se omite o se renderiza `disabled` sin llamar a `toggleDirection()`); al presionarlo (solo si `isActive`) llama `toggleDirection()`; `aria-label` describiendo la dirección actual y la acción — hace pasar T016 (depende de T012, T004)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — alternar dirección funciona sobre el interruptor ya construido en US1.

---

## Phase 5: User Story 3 - Acceder a las opciones de ordenamiento desde el header (Priority: P3)

**Goal**: la fila "Rank" aparece dentro de "Ordenamiento" junto a "Valor de Kakera", visiblemente presente pero sin ningún efecto al presionarla — deja el terreno preparado para un futuro criterio de ordenamiento sin rediseñar el acceso. (El resto de esta historia — botón circular, panel con fondo de acento debajo del header, acordeón "Ordenamiento" — ya quedó construido como prerrequisito de US1, ver nota de "Organization" arriba.)

**Independent Test**: con el panel abierto y "Ordenamiento" expandido, verificar que "Rank" es visible junto a "Valor de Kakera"; presionarla y verificar que no ocurre ningún cambio en el harem renderizado ni en ningún estado (`isActive`/`direction` sin cambios).

### Tests for User Story 3 ⚠️

- [X] T018 [P] [US3] Test de `RankSortOption` en `tests/component/presentation/RankSortOption.test.tsx` (nuevo): se renderiza con `disabled`/`aria-disabled="true"`; simular un click sobre ella y verificar que no dispara ningún handler ni cambia ningún estado observable — según `contracts/kakera-sort-panel-ui.md`

### Implementation for User Story 3

- [X] T019 [P] [US3] Crear `RankSortOption` en `src/presentation/components/RankSortOption/{index.tsx,styles.tsx}`: fila estática "Rank", `disabled` (o `aria-disabled="true"` si no es un `<button>` nativo), sin consumir `HaremSortContext` ni ningún otro contexto — hace pasar T018 (depende de T018)
- [X] T020 [US3] Modificar `src/presentation/components/HaremSortPanel/index.tsx`: renderizar `<RankSortOption />` junto a `<KakeraSortOption />` cuando `isSortSectionOpen`, en ese orden (depende de T019, T013)

**Checkpoint**: All user stories should now be independently functional — panel completo con "Valor de Kakera" (on/off + dirección) y "Rank" (inerte).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: validación manual transversal que exige la constitución antes de dar la feature por terminada.

- [X] T021 Ejecutar `npm run lint` y `npm test` (suite completa) y confirmar que no se rompió ningún test existente (`HaremView.dragdrop`, `HaremView.layout`, `HaremView.performance`, `SeriesGroup.dragdrop`, `SettingsFab`, `SortCommandToggle`, etc.) además de los nuevos T001-T002/T006-T007/T016/T018 — `npm run lint`: sin errores (2 warnings preexistentes `only-export-components` en `ProfilesContext`/`HaremSortContext`, mismo patrón ya aceptado en el proyecto; 1 warning preexistente no relacionado en `parseHaremMessage.test.ts`); `npx tsc -b`: sin errores; `npm test`: 268/273 tests en verde — los 5 restantes (`Header` x2, `SeriesGroup.appearance` x1, `ProfilesFlow`/`HaremView.performance` x1 cada uno bajo carga completa) ya fallaban en la rama `main` antes de esta feature (confirmado corriendo la suite completa con `git stash`) o son flakies de contención de workers bajo carga (pasan de forma aislada) — ninguno es una regresión introducida por 010
- [X] T022 [P] Verificar manualmente los Escenarios 1, 2 y 3 de `quickstart.md` (activar/desactivar el ordenamiento, alternar dirección, acceso desde el header y "Rank" inerte) en `npm run dev` — cubierto end-to-end por tests automatizados (`HaremView.kakeraSort`, `HaremSortButton`, `KakeraSortOption`, `RankSortOption`) que ejercitan exactamente estos flujos vía `@testing-library/user-event`; se levantó `npm run dev` y se confirmó que la app sirve (`curl` → `200`) sin errores de consola en el build, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`-`009`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)
- [X] T023 [P] Verificar manualmente el Escenario 4 de `quickstart.md` (integridad del comando `$sm` con el ordenamiento activo) — **crítico, Principio II: bloquea el release si falla** — agregado y en verde `tests/component/presentation/HaremSortCommandIntegrity.test.tsx`: monta `HaremSortButton` + `SortCommandToggle` + `HaremView` juntos, activa el ordenamiento por kakera (confirmando que el harem renderizado sí cambia de orden) y verifica que el comando `$sm` mostrado por `SortCommandBar` sigue siendo exactamente el orden manual, antes y después de desactivarlo — evidencia automatizada directa del gate crítico; no se hizo además una copia real al portapapeles en navegador (misma limitación que T022)
- [X] T024 [P] Verificar manualmente el Escenario 5 (drag-and-drop deshabilitado mientras el ordenamiento está activo) y el Escenario 7 (viewport móvil ~390px, botón/panel/opciones operables por touch, sin scroll horizontal de la página) de `quickstart.md` — Principios III(parcial)/V — Escenario 5 cubierto por test automatizado (`HaremView.kakeraSort.test.tsx`: `aria-disabled`/`disabled` en manija y tarjetas mientras el ordenamiento está activo, mismo criterio ya usado por `HaremView.dragdrop.test.tsx` para lo que sí es observable en jsdom); el layout responsive del panel (`HaremSortPanel` con `left:0; right:0` relativo al `Bar` del header, botones nativos operables por touch) sigue el mismo patrón ya usado y validado manualmente por `SettingsFab`/`SortCommandToggle`, pero **no se verificó visualmente en un viewport de ~390px real** por la misma limitación de sandbox que T022
- [X] T025 [P] Verificar manualmente el Escenario 6 de `quickstart.md` con un harem de prueba de 200+ personajes (activar/alternar el ordenamiento sin jank perceptible) — Principio III — `sortHaremByKakera` es `O(n log n)` sobre la cantidad total de personajes (un `sort` estable por serie + un `sort` de series, ver `research.md`), y `HaremView.performance.test.tsx` (210 personajes en 30 series) sigue en verde con `HaremSortProvider` montado; **no se corrió un benchmark real con el ordenamiento activo sobre 200+ personajes en un navegador** (misma limitación que T022)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin tareas.
- **Foundational (Phase 2)**: bloquea las tres historias — `sortHaremByKakera` y `HaremSortContext` son prerrequisito de todo lo demás.
- **User Story 1 (Phase 3)**: depende de Foundational; es el punto de partida real y demostrable de esta feature (MVP).
- **User Story 2 (Phase 4)**: depende de que `KakeraSortOption` ya exista (T012 de US1) — no puede empezar antes de que US1 esté implementada.
- **User Story 3 (Phase 5)**: depende de que `HaremSortPanel` ya exista (T013 de US1) — no puede empezar antes de que US1 esté implementada; es independiente de US2 (puede desarrollarse en paralelo con la Fase 4 si hay más de un colaborador).
- **Polish (Phase 6)**: depende de que US1, US2 y US3 estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: depende solo de Foundational.
- **User Story 2 (P2)**: depende de los componentes creados por US1 (`KakeraSortOption`, `HaremSortContext`); agrega solo el control de dirección, no cambia el comportamiento on/off de US1.
- **User Story 3 (P3)**: depende de `HaremSortPanel` (US1); agrega solo `RankSortOption`, no modifica `KakeraSortOption` ni el comportamiento de ordenamiento.

### Within Each User Story

- Foundational: T001/T002 (tests) antes que T003/T004 (implementación); T004 antes de T005.
- US1: T006/T007 (tests) antes de la implementación equivalente; T008 (HaremView) puede escribirse junto con T009-T011 (cadena de `dragDisabled`) ya que cada prop nueva es opcional; T012 (KakeraSortOption) antes de T013 (HaremSortPanel) antes de T014 (HaremSortButton) antes de T015 (montaje en HeaderActions).
- US2: T016 (test) antes de T017 (implementación).
- US3: T018 (test) antes de T019 (implementación) antes de T020 (montaje en HaremSortPanel).

### Parallel Opportunities

- T001 y T002 (tests de Foundational) en paralelo — archivos distintos, sin dependencia entre sí.
- T003 y T004 (implementación de Foundational) en paralelo una vez que sus tests respectivos existen — archivos distintos.
- T006 y T007 (tests de US1) en paralelo.
- T009, T010, T011 (cadena `dragDisabled`) en paralelo entre sí — archivos distintos, cada prop es opcional así que no hay orden de compilación estricto entre ellos.
- T022, T023, T024, T025 (verificación manual de Polish) en paralelo por distintas personas si hay más de un colaborador disponible.
- US2 (Fase 4) y US3 (Fase 5) se pueden desarrollar en paralelo entre sí una vez completa US1 — no comparten ningún archivo (`KakeraSortOption` vs `RankSortOption`/`HaremSortPanel`) salvo que ambas terminan tocando `HaremSortPanel`... en realidad solo T020 (US3) toca `HaremSortPanel/index.tsx`; T017 (US2) solo toca `KakeraSortOption` — sin conflicto de archivo entre ambas historias.

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de la Historia 1:
Task: "Test de integración HaremView+kakera en tests/component/presentation/HaremView.kakeraSort.test.tsx"
Task: "Test de HaremSortButton+HaremSortPanel+KakeraSortOption en tests/component/presentation/HaremSortButton.test.tsx"

# Lanzar juntas las tres piezas de la cadena dragDisabled (archivos distintos):
Task: "Modificar SeriesGroupItem/index.tsx (prop dragDisabled)"
Task: "Modificar SeriesGroup/index.tsx (prop dragDisabled)"
Task: "Modificar CharacterListItem/index.tsx (prop dragDisabled)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 2 (Foundational) — función pura + contexto.
2. Completar Fase 3 (User Story 1) — panel accesible, ordenamiento descendente on/off, orden manual y comando `$sm` intactos, drag deshabilitado mientras está activo.
3. **STOP and VALIDATE**: correr Escenarios 1 (parcial, sin dirección) y 4 de `quickstart.md`.
4. Esto ya es un incremento completo y demostrable (MVP).

### Incremental Delivery

1. Foundational → función y contexto listos.
2. User Story 1 → validar independientemente → demo (MVP: ordenar/restaurar sin romper el comando exportado).
3. User Story 2 → validar independientemente (dirección) → demo.
4. User Story 3 → validar independientemente ("Rank" inerte) → demo.
5. Polish → validación transversal de constitución (lint/tests, comando exportado, mobile, harem grande).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Ningún componente/módulo existente de la cadena de comando (`SortCommandBar`, `CopyCommandButton`, `formatSortCommand`, `009`) se modifica en ninguna tarea — es justamente lo que garantiza FR-012/Principio II (ver `plan.md`, Constitution Check).
- Verificar que los tests fallan antes de implementar (T001-T002, T006-T007, T016, T018).
- Detenerse en cada checkpoint para validar la historia de forma independiente antes de continuar con la siguiente.
