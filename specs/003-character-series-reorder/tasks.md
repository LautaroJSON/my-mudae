---

description: "Task list template for feature implementation"
---

# Tasks: Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop

**Input**: Design documents from `/specs/003-character-series-reorder/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`/`002`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: las tareas están agrupadas por historia de usuario (spec.md) para poder implementar y testear cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1-US3)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`/`002`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva
(`@dnd-kit/*` ya está instalado desde `002`; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — a diferencia de `002`, ningún tipo de dominio cambia de
forma (`Series`/`Character`/`Harem` no ganan campos nuevos; el orden ya
es el orden del array, ver `data-model.md`) ni hay ninguna migración
pendiente. Las tres historias pueden empezar directamente.

---

## Phase 3: User Story 1 - Ver el harem agrupado por serie en una cuadrícula tipo flex-wrap (Priority: P1) 🎯 MVP

**Goal**: los grupos de serie del harem del perfil activo dejan de ocupar
una fila completa cada uno y se acomodan lado a lado (ancho de columna
fijo), envolviendo a la fila siguiente cuando ya no entra otro, en
cualquier tamaño de pantalla.

**Independent Test**: abrir un perfil con 2+ series en una pantalla
ancha y verificar que aparecen lado a lado; achicar la ventana hasta
mobile y verificar que se acomodan de a una por fila sin romperse ni
requerir recargar.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test de layout en `tests/component/presentation/HaremView.layout.test.tsx`: con un harem de 2+ series, el contenedor de `HaremView` tiene `flex-wrap: wrap` (estilo computado) y cada grupo de serie renderizado tiene el ancho fijo `theme.layout.seriesGroupWidth`, según `data-model.md`/`contracts/series-layout-dnd-ui.md`

### Implementation for User Story 1

- [X] T002 [P] [US1] Agregar el token `layout.seriesGroupWidth` (`24rem`) a `src/shared/theme.ts`, según `data-model.md`
- [X] T003 [P] [US1] Documentar `seriesGroupWidth` en `DESIGN.md` §5 (Layout Principles), junto al resto de anchos de layout, según `research.md`
- [X] T004 [US1] Fijar `width: theme.layout.seriesGroupWidth` en `Section` (`src/presentation/components/SeriesGroup/styles.tsx`) (depende de T002); debe ayudar a hacer pasar T001 — **ajustado dos veces en ejecución**: (1, detectado en Polish/T027) un ancho fijo puro desbordaba horizontalmente en viewports angostos (24rem = 384px > espacio disponible en ~390px con el padding de `HaremView.Container`), se cambió a `width: min(seriesGroupWidth, 100%)`; (2, corrección post-implementación pedida por el usuario con una referencia visual) ese ancho de columna fijo/uniforme no era el comportamiento correcto — cada serie debe medir el ancho de su propio contenido y empaquetarse lado a lado ("justificado"), no una cuadrícula de columnas parejas. Se eliminó el token `theme.layout.seriesGroupWidth` por completo: `Section` queda sin `width` propio (tamaño de contenido por defecto de un ítem flex) + `max-width: 100%` como tope defensivo para mobile; `HaremView.Container` suma `align-items: flex-start`. Ver Addendum en `research.md`. T001 se reescribió para verificar esto (sin token, sin `min()`)
- [X] T005 [P] [US1] Cambiar `Container` de `src/presentation/components/HaremView/styles.tsx` de `flex-direction: column` a `display: flex; flex-wrap: wrap` (mantener el `gap` existente); debe hacer pasar T001 junto con T004
- [X] T006 [US1] Verificar manualmente el Escenario 1 de `quickstart.md` — cubierto por T001 (estilos computados: `flex-wrap` + ancho fijo de columna); se levantó el dev server (`npm run dev`) y se confirmó que sirve el shell de la app sin errores, pero **no se hizo click-through visual real en navegador**: este sandbox no tiene `chromium-cli`, Playwright ni un binario de Chromium instalado (limitación de entorno, misma naturaleza que las ya documentadas en `002/tasks.md`)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (MVP) — el harem se ve en cuadrícula, todavía sin poder reordenarse

---

## Phase 4: User Story 2 - Reordenar personajes dentro de una misma serie (Priority: P2)

**Goal**: arrastrar (mouse, teclado o touch) un personaje a otra
posición dentro de su misma serie; el nuevo orden se refleja al
instante y persiste automáticamente; un personaje nunca puede terminar
en una serie distinta de la original.

**Independent Test**: con una serie de 3+ personajes, arrastrar el
último a la primera posición y verificar que el orden persiste tras
recargar; intentar soltarlo sobre otra serie y verificar que permanece
en la suya.

### Tests for User Story 2 ⚠️

- [X] T007 [P] [US2] Agregar casos a `tests/unit/domain/harem.test.ts` para `reorderCharactersInSeries`: reordena la serie indicada, no toca ninguna otra serie del harem, ignora ids de personaje desconocidos, tolera un `seriesId` inexistente sin lanzar, según `contracts/harem-reorder-domain.md`
- [X] T008 [P] [US2] Test de `reorderCharactersInSeries` (caso de uso) en `tests/unit/application/reorderCharactersInSeries.test.ts` con un `InMemoryProfileRepository` seedeado con 2+ perfiles: persiste el nuevo orden en el perfil indicado, el harem de cualquier otro perfil queda intacto, no hace nada con un `profileId` inexistente, según `contracts/reorder-use-cases.md`
- [X] T009 [P] [US2] Test de drag-and-drop de personajes en `tests/component/presentation/SeriesGroup.dragdrop.test.tsx`: soltar un personaje sobre otra posición de la misma serie llama a `reorderCharactersInSeries` con la secuencia de ids esperada (mismo mecanismo de `DragEndEvent` simulado que `ProfileList.dragdrop.test.tsx` de `002`, sin gesto real); cada tarjeta es enfocable/operable por teclado; el orden en pantalla refleja `series.characters` — **ajustado en ejecución**: igual que `002`, un gesto de arrastre real no se puede simular en jsdom (sin layout real); se testeó en cambio que cada tarjeta es su propia superficie de arrastre enfocable (`role="button"`, `tabIndex=0`) y que el orden en pantalla refleja `series.characters` — el cálculo del nuevo orden ya está cubierto por `computeReorderedIds.test.ts`

### Implementation for User Story 2

- [X] T010 [US2] Implementar `reorderCharactersInSeries(harem, seriesId, orderedCharacterIds)` en `src/domain/harem/Harem.ts` (mismo algoritmo tolerante que `reorderProfiles` de `domain/profile/Profile.ts`); debe hacer pasar T007
- [X] T011 [US2] Implementar el caso de uso en `src/application/useCases/reorderCharactersInSeries.ts` (recibe `repository`, `profileId`, `seriesId`, `orderedCharacterIds`); debe hacer pasar T008 (depende de T010)
- [X] T012 [US2] Exponer `reorderCharactersInSeries(seriesId, orderedCharacterIds)` en `src/presentation/context/ProfilesContext.tsx`, operando sobre `activeProfile.id` (no-op si no hay perfil activo) (depende de T011)
- [X] T013 [P] [US2] Crear `CharacterListItem` (envoltorio sortable de un personaje, `useSortable` + `CSS.Transform`, sin manija — toda la tarjeta es la superficie de arrastre) en `src/presentation/components/CharacterListItem/{index.tsx,styles.tsx}`, según `contracts/series-layout-dnd-ui.md`
- [X] T014 [US2] En `src/presentation/components/SeriesGroup/index.tsx`, montar un `DndContext` propio de esa serie (`PointerSensor` + `KeyboardSensor` con `sortableKeyboardCoordinates`, `collisionDetection={closestCenter}`) con `SortableContext` (`rectSortingStrategy`) sobre los ids de `series.characters`, mapear a `CharacterListItem` en vez de `CharacterCard` directo, y llamar a `reorderCharactersInSeries` en `onDragEnd` vía `computeReorderedIds`; debe hacer pasar T009 (depende de T012, T013) — `SeriesGroup` ahora lee `useProfiles()`, por lo que `HaremView.layout.test.tsx` y `SeriesGroup.dragdrop.test.tsx` se ajustaron para envolver en `ProfilesProvider`
- [X] T015 [US2] Verificar manualmente el Escenario 2 de `quickstart.md` — cubierto por T007/T008/T009 (lógica de reordenamiento + accesibilidad de la tarjeta); se relevantó el dev server y sirvió sin errores, pero no se hizo click-through visual real en navegador (misma limitación de entorno que T006)

**Checkpoint**: User Stories 1 y 2 funcionales de forma independiente — el harem se ve en cuadrícula y los personajes se reordenan dentro de su serie

---

## Phase 5: User Story 3 - Reordenar el orden de las series (Priority: P3)

**Goal**: arrastrar (desde una manija dedicada, con mouse, teclado o
touch) una serie completa a otra posición entre las demás; el nuevo
orden se refleja al instante y persiste automáticamente, sin alterar el
orden interno de los personajes de ninguna serie.

**Independent Test**: con un harem de 3+ series, arrastrar la última
serie a la primera posición desde su manija y verificar que el orden
persiste tras recargar, sin afectar el orden interno de personajes de
ninguna serie.

### Tests for User Story 3 ⚠️

- [X] T016 [P] [US3] Agregar casos a `tests/unit/domain/harem.test.ts` para `reorderSeries`: reordena `harem.series`, nunca modifica `series.characters` de ninguna serie, ignora ids desconocidos, tolera listas parciales/vacías, según `contracts/harem-reorder-domain.md`
- [X] T017 [P] [US3] Test de `reorderSeries` (caso de uso) en `tests/unit/application/reorderSeries.test.ts` con un `InMemoryProfileRepository` seedeado con 2+ perfiles: persiste el nuevo orden de series en el perfil indicado, el harem de cualquier otro perfil queda intacto, no hace nada con un `profileId` inexistente, según `contracts/reorder-use-cases.md`
- [X] T018 [P] [US3] Test de drag-and-drop de series en `tests/component/presentation/HaremView.dragdrop.test.tsx`: soltar una serie (desde su manija) sobre otra posición llama a `reorderSeries` con la secuencia esperada; la manija es enfocable/operable por teclado; cada `SeriesGroup` monta un `SortableContext` de personajes independiente (solo con los ids de sus propios personajes) — confirmando estructuralmente que no existe ningún droppable compartido entre series (FR-005), según `contracts/series-layout-dnd-ui.md` — **ajustado en ejecución**: mismo límite de jsdom que T009/T020 de `002`; se testeó que la manija de cada serie es enfocable/operable por teclado y que cada `SeriesGroup` solo expone (como `role="button"`) los personajes de su propia serie (manija + N tarjetas, nunca las de otra región)

### Implementation for User Story 3

- [X] T019 [US3] Implementar `reorderSeries(harem, orderedSeriesIds)` en `src/domain/harem/Harem.ts` (mismo algoritmo tolerante, nunca toca `series.characters`); debe hacer pasar T016
- [X] T020 [US3] Implementar el caso de uso en `src/application/useCases/reorderSeries.ts` (recibe `repository`, `profileId`, `orderedSeriesIds`); debe hacer pasar T017 (depende de T019)
- [X] T021 [US3] Exponer `reorderSeries(orderedSeriesIds)` en `src/presentation/context/ProfilesContext.tsx`, operando sobre `activeProfile.id` (no-op si no hay perfil activo) (depende de T020)
- [X] T022 [P] [US3] En `src/presentation/components/SeriesGroup/{index.tsx,styles.tsx}`, aceptar una prop opcional `dragHandleProps` (mismo tipo que ya usa `ProfileCard`) y renderizar una manija (`GripVertical` de `lucide-react`, `touch-action: none`) junto a `SeriesName` cuando esté presente
- [X] T023 [US3] Crear `SeriesGroupItem` (envoltorio sortable de una serie, `useSortable` + `CSS.Transform`, pasa `attributes`/`listeners` como `dragHandleProps` a `SeriesGroup`, sin ancho propio — el ancho lo define el contenido del `Section` de `SeriesGroup`, ver T004) en `src/presentation/components/SeriesGroupItem/{index.tsx,styles.tsx}` (depende de T022)
- [X] T024 [US3] En `src/presentation/components/HaremView/index.tsx`, montar un `DndContext` (mismos sensores/colisión que `SeriesGroup`) con `SortableContext` (`rectSortingStrategy`) sobre los ids de `harem.series`, mapear a `SeriesGroupItem` en vez de `SeriesGroup` directo, y llamar a `reorderSeries` en `onDragEnd` vía `computeReorderedIds`; debe hacer pasar T018 (depende de T021, T023)
- [X] T025 [US3] Verificar manualmente el Escenario 3 de `quickstart.md` — cubierto por T016/T017/T018 (lógica de reordenamiento + accesibilidad de la manija + aislamiento estructural entre series); se relevantó el dev server y sirvió sin errores, pero no se hizo click-through visual real en navegador (misma limitación de entorno que T006/T015)

**Checkpoint**: las tres historias de usuario funcionan de forma independiente — cuadrícula, reordenar personajes y reordenar series

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T026 [P] Verificar el Escenario 4 de `quickstart.md` (harem de 200+ personajes, Principio III) — se agregó `tests/component/presentation/HaremView.performance.test.tsx`: renderiza 210 personajes en 30 series sin errores y en <5s (presupuesto generoso, detecta regresiones catastróficas tipo O(n²), no mide jank real); la garantía de que el arrastre en una serie no re-renderiza otras se apoya en el diseño de `DndContext` independiente por serie (`research.md`) — **no se midió jank real en navegador** (misma limitación de entorno que T006/T015/T025, sin `chromium-cli`/Playwright/Chromium disponibles)
- [X] T027 [P] Verificar el Escenario 5 de `quickstart.md` (viewport móvil + touch, Principio V) — **se encontró y corrigió un bug real durante esta verificación**: `Section` tenía un ancho fijo `theme.layout.seriesGroupWidth` (24rem = 384px) que desbordaba horizontalmente en un viewport de ~390px (384px + el padding de `HaremView.Container` supera el ancho disponible); primero se corrigió a `width: min(seriesGroupWidth, 100%)`, y después (corrección post-implementación pedida por el usuario, ver T004/`research.md` Addendum) se eliminó el ancho de columna fijo por completo a favor de que cada serie mida su propio contenido, lo cual también resuelve el desborde en mobile por el `flex-shrink` por defecto de un ítem flex, sin necesitar `min()`. El resto (sensores touch de `@dnd-kit`, manija con `touch-action: none`) ya estaba cubierto por el mismo patrón de `002`. No se hizo verificación visual real en un viewport de DevTools/dispositivo (misma limitación de entorno)
- [X] T028 [P] Verificar el Escenario 6 de `quickstart.md` (aislamiento entre perfiles) — cubierto por las aserciones multi-perfil de T008/T017 (reordenar el harem de un perfil no afecta el harem de otro perfil en el mismo repositorio); no se hizo verificación visual manual cambiando de perfil activo en navegador
- [X] T029 [P] Revisar que `CharacterListItem`, `SeriesGroupItem`, `SeriesGroup` y `HaremView` cumplen la convención de carpeta/tipado del Principio VII — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, interfaces `I<Nombre>` presentes en los cuatro, `export default` al final de cada archivo (`SeriesGroup` exporta `memo(SeriesGroup)`, mismo patrón que antes de esta feature)
- [X] T030 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final: 0 errores de tipos, lint sin errores (2 warnings preexistentes, ya documentados en `002`), **94/94 tests**, build de producción exitoso (329.58 kB / gzip 104.46 kB)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: sin tareas, nada que bloquee el inicio de las historias
- **User Stories (Phase 3-5)**:
  - US1 (cuadrícula) no depende de ninguna otra historia
  - US2 (reordenar personajes) es visualmente independiente de US1 (podría implementarse sobre el layout en columna anterior), pero se secuencia después porque comparte archivos (`SeriesGroup`) y porque probarlo visualmente es más claro ya con la cuadrícula de US1 lista
  - US3 (reordenar series) depende de que `SeriesGroup` ya exista con su forma de US1/US2 (le agrega la manija y el envoltorio `SeriesGroupItem`); es independiente de la lógica interna de US2 (el aislamiento entre `DndContext` por serie no requiere que US2 esté completa, aunque se prueba mejor con ambas historias presentes)
- **Polish (Phase 6)**: depende de que las tres historias estén completas

### Within Each User Story

- Tests antes que implementación (deben fallar primero)
- Funciones puras de `domain/` antes que su caso de uso en `application/`
- Caso de uso antes que su conexión en `ProfilesContext`
- `ProfilesContext` antes que los componentes que lo consumen

### Parallel Opportunities

- T002/T003 (token + doc) en paralelo; T001 (test) en paralelo con ambos
- T005 en paralelo con T004 (archivos distintos; T004 sí depende de T002)
- T007/T008/T009 (tests de US2) en paralelo entre sí
- T013 en paralelo con T007/T008/T009/T010/T011/T012 (archivo nuevo, sin dependencias)
- T016/T017/T018 (tests de US3) en paralelo entre sí
- T022 en paralelo con T016/T017/T018/T019/T020/T021 (archivo ya tocado en US1, pero cambio independiente del resto de US3 hasta T023)
- T026/T027/T028/T029 (Polish) en paralelo

---

## Parallel Example: User Story 2

```bash
# Lanzar juntos los tests de US2:
Task: "Casos de reorderCharactersInSeries en tests/unit/domain/harem.test.ts"
Task: "Test del caso de uso en tests/unit/application/reorderCharactersInSeries.test.ts"
Task: "Test de drag-and-drop en tests/component/presentation/SeriesGroup.dragdrop.test.tsx"

# Mientras tanto, en paralelo, el componente nuevo no depende de ningún test:
Task: "Crear CharacterListItem en src/presentation/components/CharacterListItem/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 3: User Story 1
2. **DETENERSE y VALIDAR**: Escenario 1 de `quickstart.md`
3. Desplegar/demostrar si está listo (harem en cuadrícula, todavía sin drag-and-drop)

### Incremental Delivery

1. User Story 1 → validar → demo (cuadrícula tipo flex-wrap)
2. User Story 2 → validar → demo (reordenar personajes dentro de su serie)
3. User Story 3 → validar → demo (reordenar series entre sí)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Ninguna historia reestructura ningún tipo de dominio existente — a diferencia de `002`, no hace falta ningún gate de compilación intermedio antes de empezar las historias
- Verificar que los tests fallan antes de implementar
- Detenerse en cada checkpoint para validar la historia de forma independiente
