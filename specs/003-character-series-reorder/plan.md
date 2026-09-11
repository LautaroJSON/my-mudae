# Implementation Plan: Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop

**Branch**: `003-character-series-reorder` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-character-series-reorder/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Cambiar la vista principal del harem (`HaremView`) para que los grupos
de serie ya no ocupen una fila completa cada uno, sino que se acomoden
lado a lado en una cuadrícula tipo `flex-wrap` (ancho de columna fijo
nuevo, `theme.layout.seriesGroupWidth`), y agregar dos niveles de
reordenamiento por drag-and-drop: personajes dentro de una misma serie, y
series entre sí. Reutiliza íntegramente el patrón ya validado en
`002-header-profile-modal` (`@dnd-kit`, lista/ítem-sortable + manija
`GripVertical`, `computeReorderedIds`) — **sin sumar ninguna dependencia
nueva**. El aislamiento entre niveles (un personaje nunca puede terminar
en otra serie) se logra estructuralmente usando un `DndContext`
independiente por serie en vez de un único árbol de sorteo compartido
(ver `research.md`). El orden se persiste igual que siempre: el orden de
los arrays `Harem.series`/`Series.characters` ya es la fuente de verdad,
sin campos `order` nuevos.

## Technical Context

**Language/Version**: TypeScript ~6.0 sobre React 19.2, Vite 8.3 (sin cambios respecto a `001`/`002`).

**Primary Dependencies**: las ya fijadas por la constitución
(`react`, `react-dom`, `styled-components`, `lucide-react`) más
`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`, **ya
instaladas desde `002`** — esta feature no agrega ninguna dependencia
nueva (ver `research.md`). Testing: mismo stack que `001`/`002` (Vitest
+ React Testing Library + user-event, incluyendo simulación de
`DragEndEvent` de `@dnd-kit` sin gesto real, mismo mecanismo que
`ProfileList.dragdrop.test.tsx`).

**Storage**: `localStorage` vía el mismo `ProfileRepository`/
`LocalStorageProfileRepository` de `001`/`002`, sin cambios de forma —
el harem sigue viajando embebido en cada `Profile`, así que persistir un
nuevo orden de personajes/series usa el mismo `repository.save()` de
siempre (ver `data-model.md`).

**Testing**: Vitest + React Testing Library, mismo patrón que `002` para
simular arrastre (`DragEndEvent`) a nivel serie y a nivel personaje por
separado.

**Target Platform**: Web (SPA), sin cambios — debe seguir funcionando
offline una vez cargada.

**Project Type**: Mismo proyecto único client-only de `001`/`002`, misma
arquitectura DDD por capas + `shared/`.

**Performance Goals**: el reordenamiento (personaje o serie) debe
sentirse inmediato/sin jank incluso con harems de 200+ personajes
(Principio III, SC-005) — logrado usando un `DndContext` independiente
por serie, de forma que arrastrar en una serie nunca dispara renders en
las demás (ver `research.md`). El re-acomodo del layout `flex-wrap` ante
un cambio de ancho de ventana debe verse inmediato, sin recargar la
página (FR-003).

**Constraints**: un personaje arrastrado nunca puede terminar en una
serie distinta de la original (FR-005, garantizado estructuralmente, no
por validación manual); reordenar series no debe alterar el orden interno
de ninguna serie (FR-007); el orden de personajes/series persiste de
forma automática e independiente por perfil (FR-008 a FR-011); todo el
reordenamiento debe funcionar con mouse, teclado y touch (Principio V,
FR-012); todo estilo nuevo sale de `theme.ts`/`DESIGN.md` (Restricciones
Técnicas) — se agrega un único token nuevo, `layout.seriesGroupWidth`.

**Scale/Scope**: mismo volumen que `001`/`002` (harems de 200+
personajes por perfil, repartidos en un número variable de series); esta
feature toca únicamente la vista principal del harem del perfil activo,
no la lista de perfiles del modal (`002`, sin cambios).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Restricción | Aplica a esta feature | Estado |
|---|---|---|
| I. Persistencia de Datos Local Automática | Sí — orden de personajes y de series | **PASS**: `reorderSeries`/`reorderCharactersInSeries` (casos de uso nuevos) persisten vía el mismo `ProfileRepository.save()` inmediatamente después de cada arrastre, sin acción de "guardar" explícita. |
| II. Integridad del Output (Orden = Comando) | No — sigue sin existir un generador de comando en el alcance de esta feature | **N/A**, igual que en `001`/`002` (documentado como Assumption en `spec.md`). |
| III. Rendimiento en Listas Grandes (200+) | Sí — es el requisito central de esta feature (FR-014, SC-005) | **PASS**: `CharacterCard` sigue memoizado sin cambios; el reordenamiento usa un `DndContext` independiente por serie (no uno global), por lo que arrastrar en una serie no re-renderiza ninguna otra serie del harem — ver `research.md`, Decisión "rendimiento del reordenamiento". Validación manual con harem de 200+ incluida en `quickstart.md` Escenario 4. |
| IV. Simplicidad del Stack (Client-Only) | Sí | **PASS sin dependencias nuevas**: se reutiliza `@dnd-kit`, ya instalado y justificado en `002/research.md`. Sin backend, sin librería nueva. No hace falta Complexity Tracking. |
| V. Diseño Responsive y Touch-First | Sí — layout `flex-wrap` y ambos niveles de drag-and-drop | **PASS**: mismos sensores (`PointerSensor` + `KeyboardSensor`) que ya soportan touch en `002`; layout `flex-wrap` es mobile-first por construcción (mismo patrón que `CharacterList`, documentado en `DESIGN.md` §5); validado en viewport móvil en `quickstart.md` Escenario 5. |
| VI. Confiabilidad del Copiado al Portapapeles | No | **N/A**, igual que en `001`/`002`. |
| VII. Componentes Pequeños de Responsabilidad Única (+ convención) | Sí — `SeriesGroupItem`, `CharacterListItem` nuevos; `HaremView`, `SeriesGroup` editados | **PASS**: mismo patrón lista/ítem-sortable + manija que `ProfileList`/`ProfileListItem`/`ProfileCard` de `002` — cada componente en su propia carpeta `index.tsx`/`styles.tsx`, sin `React.FC`, interface `I<Nombre>`, `export default` al final. Ver `data-model.md` para el mapeo completo. |
| Restricciones Técnicas (stack fijo, capas DDD + `shared/`, tokens únicos, `domain/` aislado) | Sí | **PASS**: las funciones nuevas de reordenamiento viven en `domain/harem/Harem.ts` como funciones puras (sin React/styled-components/localStorage), mismo aislamiento que `domain/profile/Profile.ts`. El único estilo nuevo (`seriesGroupWidth`) sale de `theme.ts`, documentado también en `DESIGN.md` §5. |

Ninguna violación que justificar — no hay Complexity Tracking para esta
feature.

## Project Structure

### Documentation (this feature)

```text
specs/003-character-series-reorder/
├── plan.md               # This file
├── research.md            # Phase 0 output
├── data-model.md          # Phase 1 output
├── quickstart.md          # Phase 1 output
├── contracts/              # Phase 1 output
│   ├── harem-reorder-domain.md
│   ├── reorder-use-cases.md
│   ├── profiles-context-reorder.md
│   └── series-layout-dnd-ui.md
└── tasks.md                # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── harem/
│       └── Harem.ts                    # editado: + reorderSeries, + reorderCharactersInSeries
│
├── application/
│   └── useCases/
│       ├── reorderSeries.ts             # nuevo
│       └── reorderCharactersInSeries.ts # nuevo
│
├── presentation/
│   ├── computeReorderedIds.ts           # sin cambios (ya genérico, se reutiliza)
│   ├── context/
│   │   └── ProfilesContext.tsx          # editado: + reorderSeries, + reorderCharactersInSeries
│   └── components/
│       ├── HaremView/                   # editado: Container → flex-wrap; monta DndContext de nivel serie
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── SeriesGroupItem/             # nuevo (envoltorio sortable de una serie, mismo rol que ProfileListItem)
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── SeriesGroup/                 # editado: + dragHandleProps, monta su propio DndContext de nivel personaje
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── CharacterListItem/           # nuevo (envoltorio sortable de un personaje)
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── CharacterCard/               # sin cambios
│
└── shared/
    └── theme.ts                         # editado: + layout.seriesGroupWidth

DESIGN.md                                # editado: §5 documenta seriesGroupWidth

tests/
├── unit/
│   ├── domain/
│   │   └── harem.test.ts                # + tests de reorderSeries/reorderCharactersInSeries
│   └── application/
│       ├── reorderSeries.test.ts        # nuevo
│       └── reorderCharactersInSeries.test.ts  # nuevo
└── component/presentation/
    ├── HaremView.dragdrop.test.tsx      # nuevo (reordenamiento de series + layout flex-wrap)
    └── SeriesGroup.dragdrop.test.tsx    # nuevo (reordenamiento de personajes + aislamiento entre series)
```

**Structure Decision**: se mantiene el mismo monolito modular DDD de
`001`/`002` (`domain/application/infrastructure/presentation` +
`shared/`). `infrastructure/` no cambia — el harem ya viaja embebido en
`Profile`, así que ningún cambio a `LocalStorageProfileRepository` es
necesario. Ningún archivo nuevo de `domain/`/`application/` depende de
React, `styled-components` ni `localStorage`. El nuevo mapeo
lista/ítem-sortable (`SeriesGroupItem`, `CharacterListItem`) reutiliza al
milímetro el patrón ya aprobado en `002`
(`ProfileList`/`ProfileListItem`/`ProfileCard`), evitando inventar una
convención nueva para el mismo problema.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

Sin violaciones — no aplica.
