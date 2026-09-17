# Contrato: UI del buscador (`HaremSearchContext` / `HaremSearchButton` / integración con `HaremView`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna. El efecto de fondo sobre
el harem renderizado se describe en `filter-harem-by-query.md`.

## `HaremSearchContext` / `useHaremSearch()`

```ts
export interface IHaremSearchContext {
  isOpen: boolean
  query: string
  toggleOpen: () => void
  setQuery: (value: string) => void
}
```

- **Estado inicial**: `{ isOpen: false, query: '' }`.
- **`toggleOpen()`**:
  - Si `isOpen === false` → pasa a `true`; `query` no cambia (ya debería
    estar en `''`, ver invariante abajo).
  - Si `isOpen === true` → pasa a `false` **y** `query` se limpia a
    `''` en la misma actualización (FR-009).
- **`setQuery(value)`**: si `isOpen === true`, reemplaza `query` por
  `value` tal cual (sin trim ni normalizar — eso lo hace
  `filterHaremByQuery` del lado de `domain/`). Si `isOpen === false`, no
  hace nada (no debería poder invocarse desde la UI en ese estado, pero
  el contrato lo deja definido).
- **Reset por cambio de perfil activo** (FR-010): igual que
  `HaremSortContext`, el estado se deriva durante el render comparando
  el `id` del perfil activo contra el último visto; si cambió, el
  estado vuelve a `{ isOpen: false, query: '' }` antes de que el nuevo
  perfil se pinte.
- **Invariante**: mientras `isOpen === false`, `query` es siempre `''`
  — no existe ningún camino que deje texto "colgado" con el buscador
  cerrado (se limpia en `toggleOpen()` al cerrar, y en el reset por
  cambio de perfil).

## `HaremSearchButton`

- **Responsabilidad única**: el botón/campo de búsqueda dentro de
  `HeaderActions` — su presentación colapsada (círculo con ícono
  `Search`) y expandida (campo de texto con el mismo ícono anclado a la
  derecha), y el toggle de apertura/cierre (FR-001/FR-002/FR-003).
- **Visible solo con perfil activo**: mismo criterio que
  `ShareHaremButton`/`UpdateHaremButton`/`HaremSortButton` (condicional
  `activeProfile &&` ya existente en `HeaderActions`).
- **Colapsado** (`isOpen === false`): un único elemento con el mismo
  tamaño/forma que los demás botones redondos de `HeaderActions`
  (2.25rem, `radii.pill`), sin `input` montado. Presionar el ícono llama
  `toggleOpen()`.
- **Expandido** (`isOpen === true`): el contenedor anima su `width`
  (transición CSS, `theme.motion.duration.base`/`easing`, ver
  `research.md` §4) desde el tamaño colapsado hasta
  `min(theme.layout.searchFieldWidth, 45vw)`; se monta un `input` de
  texto que ocupa el espacio ganado, con el ícono `Search` (ahora
  también el botón de cierre) anclado en el borde derecho del campo
  (FR-003). El `input` recibe foco automáticamente al terminar de
  abrirse.
- **`onChange` del input**: cada cambio de valor llama `setQuery(value)`
  de inmediato — sin debounce, sin botón de confirmación (FR-004).
- **Cierre**: presionar el ícono estando expandido llama `toggleOpen()`
  (limpia `query` vía el contrato de `HaremSearchContext` de arriba). No
  hay cierre por click afuera ni por `Escape` (ver `research.md` §5) —
  a diferencia de `HaremSortButton`, es una decisión deliberada.
- **Accesibilidad**: `aria-label` distinto según estado ("Buscar en el
  harem" / "Cerrar buscador") en el ícono-botón, `aria-expanded`
  reflejando `isOpen`; el `input`, cuando está montado, tiene su propio
  `aria-label` ("Buscar personaje o serie").

## Integración con `HaremView`

- **No se agrega ningún prop nuevo** a `SeriesGroupItem`/`SeriesGroup`/
  `CharacterListItem` — ya aceptan `dragDisabled`, que no necesita saber
  *por qué* está deshabilitado.
- `HaremView` consume `useHaremSearch()` además de `useHaremSort()`
  (`010`, ya existente). Calcula:
  1. `sorted = isActive ? sortHaremByKakera(harem, direction) : harem`
     (comportamiento de `010`, sin cambios).
  2. `displayedHarem = filterHaremByQuery(sorted, query)` (nuevo).
  3. `isSearching = query.trim().length > 0`.
  4. `dragDisabled = isActive || isSearching` (extiende la condición ya
     existente, ver `research.md` §3).
- **Estado "sin resultados"** (FR-008): si `isSearching &&
  displayedHarem.series.length === 0`, se renderiza el `EmptyMessage`
  ya existente (`HaremView/styles.tsx`) con un texto que menciona el
  término buscado, en vez de la grilla vacía. Este chequeo es
  **independiente** del chequeo ya existente `harem.series.length ===
  0` (perfil sin ningún personaje cargado) — ambos usan el mismo
  componente visual pero con mensajes distintos, y el de "perfil vacío"
  tiene prioridad si el harem de entrada ya venía vacío antes de
  cualquier búsqueda.
- **`SortCommandBar`/`CopyCommandButton` (`009`) no se tocan**: siguen
  leyendo `activeProfile.harem` sin pasar por `filterHaremByQuery` ni
  por `sortHaremByKakera` — el comando exportado nunca refleja ni el
  filtro de búsqueda ni el ordenamiento temporal (Principio II).

## Casos borde cubiertos por el contrato

- Sin perfil activo: `HaremSearchButton` no se renderiza — no hay forma
  de abrir el buscador.
- El usuario cambia de perfil con el buscador abierto y texto
  ingresado: `HaremSearchContext` resetea `isOpen`/`query` (FR-010); el
  nuevo perfil se muestra completo, sin ningún filtro heredado.
- El usuario cierra el buscador teniendo texto ingresado: `query` se
  limpia y `HaremView` vuelve a mostrar el harem completo (más el
  ordenamiento temporal por kakera, si estaba activo) en el mismo
  render en que se cierra — sin parpadeo de un estado intermedio.
- El usuario tiene el ordenamiento temporal por kakera (`010`) activo Y
  una búsqueda activa al mismo tiempo: `HaremView` aplica primero el
  orden, después el filtro (ver Integración arriba) — el resultado
  visible es el subconjunto filtrado, en el orden por kakera; el drag
  sigue deshabilitado por ambos motivos combinados.
- El usuario arrastra un personaje o una serie mientras hay una
  búsqueda activa: el gesto no inicia (mismo mecanismo de `010`,
  `dragDisabled`).
- Viewport angosto (~390px, Principio V): el campo expandido no
  desborda `Bar`/`HeaderActions` ni fuerza scroll horizontal de la
  página (acotado por `min(token, 45vw)`).

## Testing de este contrato

- `HaremSearchButton` sin `activeProfile` → no se renderiza.
- Click en el ícono estando colapsado → aparece un `input` en el DOM,
  con foco; `aria-expanded` pasa a `"true"`.
- Escribir en el `input` → `HaremView` renderiza solo las
  series/personajes coincidentes en cada cambio (sin necesidad de Enter
  ni de un botón de confirmar).
- Click en el ícono estando expandido con texto ingresado → el `input`
  desaparece del DOM, `HaremView` vuelve a mostrar el harem completo, y
  al reabrir el buscador el `input` aparece vacío.
- Cambiar de perfil activo con el buscador abierto y texto ingresado →
  el buscador queda cerrado y sin texto, y el harem del nuevo perfil se
  muestra completo.
- Con una búsqueda activa que no coincide con nada → `HaremView`
  muestra el mensaje de "sin resultados" (no la grilla vacía del caso
  "perfil sin personajes").
- Con el ordenamiento temporal por kakera activo y una búsqueda activa
  al mismo tiempo → el subconjunto filtrado se muestra ordenado por
  kakera; desactivar la búsqueda deja ver el harem completo ordenado
  por kakera (sin haber tocado el estado del ordenamiento).
- Con una búsqueda activa, intentar arrastrar una serie o un personaje
  no dispara `reorderSeries`/`reorderCharactersInSeries`.
- Con una búsqueda activa, el comando generado por
  `SortCommandBar`/`CopyCommandButton` (`009`) sigue siendo exactamente
  el del harem completo sin filtrar — test de integración que cubre el
  gate de Principio II.
