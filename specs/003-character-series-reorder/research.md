# Research: Layout en Cuadrícula de Series con Reordenamiento por Drag & Drop

**Feature**: `003-character-series-reorder` | **Date**: 2026-09-11

El stack y la arquitectura ya están fijados por la constitución (v1.3.0)
y por `002-header-profile-modal`: React + TypeScript + Vite, capas
`domain/application/infrastructure/presentation/` + `shared/`,
`styled-components` con `theme.ts`/`DESIGN.md` como única fuente de
estilos, y **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
ya instalados** desde `002` para el reordenamiento de perfiles. Esta
sección cubre las decisiones específicas de esta feature.

## Decisión: reutilizar `@dnd-kit` sin sumar ninguna dependencia nueva

- **Decision**: el reordenamiento de personajes dentro de una serie y de
  series entre sí usa la misma librería `@dnd-kit` ya presente en
  `package.json` desde `002` (`ProfileList`/`ProfileListItem`), con el
  mismo patrón lista/ítem-sortable + manija (`GripVertical` de
  `lucide-react`) ya validado en `ProfileCard`.
- **Rationale**: es exactamente el mismo problema (reordenar una
  colección por drag-and-drop, con soporte mouse+touch+teclado) que
  `002` ya resolvió; reutilizar el patrón evita cualquier dependencia
  nueva (Principio IV) y mantiene un único enfoque de drag-and-drop en
  toda la app en vez de dos.
- **Alternatives considered**: ninguna otra librería fue evaluada — ya
  existe una decisión tomada y justificada en `002/research.md` que
  sigue siendo válida acá.
- **Resultado**: a diferencia de `002`, esta feature **no agrega ninguna
  dependencia nueva** — no hace falta Complexity Tracking en `plan.md`.

## Decisión: layout de series — cuadrícula `flex-wrap` de ancho de columna fijo

- **Decision**: `HaremView`'s `Container` pasa de `flex-direction:
  column` a `display: flex; flex-wrap: wrap` (fila que envuelve), y cada
  grupo de serie recibe un ancho de columna fijo (nuevo token
  `theme.layout.seriesGroupWidth`, `24rem`) en vez de ocupar el 100% del
  contenedor. Dentro de cada columna, la `CharacterList` interna sigue
  siendo la misma grilla `flex-wrap` ya existente (sin cambios) — a
  `24rem` de ancho de columna entran cómodamente 2 `CharacterCard`
  (`171px` cada una + `spacing.md` de separación ≈ `22.1rem`) por fila
  dentro de una misma serie.
- **Rationale**: reutiliza el mismo patrón visual que ya usa
  `CharacterList` (`display:flex; flex-wrap:wrap`, documentado en
  `DESIGN.md` §5 "Grilla de personajes con flex-wrap"), en vez de
  introducir un segundo sistema de layout (CSS Grid) a la app — es
  literalmente el "tipo flex wrap" que pidió el usuario. Un ancho de
  columna **fijo** (en vez de `min-width`/`flex-grow` variable) hace que
  el punto en el que una serie "ya no entra" en la fila sea predecible y
  fácil de verificar (SC-001), y que series con muchos personajes crezcan
  en **alto** (más filas internas de personajes) en vez de en ancho,
  evitando que una sola serie grande monopolice una fila entera — el
  edge case de `spec.md` sobre series con nombres/contenido largos.
- **Alternatives considered**: CSS Grid con `repeat(auto-fill,
  minmax(...))` — layout más "parejo" out-of-the-box, pero introduciría
  un segundo paradigma de wrapping en paralelo al `flex-wrap` que ya usa
  `CharacterList`, sin necesidad real. Columnas de ancho variable
  (`flex: 1 1 <min>` con `max-width`) — se descarta por ser más difícil
  de razonar/verificar visualmente y no aportar valor sobre una columna
  fija a la densidad actual de la app.
- **Seguimiento**: se agrega una entrada nueva a `DESIGN.md` §5
  documentando `seriesGroupWidth` junto al resto de anchos de layout, en
  la misma tarea que agrega el token a `theme.ts` (no es un layout
  "futuro", es el que introduce esta feature).

## Decisión: dos niveles de reordenamiento con `DndContext` independientes (no anidados en el mismo árbol de sorteo)

- **Decision**: dos "superficies" de arrastre separadas, cada una con su
  propio `DndContext`:
  1. **Nivel serie**: un único `DndContext` en `HaremView`, con un
     `SortableContext` (`rectSortingStrategy` — pensado para grillas que
     envuelven en más de una fila, a diferencia del
     `verticalListSortingStrategy` que usa `ProfileList` para su lista
     vertical simple) sobre los `id` de todas las series del harem
     activo.
  2. **Nivel personaje**: cada `SeriesGroup` monta su **propio**
     `DndContext` (no compartido con el de nivel serie ni con el de otra
     serie), con un `SortableContext` (`rectSortingStrategy` también, por
     la misma razón: `CharacterList` envuelve en varias filas) sobre los
     `id` de los personajes de esa serie únicamente.
  El arrastre de una serie se activa solo desde una manija dedicada
  (`GripVertical`, mismo patrón que `ProfileCard`) en el encabezado del
  grupo — nunca desde el cuerpo de la lista de personajes — para que un
  `pointerdown` sobre una `CharacterCard` nunca dispare, ni por
  casualidad, el sensor de arrastre de nivel serie.
- **Rationale**: usar instancias de `DndContext` **completamente
  separadas** (en vez de un único `DndContext` con múltiples
  `SortableContext` anidados, como haría un tablero Kanban típico de
  `@dnd-kit` que sí permite mover ítems entre columnas) es lo que
  garantiza estructuralmente el FR-005 (un personaje nunca puede
  terminar en una serie distinta de la que empezó): un personaje soltado
  fuera de los límites de su propia serie no tiene ningún
  droppable/`SortableContext` externo que lo reciba, porque esos
  droppables pertenecen a un `DndContext` distinto al que originó el
  arrastre. No hace falta código de validación manual para bloquear el
  cruce entre series — es una consecuencia directa de la estructura,
  cumpliendo Principio IV (menos código, no una regla nueva a mantener).
- **Alternatives considered**: un único `DndContext` raíz con
  `SortableContext`s anidados por serie (patrón multi-columna estándar
  de `@dnd-kit`) — se descarta porque ese patrón está diseñado
  justamente para *permitir* mover ítems entre contenedores, lo que
  exigiría lógica adicional de `onDragOver`/validación para *impedir*
  exactamente lo que el patrón habilita por defecto; usar contextos
  separados logra el resultado pedido (FR-005) con menos superficie de
  código, no más.

## Decisión: rendimiento del reordenamiento con harems de 200+ personajes (Principio III)

- **Decision**: mantener `CharacterCard` memoizado por props (sin
  cambios) y envolver el `ref`/`transform` del arrastre en un componente
  intermedio nuevo, `CharacterListItem` (mismo patrón que
  `ProfileListItem` de `002`), que es el único que recibe el estilo de
  transform en movimiento. De la misma forma, `SeriesGroupItem` (nuevo)
  es el único que recibe el transform del arrastre a nivel serie;
  `SeriesGroup` en sí sigue siendo presentacional.
- **Rationale**: al usar un `DndContext` independiente por serie (ver
  decisión anterior), arrastrar un personaje dentro de la Serie A nunca
  actualiza el contexto de React de ningún otro `DndContext` (ni el de
  la Serie B, ni el de nivel serie) — series que no participan del
  arrastre no vuelven a renderizar ningún componente mientras dura ese
  arrastre. Dentro de la serie que sí se está arrastrando, solo
  `CharacterListItem`/`SeriesGroupItem` (envoltorios livianos) reciben
  nuevas props de transform en cada frame; `CharacterCard`, memoizado por
  `character`/`staggerIndex`, no vuelve a renderizar su contenido pesado
  (imagen, textos) salvo que su posición final cambie lo suficiente como
  para afectar el `staggerIndex` acotado a 12 que ya usa la cascada de
  entrada (mismo límite ya documentado en `DESIGN.md`/Principio III, no
  es una regresión de esta feature).
- **Alternatives considered**: un único `DndContext`/`SortableContext`
  compartido para todo el harem (todas las series y personajes a la
  vez) — se descarta porque forzaría a `@dnd-kit` a trackear 200+ ítems
  en un solo contexto de arrastre, con mayor probabilidad de
  recalcular colisiones/renders de más en harems grandes, además de no
  cumplir el aislamiento entre series de FR-005 sin lógica extra (ver
  decisión anterior).

## Decisión: identidad de personaje/serie para persistir el nuevo orden

- **Decision**: dos funciones puras nuevas en `domain/harem/Harem.ts`,
  con la misma forma que `reorderProfiles` de `domain/profile/Profile.ts`
  (tolerantes a ids desconocidos o faltantes, nunca lanzan): `
  reorderSeries(harem, orderedSeriesIds)` reordena `harem.series`; `
  reorderCharactersInSeries(harem, seriesId, orderedCharacterIds)`
  reordena `series.characters` de la serie indicada únicamente. El
  arrastre en sí se traduce a esa lista de ids reordenada reutilizando
  `presentation/computeReorderedIds.ts` **sin modificarlo** (ya es
  genérico sobre cualquier lista de ids).
- **Rationale**: mismo patrón ya probado en `002` para perfiles
  (`Profile.reorderProfiles` + `computeReorderedIds` +
  `application/useCases/reorderProfiles.ts`); reutilizar la función pura
  `computeReorderedIds` sin tocarla evita duplicar lógica de traducción
  drag→ids ya testeada.
- **Alternatives considered**: agregar un campo `order` numérico
  explícito a `Character`/`Series` (en vez de que el orden del array sea
  la fuente de verdad) — se descarta por ser exactamente el mismo debate
  que ya resolvió `001`/`002` para `Harem.series`/`Profile[]`: el orden
  del array ya es, hoy, la fuente de verdad tanto para personajes dentro
  de una serie como para series dentro de un harem (ver
  `domain/harem/Harem.ts` actual), así que sumar un campo `order` sería
  una segunda fuente de verdad redundante sin necesidad.

## Decisión: persistencia (Principio I)

- **Decision**: dos casos de uso nuevos en `application/useCases/`,
  `reorderSeries.ts` y `reorderCharactersInSeries.ts`, con la misma forma
  que `reorderProfiles.ts` de `002`: reciben el `ProfileRepository`, el
  `profileId` del perfil activo y la lista de ids reordenada; leen
  `repository.getAll()`, aplican la función pura de `domain/` sobre el
  harem de ese perfil, y persisten con `repository.save()` el arreglo
  completo de perfiles (mismo contrato "leer todo / guardar todo" de
  `ProfileRepository`, sin cambios a esa interfaz).
- **Rationale**: no hace falta ningún cambio a `ProfileRepository` ni a
  `LocalStorageProfileRepository` — el harem ya viaja embebido dentro de
  cada `Profile`, así que persistir un nuevo orden de personajes/series
  es, para la capa de infraestructura, indistinguible de persistir
  cualquier otro cambio al perfil (mismo mecanismo que ya persiste
  renombrar o sincronizar un harem).
- **Alternatives considered**: ninguna — es una extensión directa del
  mecanismo de persistencia ya existente, sin alternativas de diseño
  relevantes.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.

## Addendum (post-implementación): corrección del layout de series

Durante la implementación, el usuario compartió una referencia visual
del patrón esperado ("justificado" de series y listas): cada grupo de
serie debe medir el ancho de su propio contenido (una serie de 1
personaje es angosta, una de 7 es ancha) y varias series se empaquetan
lado a lado, apretadas, en la misma fila hasta que no entra otra —
**no** una cuadrícula de columnas de ancho parejo/fijo, que es lo que
describía la Decisión "layout de series" de arriba (`seriesGroupWidth`
como ancho de columna fijo, con `min(seriesGroupWidth, 100%)` agregado
después para el caso mobile).

- **Decision revisada**: se elimina el token `theme.layout.
  seriesGroupWidth` y el ancho fijo/`min()` en `Section` de
  `SeriesGroup`. En su lugar, `Section` no fija ningún `width` propio —
  usa el tamaño de contenido por defecto de un ítem flex (`flex: 0 1
  auto`), con `max-width: 100%` como tope defensivo. `HaremView.Container`
  suma `align-items: flex-start` para que una serie corta no se estire
  verticalmente para igualar el alto de una serie vecina con varias
  filas internas de personajes.
- **Por qué también resuelve mobile sin `min()`**: el `flex-shrink: 1` /
  `min-width: auto` por defecto de un ítem flex ya permite que el
  navegador achique una serie cuyo contenido no entra en el ancho
  disponible; al achicarse, la `CharacterList` interna (que ya usa
  `flex-wrap`) empieza a acomodar sus personajes en más de una fila en
  vez de desbordar — sin necesitar ningún `min()` explícito.
- **Impacto en artefactos ya escritos**: `data-model.md` (tabla de
  tokens), `contracts/series-layout-dnd-ui.md` (`SeriesGroupItem`/
  `HaremView`) y `tasks.md` (T004, T027) se actualizaron para reflejar
  este comportamiento; el resto de las decisiones de esta feature
  (reutilizar `@dnd-kit`, `DndContext` independiente por serie,
  funciones puras de reordenamiento, persistencia) no cambia.

## Addendum 2 (post-implementación): `CSS.Translate` en vez de `CSS.Transform` para el estilo de arrastre

Reportado por el usuario tras el Addendum 1: mientras se arrastra una
serie (o, potencialmente, un personaje), la tarjeta/serie arrastrada se
deforma visualmente (se estira o achica de forma no uniforme) durante el
gesto.

- **Causa**: `SeriesGroupItem`/`CharacterListItem` aplicaban el estilo
  de arrastre con `CSS.Transform.toString(transform)` de
  `@dnd-kit/utilities`, que compone `translate3d(...)` **más**
  `scaleX(...) scaleY(...)` — ese factor de escala compensa que el
  tamaño medido del ítem cambie levemente durante el arrastre. Desde el
  Addendum 1, `Section` de `SeriesGroup` ya no tiene un ancho fijo: su
  tamaño real depende de su propio contenido y de cuánto espacio le
  queda en la fila, así que cambia de verdad a medida que la fila se
  reacomoda mientras se arrastra. Aplicarle una escala de compensación a
  un ítem cuyo tamaño "correcto" está cambiando de verdad (no por un
  error de medición) produce la deformación visual reportada.
- **Decision**: usar `CSS.Translate.toString(transform)` (sin escala) en
  vez de `CSS.Transform.toString(transform)` en `SeriesGroupItem` y
  `CharacterListItem` — mismo fix documentado por `@dnd-kit` para listas
  ordenables tipo grilla/`flex-wrap` (`rectSortingStrategy`) con ítems de
  tamaño variable.
- **Alternatives considered**: volver a un ancho fijo de columna (como
  en la versión previa al Addendum 1) eliminaría el síntoma, pero
  reintroduciría el problema que el Addendum 1 vino a corregir (series
  "justificadas" por contenido, no en columnas parejas) — se descarta.
- **`ProfileListItem` (`002`) no se tocó**: usa `CSS.Transform` sin
  problema porque `ProfileList` es una lista vertical simple
  (`flex-direction: column`), sin `flex-wrap`, así que el tamaño de cada
  fila no depende de su posición ni se reacomoda de la misma forma.
