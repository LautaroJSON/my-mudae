# Implementation Plan: Buscador de Personajes y Series en el Harem

**Branch**: `011-buscador-harem` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-buscador-harem/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar un buscador de texto libre, temporal y puramente de
presentación, que filtra el harem visible del perfil activo por nombre
de personaje y/o título de serie a medida que el usuario escribe. El
acceso es un botón circular nuevo ("Search" de `lucide-react`) dentro de
`HeaderActions`, con el mismo estilo que los botones redondos ya
existentes; al presionarlo se transforma con una animación CSS de
`width` en un campo de texto horizontal, conservando el ícono anclado a
la derecha como el propio toggle de apertura/cierre. Enfoque: una
función pura nueva en `domain/harem/Harem.ts` (`filterHaremByQuery`), un
contexto de React nuevo y efímero (`HaremSearchContext`, no persistido,
mismo patrón que `HaremSortContext` de `010`) para el estado
abierto/cerrado + el texto ingresado, y un componente nuevo de
`presentation/` (`HaremSearchButton`) de responsabilidad única. `HaremView`
es el único componente existente que cambia de forma no trivial: aplica
el filtro a lo que renderiza y reutiliza el mismo mecanismo de
`dragDisabled` que ya existe para el ordenamiento temporal por kakera
(`010`) mientras hay una búsqueda activa — ningún otro componente de la
cadena de renderizado (`SeriesGroupItem`, `SeriesGroup`,
`CharacterListItem`) necesita cambiar, porque el filtro solo decide qué
subconjunto de `series`/`characters` ya existentes se les pasa. El
comando `$sm` (`SortCommandBar`/`CopyCommandButton`/`formatSortCommand`,
`009`) queda completamente intocado, igual que en `010`, lo cual
garantiza gratis que el comando exportado nunca refleje el filtro de
búsqueda (Principio II).

## Technical Context

**Language/Version**: TypeScript 6.0 (React 19), Vite 8 — stack fijo de la constitución.

**Primary Dependencies**: React 19, `styled-components` 6, `lucide-react` (ícono nuevo `Search`, ya presente en la versión instalada). No se agrega ninguna dependencia nueva; el matching de texto es JS nativo (`String.prototype.normalize`/`includes`), sin librería de fuzzy-search.

**Storage**: N/A para el estado nuevo — el estado del buscador (abierto/cerrado + texto ingresado) vive solo en memoria de React (`HaremSearchContext`), nunca en `localStorage`; el `Harem` persistido (`domain/harem/`) no se modifica ni se relee de forma distinta (Principio I intacto).

**Testing**: Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`), mismo setup que `003`/`009`/`010`: `tests/unit/domain/` para la función pura nueva, `tests/unit/presentation/` para el contexto nuevo, `tests/component/presentation/` para el botón/input y para el comportamiento de filtrado end-to-end en `HaremView`.

**Target Platform**: Web (navegador de escritorio y mobile), client-only — mismo alcance que el resto de la app (Principio IV).

**Project Type**: Web app de un solo proyecto (sin frontend/backend separados) — monolito modular DDD ya establecido por la constitución.

**Performance Goals**: `filterHaremByQuery` debe ser `O(n)` sobre la cantidad total de personajes + series (un `filter`/`includes` por elemento, sin anidar recorridos adicionales), recalculable en cada tecla sin bloqueo perceptible incluso en harems de 200+ personajes (Principio III). Para no invalidar la memoización por props de `SeriesGroup` (`memo`) en series que no cambian de resultado entre una tecla y la siguiente, `filterHaremByQuery` preserva la referencia original de cada `Series` que coincide por título completo (sin reconstruir su array de `characters`); solo construye un objeto `Series` nuevo para las series cuyo subconjunto de personajes coincidentes cambia.

**Constraints**: Debe funcionar offline (Principio IV); el campo expandido debe usar exclusivamente tokens de `theme` (colores, spacing, radii, motion) sin hardcodear valores (Restricciones Técnicas), y su ancho expandido debe acotarse con `vw` para no desbordar `HeaderActions`/`Bar` en viewports angostos (Principio V, ver `research.md` §4); ningún cambio a la lógica de generación/copiado del comando `$sm` (`009`) ni al ordenamiento temporal por kakera (`010`), que deben poder combinarse sin interferirse.

**Scale/Scope**: 1 función pura nueva + 1 helper privado en `domain/harem/Harem.ts`; 1 contexto nuevo (`HaremSearchContext`); 1 componente nuevo de `presentation/` (`HaremSearchButton`, con su `styles.tsx`); cambios acotados en `HeaderActions` (montar el botón), `App.tsx` (envolver con el nuevo provider), `shared/theme.ts` (un token de ancho nuevo) y en `HaremView` (aplicar el filtro y extender la condición de `dragDisabled` ya existente).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento planeado |
|-----------|------------------------|
| I. Persistencia Local Automática | El estado del buscador (abierto/cerrado + texto) NUNCA se escribe en `localStorage`: `HaremSearchContext` es estado de React puro, reseteado a `{isOpen: false, query: ''}` en cada carga de página (unmount natural) y al cambiar de perfil activo (derivado durante el render comparando `profileId`, mismo patrón que `HaremSortContext`, FR-010). El `Harem` persistido y su forma de guardado no cambian. |
| II. Integridad del Output (Orden = Comando) | El filtro de búsqueda no reordena nada: solo oculta series/personajes que no coinciden (FR-012). `SortCommandBar`/`CopyCommandButton`/`formatSortCommand` (`009`) siguen leyendo `activeProfile.harem` directo de `useProfiles()` — **ningún archivo de esa cadena se toca en esta feature** — así que el comando exportado sigue siendo estructuralmente imposible de contaminar con el filtro visible. |
| III. Rendimiento en Listas Grandes (200+) | `filterHaremByQuery` es `O(n)` (ver Technical Context) y se recalcula en `HaremView` a partir de lo que ya renderiza — no agrega un recorrido extra fuera de ese render. La preservación de referencia para series sin cambios (ver Technical Context) evita re-renders innecesarios de `SeriesGroup` cuando una serie ya coincidía y sigue coincidiendo igual entre una tecla y la siguiente. Se valida manualmente con harem de 200+ (`quickstart.md`). |
| IV. Simplicidad del Stack | No se agrega ninguna dependencia nueva ni backend; el nuevo estado global usa Context API (mismo patrón que `HaremSortContext`/`ProfilesContext`), consistente con Restricciones Técnicas. El matching de texto es JS nativo, sin librería de búsqueda/fuzzy-matching. |
| V. Diseño Responsive y Touch-First | El campo de búsqueda y su ícono son elementos nativos (`input`/`button`) operables por touch; su ancho expandido se acota con `min(token, 45vw)` para no desbordar el header en mobile (ver `research.md` §4), validado en viewport móvil (`quickstart.md`). |
| VI. Confiabilidad del Copiado al Portapapeles | No aplica cambio — esta feature no toca ningún flujo de copiado; se verifica en `quickstart.md` que copiar el comando con una búsqueda activa sigue devolviendo el harem completo sin filtrar (refuerza el gate de Principio II de arriba). |
| VII. Componentes Pequeños de Responsabilidad Única | 1 componente nuevo (`HaremSearchButton`), responsabilidad única: ícono + campo + toggle de apertura/cierre, consumiendo `HaremSearchContext` sin lógica de filtrado propia (esa vive en `domain/harem/Harem.ts`). En su carpeta con `index.tsx`/`styles.tsx`, tipado `I<Nombre>`, `export default` al final — mismo patrón que `007`/`009`/`010`. |

**Resultado (pre-Fase 0)**: PASS sin excepciones — a diferencia de `010`, esta feature no necesita ninguna excepción al Principio II: nunca reordena, solo oculta.

**Re-chequeo post-Fase 1** (tras `research.md`/`data-model.md`/`contracts/`/`quickstart.md`): PASS sin cambios — ver decisiones en `research.md`, en particular §2 (por qué `filterHaremByQuery` preserva referencias de `Series` sin cambios) y §3 (por qué se reutiliza `dragDisabled` en vez de agregar un prop nuevo).

## Project Structure

### Documentation (this feature)

```text
specs/011-buscador-harem/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── filter-harem-by-query.md
│   └── harem-search-ui.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Monolito modular DDD de un solo proyecto (React + Vite + TypeScript), ya
establecido por la constitución — sin frontend/backend separados. Esta
feature agrega un componente y un contexto nuevos en `presentation/`, una
función pura nueva en `domain/harem/`, y modifica una cadena mínima de
archivos existentes (`HeaderActions`, `App.tsx`, `HaremView`,
`shared/theme.ts`); no toca `application/` ni `infrastructure/`.

```text
src/
├── domain/
│   └── harem/
│       └── Harem.ts                          # MODIFICADO — agrega filterHaremByQuery() + normalizeSearchText()
├── presentation/
│   ├── App.tsx                                # MODIFICADO — envuelve AppContent con HaremSearchProvider
│   ├── context/
│   │   └── HaremSearchContext.tsx             # NUEVO
│   └── components/
│       ├── HeaderActions/
│       │   └── index.tsx                      # MODIFICADO — monta HaremSearchButton
│       ├── HaremSearchButton/                 # NUEVO
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── HaremView/
│           └── index.tsx                      # MODIFICADO — aplica filterHaremByQuery, estado "sin resultados", extiende dragDisabled
└── shared/
    └── theme.ts                                # MODIFICADO — agrega layout.searchFieldWidth

tests/
├── unit/
│   ├── domain/
│   │   └── harem.test.ts                       # MODIFICADO — casos de filterHaremByQuery
│   └── presentation/
│       └── HaremSearchContext.test.tsx         # NUEVO
└── component/
    └── presentation/
        ├── HaremSearchButton.test.tsx          # NUEVO
        └── HaremView.search.test.tsx           # NUEVO
```

**Structure Decision**: Se reutiliza la estructura de `010` casi al
detalle (mismo patrón de contexto efímero + botón redondo en
`HeaderActions` + único cambio no trivial en `HaremView`), pero con una
superficie más chica: no hace falta un panel desplegable (`HaremSortPanel`)
ni opciones anidadas, porque el propio campo de texto expandido ES la
interfaz completa de esta feature.

## Complexity Tracking

*Sin violaciones que justificar — la tabla de Constitution Check dio PASS sin excepciones.*
