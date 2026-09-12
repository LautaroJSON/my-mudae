# Research: Ordenar por Valor de Kakera (Temporal)

**Feature**: `010-sort-by-kakera-value`

No quedó ningún `NEEDS CLARIFICATION` en `spec.md`/Technical Context —
este documento registra las decisiones técnicas de diseño (no de
producto) tomadas para resolver ambigüedades de implementación dentro
de los márgenes ya fijados por la spec y la constitución.

## 1. Dónde vive la lógica de ordenamiento

**Decisión**: función pura nueva `sortHaremByKakera(harem, direction)`
agregada a `domain/harem/Harem.ts`, junto a `reorderSeries`/
`reorderCharactersInSeries`/`sumKakera` ya existentes. Devuelve un
`Harem` nuevo (nunca muta el recibido); el valor de kakera faltante se
trata como `0` (mismo criterio que `sumKakera`, FR-013); el `Array.sort`
nativo de JS es estable desde ES2019 (todos los runtimes objetivo de
esta app), así que los empates conservan el orden relativo original sin
código adicional (FR-014) — no hace falta un comparador de desempate
explícito.

**Alternativas consideradas**:
- Calcularlo inline dentro de `HaremView` (rechazada: no sería testeable
  de forma aislada ni reutilizable, y mezclaría lógica de dominio con
  presentación).
- Un archivo nuevo `domain/harem/sortHaremByKakera.ts` (rechazada:
  fragmenta funciones que ya conviven en `Harem.ts` y responden a la
  misma pregunta de "orden del harem"; no hay otro archivo de dominio en
  el proyecto dedicado a una sola función de reordenamiento).

## 2. Por qué el comando `$sm` no se ve afectado (Principio II)

**Decisión**: no tocar `SortCommandBar`, `CopyCommandButton` ni
`formatSortCommand` (009). Esos componentes leen `activeProfile.harem`
directamente de `useProfiles()` en cada render — nunca reciben el
`Harem` "para mostrar" que arma `HaremView`. Como `sortHaremByKakera`
solo se invoca dentro de `HaremView` (para decidir qué renderiza), y su
resultado nunca se guarda en `ProfilesContext` ni se pasa a ningún
componente de la cadena de copiado, es estructuralmente imposible que el
comando exportado refleje el orden temporal — no depende de que nadie
"se acuerde" de no usarlo ahí.

**Alternativas consideradas**:
- Pasar el `Harem` ya ordenado hacia abajo desde `App.tsx` como única
  fuente para toda la pantalla (rechazada: `SortCommandBar` volvería a
  leer ese mismo objeto si en el futuro alguien refactoriza
  `AppContent` para pasarlo como prop en vez de usar `useProfiles()`
  directo — mantener `SortCommandBar` leyendo el contexto de perfiles
  tal cual hoy es la opción que hace la violación de Principio II
  estructuralmente imposible, no solo improbable).

## 3. Cómo se posiciona el panel "justo debajo del header" sin medir nada en JS

**Decisión**: `HaremSortPanel` usa `position: absolute; top: 100%; left:
0; right: 0;`. `Header`'s `Bar` (`styles.tsx` de `Header`) ya es
`position: sticky`, que establece contenedor de posicionamiento para
descendientes `absolute` igual que `relative` — y `HaremSortButton`
(dentro de `HeaderActions`, dentro de `RightGroup`, dentro de `Bar`) es
descendiente de `Bar`. Mientras el `div` contenedor local de
`HaremSortButton` se deje en `position: static` (a diferencia de
`SettingsFab`'s `Wrapper`, que sí es `position: relative` a propósito),
`Bar` queda como el contenedor de posicionamiento más cercano, así que
`top: 100%` ancla el panel exactamente al borde inferior del header
completo, ocupando su ancho completo — sin `ResizeObserver`, sin CSS
custom property, sin tocar `Header`/`HeaderActions` más que para montar
el botón.

**Alternativas consideradas**:
- Medir la altura del header con `ResizeObserver` (mismo patrón ya usado
  en `SeriesGroup` para su propio encabezado) y aplicarla como
  `top: <valor>px` (rechazada: innecesariamente compleja para este caso,
  ya que el truco de `position: absolute` relativo al `Bar` sticky
  resuelve lo mismo con CSS puro).
- Renderizar el panel como hijo directo de `Header` en vez de
  `HeaderActions` (rechazada: obligaría a `Header` a conocer el estado
  `isOpen` de una feature ajena, rompiendo el desacople que `004`
  estableció deliberadamente — ver comentario existente en
  `HeaderActions/index.tsx`).

## 4. Cómo deshabilitar el drag-and-drop mientras el ordenamiento está activo (FR-015)

**Decisión**: usar la opción `disabled` que ya expone
`useSortable` de `@dnd-kit/sortable` (`useSortable({ id, disabled })`),
propagada como prop `dragDisabled` desde `HaremView` hacia
`SeriesGroupItem` (nivel serie) y desde `SeriesGroup` hacia
`CharacterListItem` (nivel personaje); además se deshabilita el propio
botón `DragHandle` de `SeriesGroup` (`disabled={dragDisabled}`) para que
tampoco quede con estilo "agarrable" mientras está inactivo. Con
`disabled: true`, `dnd-kit` no dispara el gesto de arrastre para ese
ítem — no hace falta desmontar `DndContext`/`SortableContext` ni tocar
los sensores globales.

**Alternativas consideradas**:
- Dejar el `handleDragEnd` como no-op cuando el ordenamiento está activo
  (rechazada: el ítem seguiría respondiendo visualmente al gesto de
  arrastre — cursor de agarre, animación de levantar — y luego "rebotaría"
  a su posición sin que el usuario entienda por qué; la spec pide
  explícitamente que el arrastre "quede deshabilitado", no solo que no
  tenga efecto).
- No montar `DndContext`/`SortableContext` en absoluto mientras está
  activo (rechazada: forzaría desmontar/remontar toda la subestructura
  sortable al alternar el toggle, perdiendo el layout estable que ya da
  `rectSortingStrategy`, y `useSortable` fuera de un `SortableContext`
  no es un patrón soportado por la librería).

## 5. Dónde vive el estado on/off + dirección

**Decisión**: contexto nuevo `HaremSortContext` en
`presentation/context/`, anidado DENTRO de `ProfilesProvider` (necesita
`activeProfile?.id` para resetearse en cambio de perfil, FR-011). Expone
`isActive`, `direction`, `toggleActive()` (apaga si está activo; si
estaba apagado, activa siempre en `desc`, per FR-006) y
`toggleDirection()` (no-op si `!isActive`, refuerza FR-009 también a
nivel de estado, no solo deshabilitando el botón en la UI).

**Alternativas consideradas**:
- Agregar los campos a `ProfilesContext` (rechazada: ese contexto es
  estado de dominio persistido; mezclar un estado de UI efímero ahí
  rompería la distinción ya establecida en el proyecto entre estado
  persistido y estado de interacción local, y obligaría a
  `ProfilesContext` a conocer una preocupación puramente de
  presentación).
- Prop drilling manual desde `AppContent` hacia `Header`/`HaremView`
  (rechazada: `Header` tendría que reenviar props sin usarlas él mismo
  hasta `HeaderActions` → `HaremSortButton`, rompiendo el mismo
  desacople de `Header` mencionado en §3).

## 6. Ícono de dirección

**Decisión**: un único ícono `ArrowUp` de `lucide-react`, rotado 180°
vía CSS (`transform: rotate(180deg)`, con transición usando
`theme.motion.duration.fast`) cuando `direction === 'desc'` — que es el
estado por defecto al activar (FR-006), así que al tocar "Valor de
Kakera" por primera vez aparece la flecha ya rotada (apuntando hacia
abajo, coherente con "de mayor a menor"); tocar la flecha la rota a su
orientación natural (apuntando hacia arriba, "de menor a mayor"). Es un
detalle puramente visual sin impacto funcional: la flecha en sí (FR-008)
solo necesita reflejar de forma consistente cuál de los dos estados está
activo, y el toggle en sí sigue disparando `toggleDirection()`
independientemente de la orientación exacta del ícono.

**Alternativas consideradas**:
- Alternar entre dos íconos distintos (`ArrowUp`/`ArrowDown`) en vez de
  rotar uno solo (descartada por preferencia de implementación, no por
  ninguna razón funcional — ambas opciones satisfacen FR-008 igual;
  rotar un solo ícono evita un `if` de import extra y anima mejor la
  transición entre estados).
