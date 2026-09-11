# Data Model: Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop

**Feature**: `003-character-series-reorder` | **Date**: 2026-09-11

Extiende el modelo de `001-multi-profile-harems`/`002-header-profile-modal`
(`Profile`, `Harem`, `Series`, `Character`). Ningún campo cambia de forma
— el orden de personajes/series sigue siendo el orden del array (ver
`research.md`, Decisión "identidad de personaje/serie"). Solo se agregan
funciones puras nuevas y un token de layout.

## Serie (`Series`) y Personaje (`Character`) — sin cambios de forma

| Entidad | Campo que ya expresa el orden | Notas |
|---|---|---|
| `Harem.series` | posición en el array `Series[]` | Reordenar series = reordenar este array (FR-006, FR-009). |
| `Series.characters` | posición en el array `Character[]` | Reordenar personajes = reordenar este array, **dentro de una única `Series`** (FR-004, FR-008). |

**Invariante nueva (estructural, no de código)**: reordenar
`Harem.series` nunca modifica el contenido de ningún `Series.characters`
(FR-007) — la función que reordena series solo reordena el array externo,
nunca desciende a los personajes de cada serie.

## Funciones puras nuevas — `domain/harem/Harem.ts`

```ts
/**
 * Reordena las series de un harem según `orderedSeriesIds`. Mismo
 * comportamiento tolerante que `reorderProfiles` de domain/profile/Profile.ts:
 * ids desconocidos se ignoran, series ausentes de la lista quedan al
 * final en su orden relativo anterior. Nunca toca `series.characters`.
 */
function reorderSeries(harem: Harem, orderedSeriesIds: string[]): Harem

/**
 * Reordena los personajes de UNA sola serie (`seriesId`) según
 * `orderedCharacterIds`. No afecta ninguna otra serie del harem. Mismo
 * criterio de tolerancia que reorderSeries: ids desconocidos se
 * ignoran, personajes ausentes de la lista quedan al final en su orden
 * relativo anterior.
 */
function reorderCharactersInSeries(
  harem: Harem,
  seriesId: string,
  orderedCharacterIds: string[],
): Harem
```

Ambas se implementan con el mismo algoritmo ya usado por
`reorderProfiles` (`domain/profile/Profile.ts`): intersección de ids
conocidos, reasignación de posición según la secuencia pedida, elementos
no mencionados al final en su orden relativo previo. Ninguna de las dos
lanza excepciones ante ids inválidos.

## Casos de uso nuevos — `application/useCases/`

```ts
// reorderSeries.ts
function reorderSeries(
  repository: ProfileRepository,
  profileId: string,
  orderedSeriesIds: string[],
): void

// reorderCharactersInSeries.ts
function reorderCharactersInSeries(
  repository: ProfileRepository,
  profileId: string,
  seriesId: string,
  orderedCharacterIds: string[],
): void
```

Ambos: `repository.getAll()` → ubican el `Profile` con `id === profileId`
→ aplican la función pura de `domain/harem/Harem.ts` sobre su `harem` →
`repository.save()` con el arreglo completo de perfiles (mismo perfil
reemplazado, el resto sin tocar). Si `profileId` no corresponde a ningún
perfil, no hacen nada (tolerante, igual que el resto de los casos de uso
existentes en `002`).

## `ProfilesContext` — API nueva

```ts
interface IProfilesContext {
  // ...campos existentes de 001/002 sin cambios...
  reorderSeries: (orderedSeriesIds: string[]) => void
  reorderCharactersInSeries: (seriesId: string, orderedCharacterIds: string[]) => void
}
```

Ambos métodos operan implícitamente sobre `activeProfile.id` (el
contexto ya conoce cuál perfil está activo) y disparan
`syncFromRepository()` tras persistir, igual que `reorderProfiles` ya
hace en `002`.

## `theme.layout` — token nuevo

| Token | Valor | Uso |
|---|---|---|
| ~~`layout.seriesGroupWidth`~~ | — | **Eliminado post-implementación** (ver Addendum en `research.md`): cada grupo de serie mide el ancho de su propio contenido (`Section` de `SeriesGroup` sin `width` fijo, solo `max-width: 100%`), no una columna de ancho parejo/fijo entre series — corregido a partir de una referencia visual del usuario que mostraba series "justificadas" (empaquetadas lado a lado según su propio ancho) en vez de una cuadrícula de columnas iguales. |

Se documenta también en `DESIGN.md` §5 (Layout Principles), junto al
resto de anchos de layout ya existentes (`containerNarrow`,
`containerWide`, `dialogWidth`).

## Componentes — mapeo lista/ítem-sortable (mismo patrón que `002`)

| Componente | Rol | Nuevo/editado |
|---|---|---|
| `HaremView` | Dueño del `DndContext`/`SortableContext` de nivel serie (`rectSortingStrategy`); su `Container` pasa a `flex-wrap` | Editado |
| `SeriesGroupItem` | Envoltorio sortable de una serie (`useSortable`, ref/transform, maneja el `onDragEnd` que llama `reorderSeries`) | Nuevo |
| `SeriesGroup` | Presentacional: encabezado con nombre + manija de arrastre (`dragHandleProps`, igual patrón que `ProfileCard`) + dueño de su propio `DndContext`/`SortableContext` de nivel personaje (`rectSortingStrategy`) para SU lista de personajes | Editado |
| `CharacterListItem` | Envoltorio sortable de un personaje (`useSortable`, ref/transform) dentro de una serie | Nuevo |
| `CharacterCard` | Presentacional, memoizado — sin cambios | Sin cambios |

**Invariante de aislamiento (FR-005)**: el `DndContext` de nivel
personaje vive dentro de `SeriesGroup`, uno por serie, completamente
independiente del `DndContext` de nivel serie en `HaremView` y de los
`DndContext` de las demás series — ver `research.md`, Decisión "dos
niveles de reordenamiento con `DndContext` independientes".
