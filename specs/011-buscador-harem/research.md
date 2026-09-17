# Research: Buscador de Personajes y Series en el Harem

**Feature**: `011-buscador-harem`

No queda ningún `NEEDS CLARIFICATION` en el Technical Context de
`plan.md` — el stack es el mismo fijo de la constitución y todas las
decisiones técnicas nuevas se resuelven abajo.

## 1. Dónde vive el estado del buscador: Context nuevo, no `useState` local

**Decisión**: Estado nuevo (`isOpen`, `query`) en un contexto de React
dedicado, `HaremSearchContext`, montado en `App.tsx` al mismo nivel que
`HaremSortContext` — no un `useState` local dentro de `HaremSearchButton`.

**Rationale**: `HaremSearchButton` vive dentro de `HeaderActions`
(hijo de `Header`) y quien debe aplicar el filtro es `HaremView` — ambos
son hermanos dentro de `AppContent`, sin relación padre/hijo directa. El
mismo problema estructural ya lo resolvió `010` con `HaremSortContext`
para el estado de ordenamiento temporal; replicar ese patrón exacto
(incluyendo el reset derivado durante el render al cambiar de perfil,
FR-010) evita reinventar un mecanismo distinto para un problema idéntico.

**Alternativas consideradas**:
- *Levantar el estado a `App.tsx` y pasarlo por props*: requeriría
  perforar `Header` → `HeaderActions` y `AppContent` → `HaremView` con
  props que no les interesan a esos componentes intermedios. Rechazada
  por ensuciar interfaces de componentes que no tienen nada que ver con
  la búsqueda.
- *`useState` local en `HaremSearchButton` + un evento custom del DOM
  para avisarle a `HaremView`*: más código y menos idiomático que
  Context API para este mismo proyecto (Principio IV: Context API es el
  estándar ya establecido).

## 2. Algoritmo de filtrado: función pura en `domain/harem/Harem.ts`, con preservación de referencia

**Decisión**: `filterHaremByQuery(harem: Harem, query: string): Harem`,
colocada junto a `sortHaremByKakera` en `domain/harem/Harem.ts`. Usa un
helper privado `normalizeSearchText` (lowercase + `NFD` + remoción de
diacríticos + trim) para comparar tanto el texto ingresado como
`series.name`/`character.name`, con coincidencia por subcadena
(`String.prototype.includes`).

Para no invalidar la memoización de `SeriesGroup` (`memo`, Principio III)
más de lo estrictamente necesario: una serie que coincide por **título**
se agrega al resultado con la **misma referencia** de objeto `Series`
que traía (no se reconstruye `characters`); solo se construye un objeto
`Series` nuevo para las series cuyo subconjunto de personajes
coincidentes por **nombre** cambia. Esto significa que, tecleando
"konosuba" letra por letra, la serie "Konosuba" (que matchea por título
desde la primera letra en común) mantiene la misma referencia entre
renders sucesivos y `SeriesGroup` no vuelve a renderizarse para ella,
mientras que las series que están agregando/quitando personajes
coincidentes sí lo hacen (correcto, porque su contenido visible
realmente cambió).

**Rationale**: es la misma clase de problema que resolvió
`sortHaremByKakera` (función pura, sin mutar la entrada, en `domain/`
para poder testearla sin React), pero el filtrado por búsqueda no
persigue reordenar, sino ocultar — por eso el helper de comparación
(`normalizeSearchText`) es nuevo y no reutiliza `normalizeUsername`
(`domain/profile/username.ts`): ese helper existe para comparar
*igualdad exacta* de nombres de usuario de Discord (limpia caracteres
invisibles/espacios, pero no remueve diacríticos porque un username no
suele tenerlos con variación) y su contrato es distinto al de esta
feature (coincidencia *parcial*, con acentos ignorados, sobre nombres de
personajes/series que sí llevan tildes con frecuencia).

**Alternativas consideradas**:
- *Reutilizar `normalizeUsername`*: rechazada — no remueve diacríticos y
  su nombre/JSDoc documentan un contrato de igualdad para usernames, no
  de búsqueda parcial para contenido del harem; forzarlo a este uso
  mezclaría dos responsabilidades bajo el mismo nombre.
- *Fuzzy matching (Levenshtein, librería tipo `fuse.js`)*: rechazada — no
  hay ningún requerimiento de tolerancia a errores de tipeo en la spec
  (solo subcadena exacta, case/accent-insensitive), y agregaría una
  dependencia nueva sin necesidad (Principio IV).
- *Reconstruir siempre un objeto `Series` nuevo (sin preservar
  referencia)*: más simple de escribir, pero renderiza de nuevo TODAS
  las series coincidentes en cada tecla, no solo las que cambiaron de
  contenido — se descartó apenas se vio que el costo de preservar
  referencia es una sola comparación `if` adicional por serie.

## 3. Reutilizar `dragDisabled` en vez de agregar un prop nuevo

**Decisión**: en `HaremView`, la condición que ya existe para
`dragDisabled` (`isActive` del ordenamiento temporal por kakera, `010`)
se extiende a `isActive || isSearching`, donde `isSearching =
query.trim().length > 0`. No se agrega ningún prop nuevo a
`SeriesGroupItem`/`SeriesGroup`/`CharacterListItem` — ya aceptan
`dragDisabled` y no les importa *por qué* está deshabilitado.

**Rationale**: arrastrar una serie o un personaje mientras se ve una
vista parcial (filtrada) del harem operaría sobre
`reorderSeries`/`reorderCharactersInSeries` con una lista de ids
incompleta. Aunque esas funciones son tolerantes (los ids ausentes
quedan al final en su orden relativo anterior, ver `Harem.ts`), el
resultado percibido por el usuario sería un reordenamiento manual real y
persistido, disparado sin que el usuario pueda ver ni controlar dónde
quedan los elementos ocultos — un efecto secundario sorprendente que
además podría violar en la práctica FR-012 ("la búsqueda no debe alterar
el orden manual"). Deshabilitar el drag mientras hay una búsqueda activa
es la misma estrategia ya validada por `010` para el mismo tipo de
riesgo (vista temporal ≠ vista arrastrable).

**Alternativas consideradas**:
- *Dejar el drag habilitado, confiando en la tolerancia de
  `reorderSeries`/`reorderCharactersInSeries`*: rechazada — aunque no
  rompe ni corrompe datos, sí produce un reordenamiento persistido real
  a partir de una interacción sobre una vista parcial, que un usuario
  razonablemente no esperaría que tocara su orden manual "de verdad".

## 4. Animación de apertura/cierre: transición CSS de `width`, sin librería

**Decisión**: un `styled.div` (`Field`) con `width` fijo en 2.25rem
cuando está cerrado y `min(theme.layout.searchFieldWidth, 45vw)` cuando
está abierto, con `transition: width ...` usando
`theme.motion.duration.base` + `theme.motion.easing` (mismos tokens que
el resto de la app, Motion = 5/10 "Fluid CSS" de `DESIGN.md` §6). Se
agrega un token nuevo `layout.searchFieldWidth: '12rem'` a
`shared/theme.ts` (y su justificación a `DESIGN.md`) en vez de
hardcodear el ancho dentro del componente.

**Rationale**: `theme.layout` ya existe como el lugar para anchos
reutilizables (`containerNarrow`, `containerWide`, `dialogWidth`) —
agregar uno para este campo sigue la regla de la constitución de que
"agregar o cambiar un token es una edición a `DESIGN.md` + `theme.ts`,
no una decisión ad hoc dentro de un componente". El `min(…, 45vw)` es
necesario porque `HeaderActions` vive dentro de `RightGroup`, que
también contiene el botón de perfil (`ProfileButton`, hasta 12rem) — sin
un techo relativo al viewport, un campo de 12rem fijo podría desbordar
`Bar` en pantallas angostas (~360-390px) y forzar scroll horizontal,
violando el Principio V. `prefers-reduced-motion` ya está resuelto de
forma global (`GlobalStyle.tsx`), así que este componente no necesita su
propio guardrail de accesibilidad para la animación.

**Alternativas consideradas**:
- *Librería de animación (Framer Motion, react-spring)*: rechazada sin
  dudarlo — viola Principio IV (no agregar dependencias sin necesidad
  real) para una transición de `width` que CSS resuelve solo.
- *Ancho expandido fijo en rem, sin `vw`*: más simple, pero falla el
  Principio V en viewports angostos (ver Rationale) — descartada tras
  revisar el layout real de `Header`/`RightGroup`.

## 5. Sin cierre por click-afuera/Escape: solo el ícono es el toggle

**Decisión**: a diferencia de `HaremSortButton` (que cierra su panel con
click afuera o Escape, `010`), `HaremSearchButton` **no** implementa
ningún cierre implícito — la única forma de cerrar el buscador (y
disparar la limpieza de `query`, FR-009) es presionar el ícono de nuevo.

**Rationale**: la spec (`spec.md`, User Story 2) es explícita: "el icono
funciona como un toogle para expandir o cerrar este buscador" — no
menciona ningún otro gesto de cierre. Agregar cierre por click-afuera
implicaría también disparar la limpieza del texto ingresado en
situaciones que el usuario no pidió (por ejemplo, al hacer click en un
personaje de la lista filtrada para alguna acción futura), lo cual
contradice el comportamiento pedido explícitamente y agregaría alcance
no solicitado.

**Alternativas consideradas**:
- *Mismo patrón que `HaremSortButton` (click afuera + Escape)*:
  rechazada — el análogo más cercano existente hace algo distinto a
  propósito (cierra un panel de opciones que no tiene "contenido que se
  pierda"), mientras que acá cerrar implícitamente borra el texto que el
  usuario escribió, un costo que la spec no pidió asumir.

## 6. Estado "sin resultados": reutilizar `EmptyMessage`, no un componente nuevo

**Decisión**: el estado de "no se encontraron resultados" (FR-008)
reutiliza el `EmptyMessage` ya existente en `HaremView/styles.tsx` (hoy
usado para "Este perfil todavía no tiene personajes"), con un texto
distinto que incluye el término buscado.

**Rationale**: es una sola línea de texto secundario, mismo rol visual
que el mensaje de harem vacío ya existente — introducir un componente
`styles.tsx` nuevo solo para cambiar el copy sería una abstracción sin
necesidad real (regla del proyecto de no agregar abstracciones para
casos que un componente ya cubre).
