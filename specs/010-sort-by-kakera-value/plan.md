# Implementation Plan: Ordenar por Valor de Kakera (Temporal)

**Branch**: `010-sort-by-kakera-value` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-sort-by-kakera-value/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar una vista temporal, puramente de presentación, que reordena el
harem visible (series por suma de kakera de sus personajes, personajes
dentro de cada serie por su propio kakera) sin tocar en ningún momento
el orden manual persistido. El acceso es un botón circular nuevo
("Filter" de `lucide-react`) dentro de `HeaderActions`, que despliega un
panel de fondo acento anclado justo debajo del header (mismo
`Bar` que ya usa `position: sticky`, aprovechado como contenedor de
posicionamiento sin agregar ninguna medición en JS); dentro, un ítem
"Ordenamiento" despliega dos opciones, de las cuales solo "Valor de
Kakera" está implementada en esta feature (funciona como interruptor
encendido/apagado + control de dirección asc/desc). Enfoque: una función
pura nueva en `domain/harem/Harem.ts` (`sortHaremByKakera`), un contexto
de React nuevo y efímero (`HaremSortContext`, no persistido) para el
estado on/off + dirección, y cuatro componentes nuevos de
`presentation/` de responsabilidad única. `HaremView` es el único
componente existente que cambia de forma no trivial: aplica el
ordenamiento temporal a lo que renderiza y deshabilita el drag-and-drop
mientras está activo (FR-015); el resto de componentes existentes (`Header`,
`SortCommandBar`/`CopyCommandButton`, que generan el comando `$sm`) quedan
intocados, lo cual garantiza gratis que el comando exportado siga
reflejando siempre el orden manual (FR-012).

## Technical Context

**Language/Version**: TypeScript 6.0 (React 19), Vite 8 — stack fijo de la constitución.

**Primary Dependencies**: React 19, `styled-components` 6, `@dnd-kit/core` + `@dnd-kit/sortable` (ya usados por `003`, se reutiliza su opción `disabled` de `useSortable` para FR-015), `lucide-react` (íconos nuevos `Filter` y `ArrowUp`, ambos confirmados presentes en la versión instalada). No se agrega ninguna dependencia nueva.

**Storage**: N/A para el estado nuevo — el ordenamiento temporal (activo/inactivo + dirección) vive solo en memoria de React (`HaremSortContext`), nunca en `localStorage`; el `Harem` persistido (`domain/harem/`) no se modifica ni se relee de forma distinta (Principio I intacto).

**Testing**: Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`), mismo setup que `003`/`007`/`009`: `tests/unit/domain/` para la función pura nueva, `tests/unit/presentation/` o `tests/component/presentation/` para el contexto y los componentes nuevos.

**Target Platform**: Web (navegador de escritorio y mobile), client-only — mismo alcance que el resto de la app (Principio IV).

**Project Type**: Web app de un solo proyecto (sin frontend/backend separados) — monolito modular DDD ya establecido por la constitución.

**Performance Goals**: `sortHaremByKakera` debe ser `O(n log n)` sobre la cantidad total de personajes (un `sort` por serie + un `sort` de series), sin recorrer el harem más de una vez por render; no debe disparar re-render de componentes de series/personajes que no cambiaron de posición cuando el ordenamiento está inactivo (mismo criterio de memoización ya vigente en `SeriesGroup`/`CharacterCard`, Principio III).

**Constraints**: Debe funcionar offline (Principio IV); el panel debe usar exclusivamente tokens de `theme` (colores, spacing, radii, motion, zIndex) sin hardcodear valores (Restricciones Técnicas); ningún cambio a la lógica de generación/copiado del comando `$sm` (`formatSortCommand`, `SortCommandBar`, `CopyCommandButton` de `009`).

**Scale/Scope**: 1 función pura nueva en `domain/harem/Harem.ts`; 1 contexto nuevo (`HaremSortContext`); 4 componentes nuevos de `presentation/` (`HaremSortButton`, `HaremSortPanel`, `KakeraSortOption`, `RankSortOption`); cambios acotados en `HeaderActions` (montar el botón), `App.tsx` (envolver con el nuevo provider) y en la cadena `HaremView` → `SeriesGroupItem` → `SeriesGroup` → `CharacterListItem` (aplicar el orden temporal y propagar `dragDisabled`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento planeado |
|-----------|------------------------|
| I. Persistencia Local Automática | El ordenamiento temporal NUNCA se escribe en `localStorage`: `HaremSortContext` es estado de React puro, reseteado a `{isActive: false, direction: 'desc'}` en cada carga de página (unmount natural) y al cambiar de perfil activo (`useEffect` sobre `activeProfile?.id`, FR-011). El `Harem` persistido y su forma de guardado no cambian. |
| II. Integridad del Output (Orden = Comando) | **Excepción deliberada y acotada, documentada explícitamente por pedido del propio usuario (spec FR-010/FR-012).** El principio existe para que el comando copiado nunca *diverja en silencio* de un reordenamiento que el usuario cree haber hecho. Acá no hay reordenamiento real: es una lente de inspección explícitamente temporal ("no sustituye mi ordenamiento"), y el usuario sabe en todo momento que está activada (el toggle/flecha visibles son el propio feedback). Se garantiza en el diseño, no solo por acuerdo verbal: `SortCommandBar`/`CopyCommandButton`/`formatSortCommand` (009) siguen leyendo `activeProfile.harem` directo de `useProfiles()` — **ningún archivo de esa cadena se toca en esta feature** — así que estructuralmente no hay forma de que el comando exportado vea el orden temporal. `HaremView` es el único punto que aplica `sortHaremByKakera`, y lo hace solo para lo que él mismo renderiza. |
| III. Rendimiento en Listas Grandes (200+) | `sortHaremByKakera` es `O(n log n)` (ver Technical Context) y se recalcula en `HaremView` a partir del `harem` recibido — no introduce un recorrido adicional sobre el ya existente. `SeriesGroup`/`CharacterCard` siguen memoizados por props; alternar el toggle re-renderiza la lista completa (esperable, es un reordenamiento visual real), pero activar/desactivar NO agrega recorridos extra fuera de ese render. Se valida manualmente con harem de 200+ (`quickstart.md`). |
| IV. Simplicidad del Stack | No se agrega ninguna dependencia nueva ni backend; el nuevo estado global usa Context API (mismo patrón que `ProfilesContext`), consistente con Restricciones Técnicas. |
| V. Diseño Responsive y Touch-First | Botón, panel y sus opciones son elementos nativos (`button`) operables por touch; el panel se valida en viewport móvil (`quickstart.md`), incluyendo que no corte contenido ni fuerce scroll horizontal de la página. |
| VI. Confiabilidad del Copiado al Portapapeles | No aplica cambio — esta feature no toca ningún flujo de copiado; se verifica explícitamente en `quickstart.md` que copiar el comando con el ordenamiento temporal activo sigue devolviendo el orden manual (refuerza el gate de Principio II de arriba). |
| VII. Componentes Pequeños de Responsabilidad Única | 4 componentes nuevos, cada uno con una sola responsabilidad: `HaremSortButton` (ícono + abrir/cerrar panel), `HaremSortPanel` (fondo acento + acordeón "Ordenamiento"), `KakeraSortOption` (toggle on/off + control de dirección), `RankSortOption` (placeholder inerte, aislado para no ensuciar `HaremSortPanel` con lógica de una opción futura). Cada uno en su carpeta con `index.tsx`/`styles.tsx`, tipado `I<Nombre>`, `export default` al final — mismo patrón que `007`/`009`. |

**Resultado (pre-Fase 0)**: PASS con una excepción documentada al Principio II (ver fila de arriba) — no requiere `Complexity Tracking` porque no es una violación no justificada: es un comportamiento explícitamente pedido y acotado estructuralmente por diseño, no una desviación accidental.

**Re-chequeo post-Fase 1** (tras `research.md`/`data-model.md`/`contracts/`/`quickstart.md`): PASS sin cambios — ver decisiones en `research.md` §§1-6, en particular §2 (por qué `SortCommandBar`/`formatSortCommand` quedan intocados) y §4 (por qué deshabilitar drag-and-drop vía `useSortable({ disabled })` en vez de omitir el `DndContext`).

## Project Structure

### Documentation (this feature)

```text
specs/010-sort-by-kakera-value/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── sort-haremby-kakera.md
│   └── kakera-sort-panel-ui.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Monolito modular DDD de un solo proyecto (React + Vite + TypeScript), ya
establecido por la constitución — sin frontend/backend separados. Esta
feature agrega archivos en `domain/harem/`, `presentation/context/` y
`presentation/components/`, y modifica una cadena acotada de componentes
existentes de renderizado del harem; no toca `application/` ni
`infrastructure/`.

```text
src/
├── domain/
│   └── harem/
│       ├── Harem.ts                     # MODIFICADO — agrega sortHaremByKakera() + tipo KakeraSortDirection
│       ├── Series.ts                    # existente, sin cambios
│       └── Character.ts                 # existente, sin cambios
├── presentation/
│   ├── App.tsx                          # MODIFICADO — envuelve <AppContent /> con <HaremSortProvider>
│   ├── context/
│   │   ├── ProfilesContext.tsx          # existente, sin cambios
│   │   └── HaremSortContext.tsx         # NUEVO — estado efímero on/off + dirección
│   └── components/
│       ├── HeaderActions/index.tsx      # MODIFICADO — monta <HaremSortButton />
│       ├── HaremView/index.tsx          # MODIFICADO — aplica sortHaremByKakera(), propaga dragDisabled
│       ├── SeriesGroupItem/index.tsx    # MODIFICADO — useSortable({ disabled: dragDisabled })
│       ├── SeriesGroup/index.tsx        # MODIFICADO — reenvía dragDisabled a CharacterListItem/DragHandle
│       ├── CharacterListItem/index.tsx  # MODIFICADO — useSortable({ disabled: dragDisabled })
│       ├── HaremSortButton/             # NUEVO — botón circular "Filter" + abre/cierra el panel
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── HaremSortPanel/              # NUEVO — panel fondo acento + acordeón "Ordenamiento"
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── KakeraSortOption/            # NUEVO — fila "Valor de Kakera": toggle + flecha de dirección
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── RankSortOption/              # NUEVO — fila "Rank": placeholder inerte
│           ├── index.tsx
│           └── styles.tsx
└── shared/
    └── theme.ts                          # existente; se reutilizan colors.accent/onAccent, zIndex.dropdown, sin tokens nuevos

tests/
├── unit/domain/harem.test.ts                          # existente, se le agregan casos para sortHaremByKakera
└── component/presentation/
    ├── HaremSortButton.test.tsx                        # NUEVO
    ├── HaremSortPanel.test.tsx                          # NUEVO
    ├── KakeraSortOption.test.tsx                        # NUEVO
    └── HaremView.kakeraSort.test.tsx                    # NUEVO — ordenamiento aplicado + drag deshabilitado + comando intacto
```

Convención real de tests del proyecto: tests viven bajo
`tests/{unit,component,infrastructure}/`, no co-ubicados junto al
código fuente — igual criterio que `001`-`009`.

**Structure Decision**: Un único proyecto (no hay separación
frontend/backend). Se sigue la convención de carpeta/archivo por
componente del Principio VII para los 4 componentes nuevos. La única
lógica de dominio nueva (`sortHaremByKakera`) se agrega junto a las
funciones ya existentes de forma/orden de harem en `Harem.ts`
(`reorderSeries`, `reorderCharactersInSeries`, `sumKakera`), en vez de
un archivo aparte, porque opera sobre la misma entidad y responde a la
misma pregunta ("¿en qué orden se ve el harem?") que esas funciones ya
existentes. `SortCommandBar`, `CopyCommandButton`, `formatSortCommand` y
`Header` no se modifican (ver Constitution Check, fila II).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Ninguna violación no justificada — tabla omitida. La única fila con una
excepción (Principio II) está documentada y acotada estructuralmente
dentro de la propia tabla de Constitution Check, no es deuda técnica.
