# Contrato: UI de layout y drag-and-drop — `HaremView`/`SeriesGroup`/`CharacterCard`

**Módulos**: `presentation/components/HaremView/`,
`presentation/components/SeriesGroup/`, nuevos
`presentation/components/SeriesGroupItem/` y
`presentation/components/CharacterListItem/`. Sigue el mismo patrón
lista/ítem-sortable + manija ya usado por
`ProfileList`/`ProfileListItem`/`ProfileCard` en `002` — ver
`data-model.md` para el mapeo completo de componentes.

## `HaremView` — cambios

- `Container` pasa de `flex-direction: column` a `display: flex;
  flex-wrap: wrap; align-items: flex-start` (FR-002); el `gap` existente
  (`spacing.xxl`) se mantiene entre grupos de serie. `align-items:
  flex-start` (corrección post-implementación, ver Addendum en
  `research.md`) evita que una serie corta se estire verticalmente para
  igualar el alto de una serie vecina más alta en la misma fila.
- Monta un único `DndContext` (sensores: `PointerSensor` +
  `KeyboardSensor` con `sortableKeyboardCoordinates`, igual que
  `ProfileList`; `collisionDetection={closestCenter}`) envolviendo un
  `SortableContext` con `strategy={rectSortingStrategy}` sobre
  `harem.series.map(s => s.id)`.
- Mapea `harem.series` a `<SeriesGroupItem key={series.id} series={series} />`
  en vez de `<SeriesGroup key={series.id} series={series} />` directo.
- `onDragEnd`: mismo patrón que `ProfileList.handleDragEnd` — si hay
  `over`, calcula `computeReorderedIds(seriesIds, activeId, overId)` y
  llama `reorderSeries(...)` del contexto.
- Caso `harem.series.length === 0`: sin cambios (sigue mostrando
  `EmptyMessage`, sin montar ningún `DndContext` — no hay nada que
  arrastrar).

## `SeriesGroupItem` — nuevo

- Envoltorio sortable de una serie: `useSortable({ id: series.id })`,
  aplica `transform`/`transition` al nodo raíz (mismo patrón que
  `ProfileListItem`). **Corrección post-implementación** (ver Addendum
  en `research.md`): no fija ningún `width` propio — el ancho de cada
  serie lo determina su propio contenido en `Section` de `SeriesGroup`
  (`max-width: 100%` ahí, sin ancho fijo/uniforme entre series), no un
  token de ancho de columna.
- Pasa `attributes`/`listeners` de `useSortable` como `dragHandleProps`
  a `SeriesGroup` (mismo patrón que `ProfileListItem` → `ProfileCard`).
- No conoce ni renderiza personajes directamente — delega todo el
  contenido a `SeriesGroup`.

## `SeriesGroup` — cambios

- Recibe una prop nueva opcional `dragHandleProps` (mismo tipo que ya
  usa `ProfileCard`: `{ attributes, listeners }`); si está presente,
  renderiza un botón de manija (ícono `GripVertical` de `lucide-react`,
  `touch-action: none`) junto a `SeriesName` en el encabezado de la
  sección.
- Monta su **propio** `DndContext` (mismos sensores/colisión que
  `HaremView`) envolviendo un `SortableContext` con
  `strategy={rectSortingStrategy}` sobre
  `series.characters.map(c => c.id)` — independiente del `DndContext` de
  `HaremView` y del de cualquier otra `SeriesGroup` (ver `research.md`,
  invariante de aislamiento de FR-005).
- Mapea `series.characters` a
  `<CharacterListItem key={character.id} character={character} staggerIndex={...} />`
  en vez de `<CharacterCard ... />` directo.
- `onDragEnd` propio: mismo patrón, calcula
  `computeReorderedIds(characterIds, activeId, overId)` y llama
  `reorderCharactersInSeries(series.id, ...)` del contexto.
- `CharacterList` (ya existente, `flex-wrap`) no cambia de estilos.

## `CharacterListItem` — nuevo

- Envoltorio sortable de un personaje: `useSortable({ id: character.id })`,
  aplica `transform`/`transition` al nodo raíz (mismo patrón que
  `ProfileListItem`/`CardListItem` análogos).
- A diferencia de `SeriesGroupItem`, **no** usa manija dedicada: pasa
  `attributes`/`listeners` directo al nodo raíz completo, porque
  `CharacterCard` no tiene ningún control interactivo propio (sin
  `onClick`, sin botones) — toda la tarjeta puede ser la superficie de
  arrastre sin ambigüedad ni conflicto con otra interacción.
- Renderiza `CharacterCard` sin cambios (sigue memoizado, sigue
  recibiendo `character`/`staggerIndex` igual que hoy).

## Retroalimentación visual durante el arrastre (FR-013)

- Mientras se arrastra (`transform` activo de `useSortable`), el ítem
  arrastrado se muestra desplazado siguiendo el puntero/gesto (estándar
  de `@dnd-kit`); se aplica una opacidad reducida (mismo valor que ya
  use `ProfileListItem`/`ProfileCard` para su estado de arrastre, si lo
  tiene, o `0.5` si no hay precedente) al ítem de origen mientras está
  activo, para distinguir "el que se mueve" de "el resto de la lista".

## Testing de este contrato

- Test de que `HaremView` renderiza más de una `SeriesGroupItem` por
  fila cuando el contenedor tiene ancho suficiente (verificable por
  estilos computados/snapshot, no por medición real de layout en
  `jsdom`).
- Test de arrastre de nivel serie (`ProfileList.dragdrop.test.tsx` de
  `002` como referencia de cómo simular `DragEndEvent` de `@dnd-kit` sin
  gesto real): soltar una serie sobre otra posición llama
  `reorderSeries` con la secuencia de ids esperada.
- Test de arrastre de nivel personaje, mismo mecanismo, dentro de una
  única serie: soltar un personaje sobre otra posición **de la misma
  serie** llama `reorderCharactersInSeries` con la secuencia esperada.
- Test de que `CharacterCard` memoizado no vuelve a renderizar su
  contenido (mock/spy o conteo de renders) para personajes de una serie
  distinta a la que se está arrastrando.
