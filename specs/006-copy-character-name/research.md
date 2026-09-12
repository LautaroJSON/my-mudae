# Research: Copiar Nombre de Personaje al Pasar el Mouse

**Feature**: `006-copy-character-name` | **Date**: 2026-09-12

El stack, la arquitectura y el patrón de copiado al portapapeles ya
están fijados (constitución v1.3.0, `004`). Esta sección cubre
únicamente las decisiones nuevas de esta feature.

## Decisión: cómo evitar que el botón dispare un reordenamiento accidental — detener la propagación de `pointerdown`, sin sensor personalizado

- **Contexto del riesgo**: `CharacterListItem` (`003`) pone
  `{...attributes} {...listeners}` de `useSortable` sobre el `<div>`
  `Item` que envuelve **toda** la `CharacterCard` — es decir, hoy toda
  la tarjeta es la superficie de arrastre, sin manija dedicada (a
  propósito, según el comentario de ese componente: "CharacterCard no
  tiene ningún control interactivo propio"). Esta feature introduce el
  primer control interactivo real dentro de la tarjeta, así que ese
  supuesto deja de cumplirse y hay que resolver la ambigüedad
  explícitamente (FR-006, Acceptance Scenario 6 de `spec.md`).
- **Decision**: `CopyNameButton` detiene la propagación del evento
  nativo en su propio `onPointerDown` (`event.stopPropagation()`), y
  defensivamente también en `onClick`. Como `@dnd-kit`'s `PointerSensor`
  activa el seguimiento de un posible arrastre exclusivamente a partir
  del `onPointerDown` que `useSortable` expone vía `listeners` (spreado
  sobre `Item`, el ancestro), detener la propagación de ese evento desde
  el botón hace que ese `onPointerDown` de `Item` nunca se dispare para
  ese gesto — `@dnd-kit` nunca empieza a trackear un posible arrastre
  originado en el botón. El evento `click` del botón (que se dispara por
  separado, después de `pointerup`) no se ve afectado y sigue
  funcionando con normalidad.
- **Rationale**: es la solución de menor superficie posible: no requiere
  tocar `SeriesGroup.tsx` (el `DndContext`/sensores existentes quedan
  intactos), no requiere una subclase de `PointerSensor` con lógica de
  exclusión por selector (el patrón "Ignoring certain elements" que
  documenta `@dnd-kit` para este mismo problema), y no cambia el
  comportamiento de arrastre en **ningún** otro punto de la tarjeta —
  cumple al pie de la letra el Acceptance Scenario 5 y el SC-003 de
  `spec.md` ("sigue funcionando exactamente igual que antes"), ya que
  ninguna configuración compartida (sensor, `activationConstraint`) se
  toca.
- **Alternatives considered**:
  - Agregar `activationConstraint: { distance: N }` al `PointerSensor`
    de `SeriesGroup` — descartado porque cambiaría el comportamiento de
    arrastre en **toda** la tarjeta (hoy sin ningún umbral de distancia,
    activación inmediata a propósito, según el comentario de `003`:
    "toda la tarjeta puede ser la superficie de arrastre sin
    ambigüedad"), violando la letra de SC-003 aunque el cambio fuera
    sutil.
  - Subclasificar `PointerSensor` con un `activator` personalizado que
    excluya elementos marcados con un atributo (`data-no-dnd`) — es el
    patrón oficial de `@dnd-kit` para este problema, pero requiere un
    archivo nuevo y modificar `SeriesGroup` para usar el sensor
    personalizado; se descarta por ser más código para el mismo
    resultado que ya logra `stopPropagation()` sin tocar `SeriesGroup`
    en absoluto.
  - Marcar el botón con `data-no-dnd` sin cambiar el sensor (dejando la
    exclusión sin efecto) — se descarta: sin un sensor que efectivamente
    lea ese atributo, no cambia nada por sí solo.

## Decisión: revelado del botón — CSS puro, sin detección de dispositivo por JS

- **Decision**: `CopyNameButton` nace con `opacity: 0` (además de
  `pointer-events: none` mientras está oculto, para que un click "a
  ciegas" en esa esquina no lo active por accidente) dentro de una regla
  `@media (hover: hover) and (pointer: fine)`; en esa misma media query,
  `Card:hover [data-copy-name-button], Card:focus-within
  [data-copy-name-button]` (regla agregada al `Card` de `CharacterCard`)
  sube su opacidad a `1` y le devuelve `pointer-events: auto`. **Fuera**
  de esa media query (dispositivos sin hover real, típicamente táctiles)
  el botón queda con su opacidad/`pointer-events` por defecto
  (visible y clickeable) sin ninguna condición adicional.
- **Rationale**: `(hover: hover) and (pointer: fine)` es la forma
  estándar de detectar "este dispositivo tiene un puntero que puede
  posicionarse sin tocar la pantalla" (mouse/trackpad) sin JavaScript ni
  ninguna librería — cumple el Assumption de `spec.md` ("el icono se
  muestra disponible sin depender de [hover] en dispositivos táctiles")
  con cero código de detección de dispositivo, consistente con el
  Principio IV (simplicidad del stack). Es el mismo tipo de técnica
  CSS-only que ya usa la app para temas claro/oscuro
  (`@media (prefers-color-scheme: dark)` en `theme.ts`/`GlobalStyle`).
- **Alternatives considered**: mostrar el botón siempre (sin
  ocultarlo en hover) — se descarta porque el pedido original del
  usuario es explícito ("al pasar el mouse... debe aparecer"), y
  mostrarlo siempre en desktop agregaría ruido visual permanente a cada
  tarjeta de un harem de 200+ personajes. Detectar touch vía JS
  (`'ontouchstart' in window` o similar) — se descarta por ser menos
  confiable que la media query nativa (falsos positivos en laptops
  táctiles con mouse conectado) y por introducir lógica de JS donde el
  CSS ya resuelve el caso limpiamente.

## Decisión: dónde vive el nuevo componente y qué reutiliza de `004`

- **Decision**: `presentation/components/CopyNameButton/{index.tsx,styles.tsx}`,
  montado como hijo de `Card` dentro de `CharacterCard`. Reutiliza, sin
  ninguna modificación: `copyToClipboard` (`presentation/copyToClipboard.ts`),
  `Toast` y `ManualCopyDialog` (`presentation/components/Toast`,
  `presentation/components/ManualCopyDialog`, ambos de `004`). El flujo
  interno es idéntico al de `ShareHaremButton` (`004`): intentar
  `copyToClipboard(character.name)` → éxito muestra `Toast` `success` →
  fallo abre `ManualCopyDialog` con el nombre para copiado manual
  (Principio VI), sin un paso de "generación de texto" propio (a
  diferencia de `ShareHaremButton`, acá no hace falta serializar nada:
  el texto a copiar ya es directamente `character.name`).
- **Rationale**: es exactamente el mismo problema de "copiar un string
  al portapapeles con feedback y fallback" que `004` ya resolvió y
  probó; reutilizar esos tres componentes sin cambios evita duplicar la
  lógica de fallback de portapapeles por segunda vez en la misma app
  (Principio IV) y mantiene un único lenguaje visual de feedback en toda
  la aplicación (mismo `Toast`, mismo `ManualCopyDialog`).
- **Alternatives considered**: ninguna — no hay una alternativa de
  diseño razonable que no sea reutilizar el mecanismo ya probado y
  conforme al Principio VI.

## Decisión: `CharacterCard` gana `position: relative` y una regla de revelado, sin más cambios estructurales

- **Decision**: `CharacterCard/styles.tsx`'s `Card` agrega
  `position: relative` (para poder posicionar el botón en absoluto
  dentro de ella) y la regla CSS de revelado por hover/foco descrita
  arriba, referenciando al botón por un atributo `data-copy-name-button`
  (no por un import cruzado del styled-component de `CopyNameButton`,
  para no romper la convención de que cada carpeta de componente sea
  autocontenida — mismo criterio que ya documentó `research.md` de
  `005` para no compartir un `RoundIconButton` entre carpetas).
  `CharacterCard/index.tsx` monta `<CopyNameButton characterName={character.name} />`
  como único hijo nuevo; el resto de su estructura (imagen, nombre,
  kakera, claim rank) no cambia.
- **Rationale**: es el cambio mínimo necesario para que el nuevo botón
  pueda posicionarse sobre la tarjeta y reaccionar al hover/foco de esa
  tarjeta específica — `position: relative` en el contenedor y una regla
  de selector por atributo son técnicas CSS estándar, sin acoplar los
  archivos de estilos de ambos componentes entre sí.
- **Alternatives considered**: envolver `CharacterCard` en un nuevo
  componente contenedor externo que agregue el `position: relative` y el
  botón desde afuera (sin tocar `CharacterCard` en sí) — se descarta por
  agregar una capa de indirección/otro archivo sin necesidad real:
  `CharacterCard` ya es el componente dueño de la tarjeta visual, y
  agregarle un hijo más + una regla de estilo es un cambio pequeño y
  localizado, no una responsabilidad nueva que amerite extraerla a otro
  componente.

## Decisión: rendimiento con harems de 200+ personajes (Principio III)

- **Decision**: no se agrega ninguna suscripción a estado ni efecto de
  React para controlar la visibilidad del botón (es 100% CSS); el único
  estado de React que introduce `CopyNameButton` (visibilidad del
  `Toast`/`ManualCopyDialog`) vive local a esa instancia y solo se activa
  cuando el usuario efectivamente hace click, así que no afecta el
  render de las demás tarjetas. Se extiende
  `tests/component/presentation/HaremView.performance.test.tsx` (de
  `003`) para confirmar que un harem de 200+ personajes con
  `CopyNameButton` en cada tarjeta sigue renderizando sin errores y en
  tiempo acotado.
- **Rationale**: mismo criterio ya validado en `003`/`004`: revelar UI
  por CSS puro no tiene el costo de un listener de JS por elemento
  (`mouseenter`/`mouseleave` manuales), y el estado de feedback de cada
  botón es local, no compartido — coherente con que `CharacterCard` siga
  memoizado sin cambiar su estrategia de memoización.
- **Alternatives considered**: controlar la visibilidad con
  `onMouseEnter`/`onMouseLeave` + estado de React en cada
  `CharacterCard` — se descarta por agregar 200+ listeners/estados de JS
  para un efecto que CSS resuelve nativamente sin ningún costo de
  render adicional.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.

## Addendum (post-implementación, pedido en una sesión posterior): feedback de "copiado" en el propio icono, sin `Toast`

Mismo pedido y mismo mecanismo documentado en el Addendum de
`004/research.md` (que también aplica acá, ya que `CopyNameButton` es el
otro icono de "copiar" de la app): `CopyNameButton` deja de montar
`<Toast>`; en su lugar, un estado local `feedback: 'idle' | 'success'`
hace que el propio `RoundIconButton` cambie a relleno
`theme.colors.accent` + icono `Check` (en vez de `Copy`) por `2500ms`
tras copiar con éxito (o confirmar `ManualCopyDialog`), con
`theme.colors.onAccent` (nuevo token, ver `004/research.md`) como color
del icono. `CopyNameButton` no tiene un estado `'error'` propio (mismo
motivo ya documentado en `data-model.md`: no hay ningún paso de
generación de texto que pueda fallar antes de copiar, así que el único
"fallo" posible ya lo cubre `ManualCopyDialog`).

**Ajuste adicional necesario, propio de este componente**: a diferencia
de `ShareHaremButton` (icono del header, siempre visible),
`CopyNameButton` normalmente se oculta (`opacity: 0`) cuando el mouse
deja la tarjeta (revelado por `Card:hover`/`:focus-within`, ver decisión
de revelado más arriba). Sin un ajuste, el checkmark de éxito
desaparecería de inmediato si el usuario aleja el mouse justo después de
tocar el botón, antes de que el feedback llegue a verse. Se resolvió
haciendo que la propia regla de opacidad de `RoundIconButton` (dentro de
`@media (hover: hover) and (pointer: fine)`) dependa también de
`$feedback`: visible mientras `$feedback === 'success'`, sin importar el
estado de hover/foco de la tarjeta en ese momento. La regla de revelado
por hover que vive en `CharacterCard`'s `Card` (selector por atributo,
mayor especificidad) sigue funcionando igual para el caso normal
(mostrar mientras el mouse está encima); ambas reglas conviven sin
conflicto porque cubren circunstancias distintas (hover activo vs.
feedback en curso).

**Impacto en artefactos ya escritos**: `contracts/copy-name-button-ui.md`
queda desactualizado en su descripción de "muestra `Toast` de éxito" —
ahora es "el propio icono muestra el feedback"; no se reescribe acá por
el mismo motivo que en `004`: el comportamiento observable relevante no
cambió, solo el mecanismo de presentación.
