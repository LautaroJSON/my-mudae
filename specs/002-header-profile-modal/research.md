# Research: Header con Modal de Perfiles

**Feature**: `002-header-profile-modal` | **Date**: 2026-09-11

El stack y la arquitectura ya están fijados por la constitución (v1.3.0):
React + TypeScript + Vite, capas `domain/application/infrastructure/
presentation/` + `shared/` para tokens, `styled-components` con
`theme.ts`/`DESIGN.md` como única fuente de estilos, `lucide-react` para
íconos, Context API para estado global. Esta sección cubre las
decisiones específicas de esta feature que no estaban resueltas todavía.

## Decisión: librería de drag-and-drop

- **Decision**: `@dnd-kit/core` + `@dnd-kit/sortable` (+ `@dnd-kit/utilities`
  para los helpers de transform CSS).
- **Rationale**: es la librería de referencia actual para drag-and-drop en
  React — soporta mouse y touch out of the box (`PointerSensor`,
  `TouchSensor`), es accesible (soporta teclado), y está pensada
  específicamente para listas ordenables (`@dnd-kit/sortable`), cumpliendo
  el requisito de Restricciones Técnicas de la constitución ("cualquier
  librería de drag-and-drop DEBE soportar mouse y touch"). El volumen de
  la lista de perfiles (decenas, no cientos) hace que el rendimiento no
  sea un factor decisivo, pero `@dnd-kit` de todos modos solo re-renderiza
  los ítems afectados durante el arrastre.
- **Alternatives considered**: API nativa de HTML5 Drag and Drop — se
  descarta porque no soporta touch sin polyfills adicionales, violando
  directamente el requisito de la constitución. `react-beautiful-dnd` —
  se descarta por estar sin mantenimiento activo. `Sortable.js` /
  `react-sortablejs` — viable, pero es una librería no-React con un
  wrapper más fino y menos flexible que `@dnd-kit` para este caso de uso.

## Decisión: implementación del modal

- **Decision**: un componente `Modal` propio y reutilizable (overlay +
  diálogo centrado, cierre con click afuera / Escape / botón), sin
  librería externa. `ProfilesModal` y `ConfirmDeleteProfileDialog`
  (ya existente) pasan a construirse sobre este mismo `Modal` en vez de
  duplicar el patrón overlay/diálogo cada uno por su lado.
- **Rationale**: ya existe un patrón overlay+diálogo funcionando
  (`ConfirmDeleteProfileDialog` de la feature anterior); generalizarlo
  evita sumar una dependencia nueva solo para volver a implementar algo
  que ya se resolvió una vez (Principio IV, simplicidad), y unifica el
  comportamiento de cierre (Escape, click afuera) en un solo lugar en vez
  de dos.
- **Alternatives considered**: `@radix-ui/react-dialog` — ofrece manejo
  de foco más robusto, pero suma una dependencia nueva para un caso ya
  cubierto por un patrón simple existente; se puede reconsiderar si en el
  futuro se necesitan más modales con requisitos de accesibilidad más
  finos.
- **Nota de apilamiento (z-index)**: con esta feature, `ConfirmDeleteProfileDialog`
  puede abrirse **dentro** de `ProfilesModal` (al eliminar un perfil desde
  la lista del modal) — un modal anidado sobre otro. `theme.zIndex` se
  amplía con un nivel más alto para diálogos anidados, ver `data-model.md`.

## Decisión: ruteo por parámetro `id` en la URL

- **Decision**: sin librería de ruteo (no `react-router`). Se lee
  `window.location.search` con `URLSearchParams` nativo al inicializar
  `ProfilesContext`, una sola vez; "abrir en pestaña nueva" arma la URL
  a mano (`${location.origin}${location.pathname}?id=<id>`) y la abre con
  `window.open(url, '_blank', 'noopener,noreferrer')`.
- **Rationale**: la app sigue siendo de una sola pantalla — no hay rutas
  distintas que navegar, solo un parámetro de consulta que decide qué
  perfil activar al cargar. Sumar `react-router` para esto sería
  contradecir el Principio IV (simplicidad) sin necesidad real.
- **Alternatives considered**: `react-router` con una ruta tipo
  `/?id=:id` — se descarta por ser una dependencia nueva para un caso de
  uso que la API nativa de URL ya cubre por completo.

## Decisión: migración de perfiles existentes (`id` = UUID → `id` = nombre)

- **Decision**: una función pura en `domain/profile/` (sin I/O) que
  recibe los perfiles tal como vienen de `localStorage` y devuelve la
  forma nueva (con `alias`, `id` derivado del nombre original si hacía
  falta, `order` asignado por posición). `LocalStorageProfileRepository.
  getAll()` la aplica de forma transparente y, si hubo cambios, vuelve a
  guardar inmediatamente — así la migración corre una sola vez en la
  práctica, sin que `application/`/`presentation/` necesiten saber que
  existió.
- **Rationale**: mantiene la regla de disambiguación (agregar sufijo
  numérico si dos perfiles migran al mismo `id`) testeable de forma
  aislada como función pura, cumpliendo el aislamiento de `domain/` de la
  constitución, mientras que el "cuándo correr la migración" es un
  detalle de `infrastructure/` (dónde vive hoy el dato viejo).
- **Alternatives considered**: migrar en un script aparte ejecutado
  manualmente — se descarta porque no hay forma de pedirle al usuario que
  corra un script; la migración tiene que ser transparente al cargar la
  app.

## Decisión: identidad de personaje para sincronizar un harem (FR-015b)

- **Decision**: el claim rank (`#N`, ya siempre presente en un personaje
  parseado — ver `parseHaremMessage`) es la clave de identidad entre dos
  pegados del mismo perfil. La reconciliación (`domain/harem/syncHarem.ts`)
  recibe el `Harem` actual + los `ParsedSeries[]` recién parseados y
  devuelve el `Harem` resultante: personajes con claim rank ya presente
  se actualizan (conservando su `id` interno, para no romper la
  animación de entrada de tarjetas que no cambiaron), personajes con
  claim rank nuevo se agregan (con `id` nuevo), personajes cuyo claim
  rank ya no aparece se eliminan (y sus series vacías con ellos, FR-022
  de la feature anterior).
- **Rationale**: es el único dato de Mudae que identifica una copia
  puntual de un personaje reclamado (dos copias del mismo personaje
  tienen claim ranks distintos, algo que la feature anterior ya
  documentó como válido); conservar el `id` interno de los personajes
  que no cambiaron evita que `CharacterCard` los re-anime como si fueran
  nuevos en cada sincronización (Principio III, evitar re-renders/trabajo
  innecesario).
- **Alternatives considered**: identificar por nombre + serie — se
  descarta porque no distingue entre dos copias del mismo personaje
  (caso ya contemplado como válido en la feature anterior).

## Decisión: recalcular cantidad de personajes y valor total del harem

- **Decision**: dos funciones puras en `domain/harem/Harem.ts`:
  `countCharacters(harem)` y `sumKakera(harem)` (suma de `kakera ?? 0`
  de todos los personajes de todas las series). Se llaman directamente
  desde `ProfileCard` a partir de `profile.harem`, sin persistir estos
  valores ni pasar por el `ParsedHaremMessage`.
- **Rationale**: son datos derivados de información que ya se guarda;
  persistirlos aparte los desincronizaría del harem real apenas se
  edite/elimine un personaje (mismo espíritu que el Principio II de la
  constitución: una sola fuente de verdad). Nunca se confía en la línea
  "Total value" del texto pegado (ya descartada como ruido desde la
  feature anterior).
- **Alternatives considered**: guardar `characterCount`/`totalKakera` en
  el propio `Profile` al crear/sincronizar — se descarta por el riesgo de
  desincronización mencionado arriba.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el Technical
Context del plan.
