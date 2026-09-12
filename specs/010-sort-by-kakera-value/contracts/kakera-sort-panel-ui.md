# Contrato: UI del panel de ordenamiento (`HaremSortButton` / `HaremSortPanel` / `KakeraSortOption` / `RankSortOption`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna. El efecto de fondo sobre
el harem renderizado se describe en `sort-haremby-kakera.md` y en
`HaremView` (ver `research.md` §4).

## `HaremSortButton`

- **Responsabilidad única**: el botón circular con ícono `Filter`
  (FR-001) montado dentro de `HeaderActions`, y si el panel está
  desplegado o no (`isOpen`).
- **Visible solo con perfil activo**: mismo criterio que
  `ShareHaremButton`/`UpdateHaremButton` (condicional
  `activeProfile &&` ya existente en `HeaderActions`).
- **Al activarse** (click/tap/Enter con foco): alterna `isOpen`
  (FR-002). Monta/desmonta `<HaremSortPanel />` condicionalmente según
  `isOpen` (a diferencia de `SortCommandBar`, no requiere quedar
  siempre montado — no hay requerimiento de animación de
  apertura/cierre para este panel).
- **Cierre por click afuera / Escape**: mismo patrón ya implementado por
  `SettingsFab`/`SortCommandToggle` (listener de `pointerdown`/
  `keydown` a nivel de documento mientras `isOpen === true`, comparando
  contra un `wrapperRef` que engloba el botón y el panel desplegado).
- **El contenedor local del botón NO es `position: relative`** (a
  diferencia de `SettingsFab`'s `Wrapper`) — es la condición que permite
  que `HaremSortPanel` se ancle al `Bar` del header en vez de a este
  botón (ver `research.md` §3).
- **Accesibilidad**: `aria-label="Ordenar harem"` (o equivalente),
  `aria-expanded` reflejando `isOpen`, operable por teclado.

## `HaremSortPanel`

- **Responsabilidad única**: el panel con fondo `theme.colors.accent`
  (FR-003) anclado justo debajo del header completo (`position:
  absolute; top: 100%; left: 0; right: 0;`, ver `research.md` §3,
  `z-index: theme.zIndex.dropdown`), y el estado de acordeón
  `isSortSectionOpen` del ítem "Ordenamiento" (FR-004).
- **No** decide cuándo está montada (lo controla `HaremSortButton` vía
  mount/unmount condicional) ni contiene lógica de ordenamiento — la
  delega en `KakeraSortOption`/`RankSortOption`.
- **Contenido**:
  1. Una fila/botón "Ordenamiento" que alterna `isSortSectionOpen`.
  2. Cuando `isSortSectionOpen === true`: renderiza `<KakeraSortOption
     />` y `<RankSortOption />`, en ese orden.
- **Color de texto**: `theme.colors.onAccent` (mismo token ya usado por
  el feedback de "copiado" sobre fill de acento) para mantener contraste
  legible sobre el fondo `accent`.

## `KakeraSortOption`

- **Responsabilidad única**: la fila "Valor de Kakera" — el interruptor
  on/off (FR-006) y, junto a él, el control de dirección (flecha,
  FR-008/FR-009). Consume `useHaremSort()` (`HaremSortContext`) para
  leer `isActive`/`direction` y llamar `toggleActive()`/
  `toggleDirection()`; no tiene estado propio.
- **Interruptor**: al presionarlo, llama `toggleActive()`. Estando
  apagado → queda encendido y `direction` vuelve a `'desc'` (FR-006).
  Estando encendido → se apaga (FR-006), sin tocar `direction` (queda
  guardada para la próxima vez que se encienda, pero como FR-006 fuerza
  `'desc'' al encender, ese valor guardado nunca se usa — ver
  `research.md` §5).
- **Feedback visual de "encendido"**: el propio interruptor refleja
  `isActive` (ej. fill/borde con `theme.colors.accentHover` o
  equivalente sobre el fondo `accent` del panel) — debe seguir siendo
  legible sobre `theme.colors.accent` (Principio V/legibilidad, no solo
  estética).
- **Flecha de dirección** (ícono `ArrowUp`, rotado 180° cuando
  `direction === 'desc'`, ver `research.md` §6): **solo visible/activa
  mientras `isActive === true`** (FR-009) — mientras `isActive ===
  false`, o no se renderiza, o se renderiza `disabled` sin llamar a
  `toggleDirection()` al presionarla. Al presionarla (solo si
  `isActive`), llama `toggleDirection()`.
- **Accesibilidad**: el interruptor expone su estado con
  `aria-pressed={isActive}`; la flecha expone
  `aria-label={direction === 'desc' ? 'Orden descendente, cambiar a ascendente' : 'Orden ascendente, cambiar a descendente'}` (o
  equivalente) y `disabled` cuando `!isActive`.

## `RankSortOption`

- **Responsabilidad única**: la fila "Rank" — visualmente presente
  (FR-005) pero sin ningún handler que cambie estado ni invoque nada al
  presionarla (placeholder para una feature futura). Renderizada
  `disabled` (o con `aria-disabled="true"` si no es un `<button>`
  nativo) para comunicar visualmente que todavía no hace nada.
- No consume `HaremSortContext` ni ningún otro contexto — es
  intencionalmente inerte.

## Casos borde cubiertos por el contrato

- Sin perfil activo: `HaremSortButton` no se renderiza (mismo criterio
  que sus hermanos de `HeaderActions`) — no hay forma de abrir el panel.
- El usuario cambia de perfil con el panel abierto y el ordenamiento
  activo: `HaremSortContext` resetea `isActive`/`direction` (FR-011);
  el panel en sí puede seguir abierto o cerrarse según el criterio de
  `HaremSortButton` (no está atado al reset del contexto) — lo que
  importa es que la lista vuelve al orden manual del nuevo perfil.
- El usuario presiona la flecha de dirección repetidas veces seguidas:
  cada click alterna `direction` de forma síncrona, sin animación que
  pueda quedar a medio camino (no hay transición CSS de posición que
  interrumpir, solo la rotación del ícono).
- Viewport angosto (~390px, Principio V): el panel ocupa el ancho
  completo del header (`left:0; right:0`) sin desbordar la pantalla ni
  requerir scroll horizontal de la página.
- El usuario arrastra un personaje o una serie mientras el ordenamiento
  está activo: el gesto no inicia (`useSortable({ disabled: true })`,
  ver `research.md` §4) — no hay drag parcial ni "rebote" visual.

## Testing de este contrato

- `HaremSortButton` sin `activeProfile` → no se renderiza.
- Click en `HaremSortButton` → `HaremSortPanel` aparece en el DOM;
  click afuera o Escape → desaparece.
- Click en "Ordenamiento" dentro del panel → aparecen `KakeraSortOption`
  y `RankSortOption`; click de nuevo → desaparecen.
- Click en el interruptor de `KakeraSortOption` estando apagado → la
  lista renderizada (`HaremView`) queda ordenada descendente por
  kakera (series por suma, personajes por su propio valor);
  `aria-pressed` pasa a `"true"`.
- Click de nuevo → la lista vuelve exactamente al orden manual previo
  (comparación de secuencia de ids, no solo de apariencia);
  `aria-pressed` vuelve a `"false"`.
- Con el interruptor activo, click en la flecha → la lista pasa a orden
  ascendente; click de nuevo → vuelve a descendente.
- Con el interruptor inactivo, la flecha no dispara ningún cambio de
  orden aunque se interactúe con ella.
- Click en "Rank" → ningún cambio observable en el harem renderizado ni
  en ningún estado.
- Con el ordenamiento activo, el comando generado por
  `SortCommandBar`/`CopyCommandButton` (009) sigue siendo exactamente
  el que corresponde al orden manual persistido (no al orden temporal
  visible) — test de integración que cubre el gate de Principio II.
- Con el ordenamiento activo, intentar arrastrar una serie o un
  personaje no dispara `reorderSeries`/`reorderCharactersInSeries`.
