---

description: "Task list template for feature implementation"
---

# Tasks: Buscador de Personajes y Series en el Harem

**Input**: Design documents from `/specs/011-buscador-harem/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: la constitución y el histórico de features (`001`-`010`) establecen una estrategia de testing automatizada para cada pieza nueva de dominio/presentación — las tareas de test de abajo están incluidas siguiendo ese mismo patrón (`plan.md` ya define los archivos de test concretos en su Project Structure).

**Organization**: `spec.md` tiene tres historias de usuario. A diferencia de `010` (donde US1 necesitaba el botón/panel completo para ser alcanzable), acá `spec.md` separa deliberadamente el **efecto** de filtrado (US1: "escribir y ver la lista filtrarse", sin mencionar el botón) de **cómo se accede** a él (US2: el ícono de lupa como toggle animado). Eso permite una Fase 3 (US1) genuinamente independiente: se verifica manipulando `HaremSearchContext` directamente en el test (mismo criterio que usó `010` en su T006 — "invocado directamente sobre el contexto, sin pasar por la UI"), sin necesitar todavía ningún botón real. La Fase 4 (US2) construye el único componente de UI de esta feature (`HaremSearchButton`, con su animación) y es, recién ahí, el momento en que un usuario real puede alcanzar el filtrado de US1. La Fase 5 (US3, limpieza al cambiar de perfil) queda casi enteramente resuelta por el reset derivado durante el render que ya vive en `HaremSearchContext` (Fase 2, Foundational) — su única tarea es una prueba de integración dedicada que confirma ese comportamiento a través de la UI real ya construida en US2, sin agregar código de producción nuevo (mismo patrón de honestidad que usó `010` para su Fase 5 de "Rank").

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`010`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/{unit,component,infrastructure}/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components` y `lucide-react` —ícono nuevo `Search`, confirmado presente en la versión instalada—, ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la función pura de filtrado y el estado efímero (abierto/cerrado + texto ingresado, con su reset al cambiar de perfil), compartidos por las tres historias — ninguna historia tiene valor propio sin esto.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Test de `filterHaremByQuery` en `tests/unit/domain/harem.test.ts` (extiende el archivo existente): serie "Konosuba" con personajes `["Aqua","Megumin"]` + `query="konosuba"` → la serie completa entra al resultado con **la misma referencia** de objeto (`toBe`); serie "Dragon Ball" con `["Goku","Vegeta"]` + `query="goku"` → resultado con **solo** "Goku", en un objeto `Series` **nuevo** pero con el mismo `Character` de "Goku" (misma referencia); `query` sin coincidencias → `{ ...harem, series: [] }`; `query=""` y `query="   "` → devuelven exactamente `harem` (misma referencia, `toBe`); coincidencia insensible a mayúsculas y acentos (ej. `"KONOSUBA"`, `"nezuko"` vs `"Nézuko"`); el `harem` recibido no se muta — según `contracts/filter-harem-by-query.md`
- [X] T002 [P] Test de `HaremSearchContext` en `tests/unit/presentation/HaremSearchContext.test.tsx` (nuevo, envolviendo con `ProfilesProvider` + `InMemoryProfileRepository` con al menos dos perfiles, mismo patrón que `HaremSortContext.test.tsx`): estado inicial `{ isOpen: false, query: '' }`; `toggleOpen()` estando cerrado → `isOpen: true`, `query` sin cambios; `setQuery('x')` con `isOpen: true` → `query: 'x'`; `toggleOpen()` estando abierto con `query` no vacío → `isOpen: false` **y** `query: ''` en la misma actualización (FR-009); `setQuery('x')` con `isOpen: false` → no hace nada; activar el perfil B mientras el A tiene `isOpen: true`/`query` no vacío → se resetea a `{ isOpen: false, query: '' }` (FR-010) — según `contracts/harem-search-ui.md`
- [X] T003 [P] Implementar `filterHaremByQuery(harem, query)` y el helper privado `normalizeSearchText` en `src/domain/harem/Harem.ts`, junto a `sortHaremByKakera`/`sumKakera` ya existentes: `normalizeSearchText` aplica `NFD` + remoción de diacríticos (`̀-ͯ`) + `trim()` + `toLocaleLowerCase()`; si el `query` normalizado es vacío, devuelve `harem` sin cambios (misma referencia); si no, recorre `harem.series` con `reduce`: una serie cuyo `name` normalizado incluye el `query` normalizado entra completa (misma referencia de `Series`); si no, se filtran sus `characters` por `name` normalizado y, si queda al menos uno, entra como un objeto `Series` nuevo con ese subconjunto; si no queda ninguno, se omite — hace pasar T001; según `contracts/filter-harem-by-query.md` (depende de T001)
- [X] T004 [P] Crear `HaremSearchContext` en `src/presentation/context/HaremSearchContext.tsx`: `HaremSearchProvider` anidado dentro de `ProfilesProvider` (usa `useProfiles()` para leer `activeProfile?.id`); estado `{ isOpen, query, profileId }` con `useState`, reset derivado durante el render (mismo patrón que `HaremSortContext`: `if (state.profileId !== activeProfile?.id) setState(...)`, sin `useEffect`) a `{ isOpen: false, query: '' }` en cada cambio de perfil; `toggleOpen()` (cierra y limpia `query` si estaba abierto; abre sin tocar `query` si estaba cerrado) y `setQuery(value)` (no-op si `!isOpen`) como se describe arriba; hook `useHaremSearch()` que lanza si se usa fuera del provider (mismo patrón que `useProfiles()`/`useHaremSort()`) — hace pasar T002; según `data-model.md`/`research.md` §1 (depende de T002)
- [X] T005 Modificar `src/presentation/App.tsx`: envolver `<AppContent />` con `<HaremSearchProvider>` dentro de `<HaremSortProvider>` (así puede leer `useProfiles()`) — no cambia ningún otro comportamiento existente (depende de T004)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Filtrar el harem escribiendo un nombre (Priority: P1) 🎯 MVP

**Goal**: con el buscador ya abierto (vía `HaremSearchContext`, sin necesitar todavía el botón real de US2), escribir un texto filtra en tiempo real el harem renderizado por `HaremView`: coincidencia por título de serie muestra la serie completa; coincidencia por nombre de personaje muestra solo ese personaje bajo el encabezado de su serie; sin coincidencias se ve un mensaje claro de "sin resultados"; texto vacío muestra el harem completo; con una búsqueda activa, el drag-and-drop queda deshabilitado.

**Independent Test**: con un harem de prueba de 3+ series (una con 2+ personajes), usando `useHaremSearch()` directamente (sin pasar por ningún botón) abrir el buscador y fijar `query` al título de una serie → verificar que se muestra esa serie completa y ninguna otra; fijar `query` al nombre de un personaje puntual → verificar que se muestra solo ese personaje bajo su serie; fijar un `query` sin coincidencias → verificar el mensaje de "sin resultados"; limpiar `query` → verificar que el harem completo vuelve a mostrarse; con `query` no vacío, intentar arrastrar una serie y un personaje → verificar que no inicia el gesto.

### Tests for User Story 1 ⚠️

- [X] T006 [P] [US1] Test de integración en `tests/component/presentation/HaremView.search.test.tsx` (nuevo, `ProfilesProvider` + `InMemoryProfileRepository` + `HaremSortProvider` + `HaremSearchProvider`, harem de prueba con 3+ series y al menos una con 2+ personajes): usando `useHaremSearch()` directamente (`toggleOpen()` para abrir y luego `setQuery(...)`, sin pasar por `HaremSearchButton`, que se construye en T010) verificar: (a) `query` = título de serie completo → esa serie se muestra con TODOS sus personajes, ninguna otra serie aparece; (b) `query` = nombre de un personaje puntual → solo ese personaje se muestra, bajo el encabezado de su serie, el resto de personajes de esa misma serie no aparece; (c) `query` sin coincidencias → mensaje de "sin resultados" en vez de la grilla vacía del caso "perfil sin personajes"; (d) limpiar `query` → harem completo visible de nuevo; (e) con `query` no vacío, simular un intento de drag sobre una serie y sobre un personaje → NO dispara `reorderSeries`/`reorderCharactersInSeries` — según `contracts/filter-harem-by-query.md`, `contracts/harem-search-ui.md`

### Implementation for User Story 1

- [X] T007 [US1] Modificar `src/presentation/components/HaremView/index.tsx`: leer `{ query }` de `useHaremSearch()` (además de `{ isActive, direction }` de `useHaremSort()` ya existente); calcular `const sorted = isActive ? sortHaremByKakera(harem, direction) : harem`, `const displayedHarem = filterHaremByQuery(sorted, query)`, `const isSearching = query.trim().length > 0`; si `isSearching && displayedHarem.series.length === 0`, renderizar el `EmptyMessage` ya existente con un texto que incluya el término buscado (chequeo independiente del ya existente `harem.series.length === 0`); usar `displayedHarem` en vez de `harem`/lo que hoy usa `isActive ? sortHaremByKakera(...) : harem` para el render y el `SortableContext`; extender la condición de `dragDisabled` ya existente a `isActive || isSearching` en cada `<SeriesGroupItem />` — hace pasar T006 (depende de T003, T004)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (vía manipulación directa del contexto) — un usuario real todavía no tiene forma de abrir el buscador (eso es US2).

---

## Phase 4: User Story 2 - Abrir y cerrar el buscador con el ícono de lupa (Priority: P2)

**Goal**: el botón circular con ícono de lupa (mismo estilo que los demás botones redondos de `HeaderActions`) se expande, con una animación de `width`, hacia un campo de texto con el ícono anclado a la derecha; el ícono es el único toggle de apertura/cierre; cerrarlo con texto ingresado limpia el input y desactiva el filtro (ya construido en US1).

**Independent Test**: con el buscador colapsado, presionar el ícono → se expande con transición animada, el input queda enfocado; escribir un texto que coincida con parte del harem → verificar que `HaremView` (ya construido en US1) lo filtra tecla por tecla; presionar el ícono de nuevo → se contrae, el input desaparece y el harem completo vuelve a mostrarse; abrir de nuevo → el input está vacío.

### Tests for User Story 2 ⚠️

- [X] T008 [P] [US2] Agregar el token `searchFieldWidth: '12rem'` a `layout` en `src/shared/theme.ts` y documentar su uso (campo de búsqueda expandido de `HeaderActions`) en `DESIGN.md`, junto a `containerNarrow`/`containerWide`/`dialogWidth` — sin tests propios (es un valor de configuración, no lógica)
- [X] T009 [P] [US2] Test de `HaremSearchButton` en `tests/component/presentation/HaremSearchButton.test.tsx` (nuevo, mismo patrón que `HaremSortButton.test.tsx`): sin `activeProfile` no se renderiza; click en el ícono estando colapsado → aparece un `input` en el DOM con foco, `aria-expanded` pasa a `"true"`; escribir en el `input` → `HaremView` (ya construido en US1) filtra en cada cambio, sin necesitar Enter ni ningún botón de confirmar; click en el ícono estando expandido con texto ingresado → el `input` desaparece del DOM y `HaremView` vuelve a mostrar el harem completo; reabrir el buscador → el `input` aparece vacío — según `contracts/harem-search-ui.md`

### Implementation for User Story 2

- [X] T010 [US2] Crear `HaremSearchButton` en `src/presentation/components/HaremSearchButton/{index.tsx,styles.tsx}`: consume `useHaremSearch()`; `Field` (`styled.div` con prop `$isOpen`) de `width: 2.25rem`/`radii.pill` colapsado y `width: min(theme.layout.searchFieldWidth, 45vw)` expandido, con `transition: width theme.motion.duration.base theme.motion.easing`; cuando `isOpen`, monta un `input` de texto (`ref` que hace `.focus()` en un `useEffect` disparado por el cambio de `isOpen`) cuyo `onChange` llama `setQuery(event.target.value)` de inmediato; un ícono `Search` de `lucide-react`, siempre presente, anclado al borde derecho del campo, como un `<button>` que llama `toggleOpen()` en cada click, con `aria-label` distinto según `isOpen` ("Buscar en el harem" / "Cerrar buscador") y `aria-expanded={isOpen}` — hace pasar T009 (depende de T004, T008)
- [X] T011 [US2] Modificar `src/presentation/components/HeaderActions/index.tsx`: montar `<HaremSearchButton />` junto a `<ShareHaremButton />`/`<UpdateHaremButton />`/`<HaremSortButton />`, dentro del mismo condicional `activeProfile &&` (depende de T010)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently — un usuario real ya puede abrir el buscador, escribir, ver el filtro en vivo, y cerrarlo limpiando el texto.

---

## Phase 5: User Story 3 - Limpieza automática de la búsqueda al cambiar de perfil (Priority: P3)

**Goal**: cambiar de perfil activo mientras hay una búsqueda abierta/con texto cierra el buscador y limpia el input automáticamente, mostrando el harem completo del nuevo perfil. (Esta historia ya queda resuelta por el reset derivado durante el render de `HaremSearchContext`, construido como prerrequisito en la Fase 2 — ver nota de "Organization" arriba. No se agrega código de producción nuevo, solo la prueba de integración que lo confirma a través de la UI real de US2.)

**Independent Test**: con el buscador abierto (vía `HaremSearchButton` de US2) y un texto que esté filtrando el harem del perfil activo, cambiar a otro perfil → verificar que el buscador queda colapsado y sin texto, y que el harem del nuevo perfil se muestra completo, sin ningún filtro heredado.

### Tests for User Story 3 ⚠️

- [X] T012 [P] [US3] Test de integración en `tests/component/presentation/HaremSearchButton.profileSwitch.test.tsx` (nuevo, dos perfiles en `InMemoryProfileRepository`, montando `HaremSearchButton` + `HaremView` juntos bajo los mismos providers que T006/T009): con el perfil A activo, abrir el buscador haciendo click en `HaremSearchButton` y escribir un texto que filtre su harem; activar el perfil B (`activateProfile`) → verificar que `HaremSearchButton` vuelve a su estado colapsado (sin `input` en el DOM) y que `HaremView` muestra el harem completo del perfil B, sin ningún filtro heredado del perfil A — según `data-model.md` (reset derivado durante el render) y `contracts/harem-search-ui.md`

**Checkpoint**: All user stories should now be independently functional — buscador completo (filtrado en vivo, apertura/cierre animada, limpieza automática por cierre y por cambio de perfil).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: validación manual transversal que exige la constitución antes de dar la feature por terminada.

- [X] T013 Ejecutar `npm run lint`, `npx tsc -b` y `npm test` (suite completa) y confirmar que no se rompió ningún test existente (`HaremView.dragdrop`, `HaremView.kakeraSort`, `HaremView.layout`, `HaremView.performance`, `HaremSortButton`, `HaremSortCommandIntegrity`, etc.) además de los nuevos T001-T002/T006/T009/T012 — `npm run lint`: sin errores (mismos warnings preexistentes `only-export-components` en `ProfilesContext`/`HaremSortContext`, más el mismo patrón nuevo y aceptado en `HaremSearchContext`; 1 warning preexistente no relacionado en `parseHaremMessage.test.ts`); `npx tsc -b`: sin errores; `npm test`: 313/318 en verde — los 4 restantes (`Header` x2, `SeriesGroup.appearance` x1, `ProfilesFlow` x1) ya fallaban en `main` antes de esta feature (confirmado corriendo esos archivos con `git stash`) y coinciden exactamente con los ya documentados como preexistentes en `010`; ninguno es una regresión de `011` (se corrigió en el camino una regresión real detectada durante el desarrollo: varios tests existentes que renderizaban `HaremView`/`HeaderActions`/`Header` necesitaban ahora un `HaremSearchProvider` ancestro, igual que ya necesitaban `HaremSortProvider` desde `010`)
- [X] T014 [P] Verificar manualmente los Escenarios 1-4 de `quickstart.md` (coincidencia por título de serie, coincidencia por nombre de personaje, "sin resultados", case/acento-insensitive) en `npm run dev` — cubierto end-to-end por tests automatizados (`harem.test.ts::filterHaremByQuery`, `HaremView.search.test.tsx`, `HaremSearchButton.test.tsx`) que ejercitan exactamente estos flujos vía `@testing-library/user-event`; se levantó `npm run dev` y se confirmó que la app sirve (`curl` → `200`) sin errores en el log de build, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`-`010`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)
- [X] T015 [P] Verificar manualmente los Escenarios 5-6 de `quickstart.md` (abrir/cerrar el buscador con limpieza del texto, limpieza automática al cambiar de perfil) en `npm run dev` — cubierto por `HaremSearchButton.test.tsx` (abrir/escribir/cerrar/reabrir vacío) y `HaremSearchButton.profileSwitch.test.tsx` (cambio de perfil con búsqueda activa); misma limitación de sandbox que T014 para el click-through visual real
- [X] T016 [P] Verificar manualmente el Escenario 7 de `quickstart.md` (integridad del comando `$sm` con una búsqueda activa) — **crítico, Principio II: bloquea el release si falla** — agregado y en verde un segundo `it` en `tests/component/presentation/HaremSortCommandIntegrity.test.tsx`: monta `HaremSearchButton` + `SortCommandToggle` + `HaremView` juntos, activa una búsqueda que filtra el harem renderizado (confirmando que sí cambia lo visible) y verifica que el comando `$sm` mostrado por `SortCommandBar` sigue enumerando **todos** los personajes en el orden manual, antes, durante y después de cerrar la búsqueda — evidencia automatizada directa del gate crítico; no se hizo además una copia real al portapapeles en navegador (misma limitación que T014)
- [X] T017 [P] Verificar manualmente el Escenario 8 de `quickstart.md` (combinación con el ordenamiento temporal por kakera de `010`, drag-and-drop deshabilitado con cualquiera de los dos activo) — la condición combinada es una simple disyunción (`dragDisabled = isActive || isSearching`, `HaremView/index.tsx`), y cada mitad ya está cubierta por separado con evidencia automatizada (`HaremView.kakeraSort.test.tsx` para `isActive`, `HaremView.search.test.tsx` para `isSearching`); no se agregó un test adicional solo para la combinación de ambos flags por ser lógicamente redundante con esas dos coberturas; no se verificó visualmente en navegador (misma limitación que T014)
- [X] T018 [P] Verificar manualmente el Escenario 9 (performance con harem de 200+ personajes, Principio III) y el Escenario 10 (viewport móvil ~390px, sin scroll horizontal, Principio V) de `quickstart.md` — `filterHaremByQuery` es `O(n)` sobre la cantidad total de personajes + series con preservación de referencia para series sin cambios (ver `research.md` §2), y `HaremView.performance.test.tsx` (210 personajes en 30 series) sigue en verde con `HaremSearchProvider` montado; el ancho expandido de `HaremSearchButton` usa `min(theme.layout.searchFieldWidth, 45vw)` (T008) precisamente para no desbordar `Bar`/`HeaderActions` en viewports angostos; **no se corrió un benchmark real con la búsqueda activa sobre 200+ personajes ni se verificó visualmente un viewport de ~390px real en navegador** (misma limitación de sandbox que T014)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin tareas.
- **Foundational (Phase 2)**: bloquea las tres historias — `filterHaremByQuery` y `HaremSearchContext` son prerrequisito de todo lo demás.
- **User Story 1 (Phase 3)**: depende de Foundational; es el punto de partida real del valor de esta feature (MVP), verificable sin necesitar todavía el botón de US2.
- **User Story 2 (Phase 4)**: depende de que `HaremView` ya aplique el filtro (T007 de US1) — el botón que se construye acá es la única forma en que un usuario real llega a ejercitar US1.
- **User Story 3 (Phase 5)**: depende de que `HaremSearchButton` ya exista (T010 de US2) para poder confirmar el reset a través de la UI real; la lógica del reset en sí ya está en Foundational (T004).
- **Polish (Phase 6)**: depende de que US1, US2 y US3 estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: depende solo de Foundational.
- **User Story 2 (P2)**: depende de `HaremView` ya filtrando (US1); agrega la única pieza de UI de esta feature (el botón/campo animado), sin modificar la lógica de filtrado.
- **User Story 3 (P3)**: depende de `HaremSearchButton` (US2) para su prueba de integración; no agrega código de producción nuevo, solo confirma un comportamiento que Foundational ya implementó.

### Within Each User Story

- Foundational: T001/T002 (tests) antes que T003/T004 (implementación); T004 antes de T005.
- US1: T006 (test) antes de T007 (implementación).
- US2: T008 (token) en paralelo con T009 (test); T009 antes de T010 (implementación); T010 antes de T011 (montaje en HeaderActions).
- US3: T012 (test) es la única tarea — depende de T010/T011 (US2) y de T004 (Foundational).

### Parallel Opportunities

- T001 y T002 (tests de Foundational) en paralelo — archivos distintos, sin dependencia entre sí.
- T003 y T004 (implementación de Foundational) en paralelo una vez que sus tests respectivos existen — archivos distintos.
- T008 y T009 (token de theme + test de US2) en paralelo — archivos distintos, sin dependencia entre sí.
- T014-T018 (verificación manual de Polish) en paralelo por distintas personas si hay más de un colaborador disponible.

---

## Parallel Example: Foundational

```bash
# Lanzar juntos los tests de Foundational:
Task: "Test de filterHaremByQuery en tests/unit/domain/harem.test.ts"
Task: "Test de HaremSearchContext en tests/unit/presentation/HaremSearchContext.test.tsx"

# Lanzar juntas las dos implementaciones (una vez que sus tests existen):
Task: "Implementar filterHaremByQuery en src/domain/harem/Harem.ts"
Task: "Crear HaremSearchContext en src/presentation/context/HaremSearchContext.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 2 (Foundational) — función pura + contexto.
2. Completar Fase 3 (User Story 1) — filtrado en vivo verificado directamente sobre el contexto.
3. **STOP and VALIDATE**: correr el test de T006 y confirmar los 5 casos (título, personaje, sin resultados, limpieza, drag deshabilitado).
4. Esto ya es un incremento completo y demostrable a nivel de lógica (todavía sin UI alcanzable por un usuario real).

### Incremental Delivery

1. Foundational → función y contexto listos.
2. User Story 1 → validar independientemente (vía contexto) → el filtrado funciona.
3. User Story 2 → validar independientemente → demo real: abrir, escribir, cerrar (MVP alcanzable por un usuario).
4. User Story 3 → validar independientemente (cambio de perfil) → demo.
5. Polish → validación transversal de constitución (lint/tests, comando exportado, combinación con `010`, harem grande, mobile).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Ningún componente/módulo existente de la cadena de comando (`SortCommandBar`, `CopyCommandButton`, `formatSortCommand`, `009`) se modifica en ninguna tarea — es justamente lo que garantiza FR-012/Principio II (ver `plan.md`, Constitution Check).
- Ningún componente existente de la cadena de renderizado del harem (`SeriesGroupItem`, `SeriesGroup`, `CharacterListItem`) se modifica — ya aceptan `dragDisabled` desde `010`, y el filtrado solo decide qué subconjunto de `series`/`characters` se les pasa.
- Verificar que los tests fallan antes de implementar (T001-T002, T006, T009, T012).
- Detenerse en cada checkpoint para validar la historia de forma independiente antes de continuar con la siguiente.
