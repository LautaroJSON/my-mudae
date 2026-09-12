# Research: Comando de Orden de Harem para Discord

**Feature**: `009-discord-sort-command` | **Fecha**: 2026-09-12

No quedaron `[NEEDS CLARIFICATION]` en `spec.md` (todas las decisiones se
resolvieron con defaults razonables documentados en su sección
`Assumptions`). Este documento registra las decisiones **técnicas**
tomadas para el diseño (Fase 1), con sus alternativas descartadas.

## 1. Formato exacto del comando generado

**Decisión**: `formatSortCommand(harem: Harem): string | null` vive en
`domain/parsing/formatSortCommand.ts`, análoga a
`formatHaremMessage.ts` (004). Aplana `harem.series` en orden con
`flatMap`, tomando `character.name` de cada personaje de cada serie en
su orden actual, y devuelve:

- `null` si no hay ningún personaje (harem vacío o sin series) — nunca
  un string vacío ni `"$sm"` solo, para que el caller pueda distinguir
  "nada para copiar" sin parsear el resultado (FR-008).
- `` `$sm ${nombres.join(' $ ')}` `` en cualquier otro caso, donde
  `nombres` son los `character.name` en orden.

**Rationale**: mismo patrón de "función pura de dominio, tipo de
retorno explícito para el caso vacío" que ya usa el resto de
`domain/parsing/` y `domain/harem/` (ej. `sumKakera` devuelve `0` en vez
de lanzar; acá se prefiere `null` sobre `0`/`''` porque un string vacío
seguiría siendo "verdadero" en algunos checks y podría copiarse por
error).

**Alternativas consideradas**:
- Reutilizar `formatHaremMessage` y parsear/derivar el comando a partir
  de su salida — rechazado: acopla un formato de texto a otro sin
  necesidad, y complica mantener Principio II si algún día cambia el
  formato de `formatHaremMessage`.
- Incluir `claimRank`/kakera en el comando (como hace
  `formatHaremMessage`) — rechazado: el ejemplo del usuario y el
  propósito del comando `$sm` de Mudae son solo nombres; agregar más
  datos no pedidos violaría el principio de no generar comandos
  inválidos para el bot.
- Devolver `''` en vez de `null` para el caso vacío — rechazado: `null`
  hace el caso "nada para copiar" explícito en el tipo, evitando que un
  consumidor futuro trate `''` como "comando válido pero vacío".

## 2. Fuente de verdad del orden (Principio II)

**Decisión**: `formatSortCommand` recibe el `Harem` tal cual vive en
`activeProfile.harem` (el mismo objeto que consume `HaremView` /
`SeriesGroup` para renderizar, y que `reorderSeries` /
`reorderCharactersInSeries` de `domain/harem/Harem.ts` ya mutan de forma
inmutable en cada reordenamiento). `SortCommandBar` llama a
`useProfiles()` y recalcula el texto en cada render mientras está
montada — no cachea el resultado en un `useMemo` con dependencias que
puedan desincronizarse, ni lo copia a un estado local propio.

**Rationale**: es exactamente el mismo mecanismo que ya usa
`ShareHaremButton` con `formatHaremMessage(activeProfile)`. Cumple
directamente el Principio II ("el generador de comando DEBE derivarse
directamente del mismo estado ordenado que renderiza la lista").

**Alternativas consideradas**: memoizar el texto con `useMemo(() =>
formatSortCommand(harem), [harem])` — aceptable como optimización
(evita recomputar en renders no relacionados) siempre que la dependencia
sea el objeto `harem` completo (no un snapshot tomado al abrir la
barra); se deja como detalle de implementación en `tasks.md`, no cambia
el contrato.

## 3. Animación de aparición/ocultamiento bidireccional

**Decisión**: `SortCommandBar` se monta **siempre** en el DOM (no
condicionalmente por `isOpen`), y su visibilidad/posición se controla
100% por CSS a través de una prop transitoria `$isOpen` en
`styled-components`:

- Oculta: `transform: translateY(100%); opacity: 0; visibility: hidden;
  pointer-events: none;`
- Visible: `transform: translateY(0); opacity: 1; visibility: visible;
  pointer-events: auto;`
- `transition: transform theme.motion.duration.base theme.motion.easing,
  opacity theme.motion.duration.base theme.motion.easing, visibility 0s
  linear theme.motion.duration.base` (delay de `visibility` a `hidden`
  hasta que termine la transición de salida, para no cortar la
  animación a mitad de camino ni dejar el panel interactuable mientras
  está visualmente afuera).

**Rationale**: es el único mecanismo que permite una animación suave
**en ambos sentidos** (mostrar y ocultar) pedida explícitamente por el
usuario, sin depender de una librería de animación (Principio IV). El
precedente existente en el código (`fadeInUp` con `@keyframes` en
`CharacterCard`) solo anima la entrada al montar — no sirve para un
panel que se abre y cierra repetidamente, porque un `keyframes`/`animation`
no se re-dispara al alternar una clase sin remover y volver a montar el
nodo. El precedente de `ThemeMenuItem` (acordeón) monta/desmonta
condicionalmente sin ninguna transición — tampoco sirve como base
porque el pedido explícito es que **ambas** direcciones se vean suaves.

**Alternativas consideradas**:
- Montar/desmontar condicionalmente (`{isOpen && <SortCommandBar />}`,
  patrón ya usado por `SettingsMenu`) — rechazado: al desmontar
  inmediatamente no hay forma de animar la salida con CSS puro (el nodo
  desaparece del DOM antes de que la transición corra).
- Animar con `max-height` en vez de `transform`/`opacity` — rechazado:
  `max-height` con un valor fijo arbitrario puede recortar el contenido
  si el comando ocupa más de una línea en pantallas muy angostas, y la
  transición de `max-height` no es tan uniforme visualmente como
  `transform` (no es realmente "abajo hacia arriba", es un recorte).
- Agregar una librería de animación (`framer-motion`, etc.) — rechazado
  directamente por Principio IV (no se justifica una dependencia nueva
  para una transición CSS estándar).

## 4. Ubicación del ícono de flecha y de la barra

**Decisión**: `SortCommandToggle` se monta como hermano de
`<SettingsFab />` en `App.tsx` (mismo nivel, fuera de cualquier
condicional de perfil/vista, igual criterio de visibilidad permanente).
Se posiciona `fixed`, mismo `bottom` que `SettingsFab`, inmediatamente a
su izquierda (`right: calc(<ancho FAB> + <spacing.sm> + <spacing.lg>)`).
`SortCommandBar` se posiciona `fixed` por encima de la fila de botones
(`bottom` calculado a partir de la altura del botón + separación),
`left`/`right` con el mismo gutter lateral (`spacing.lg`) que el resto
de overlays de la app, para que la franja se lea ancha (como en el
mockup) sin tocar los bordes de la pantalla.

**Rationale**: el pedido explícito fue "un ícono de flecha al lado del
floatbutton" — se interpreta "floatbutton" como el `SettingsFab` ya
existente (única referencia previa a un botón flotante en el código y
en specs anteriores). Montarlo como hermano (no anidado dentro de
`SettingsFab`/`SettingsMenu`) preserva la Assumption de `spec.md` de "sin
modificar el comportamiento de ese botón ni de su propio menú".

**Alternativas consideradas**: integrar la flecha como una opción más
dentro de `SettingsMenu` (junto a "Temas") — rechazado explícitamente
por el pedido del usuario, que describe un ícono de flecha **al lado**
del botón flotante, no una opción dentro de su menú desplegable; además
la barra resultante (ancha, tipo franja inferior) no encaja en el
formato de lista vertical de `SettingsMenu`.

## 5. Feedback de copiado y fallback manual (Principio VI)

**Decisión**: `CopyCommandButton` reutiliza exactamente el mismo
camino ya construido por `ShareHaremButton` (004):
`copyTextToClipboard(text)` (2 niveles programáticos, contrato ya
probado) → si devuelve `false`, abre `<ManualCopyDialog text={text}
onConfirm={...} onClose={...} />` como 3er nivel (selección manual). El
feedback de éxito/error se muestra en el propio botón (cambio de
ícono/label + color, mismo patrón visual que `RoundIconButton` de
`ShareHaremButton`), no un `Toast` aparte.

**Rationale**: no hay ninguna razón para inventar un segundo mecanismo
de fallback cuando ya existe uno probado y contractualmente
especificado (`contracts/copy-to-clipboard.md` de 004); reutilizarlo
mantiene una sola UX de "qué pasa si falla el copiado" en toda la app.

**Alternativas consideradas**: dado que el comando ya está visible en
un campo de texto dentro de la propia `SortCommandBar` (a diferencia de
`ShareHaremButton`, que no muestra el texto en ningún lado hasta que
falla), se evaluó omitir `ManualCopyDialog` y en su lugar simplemente
enfocar+seleccionar ese campo cuando la copia programática falla —
descartado por consistencia: mezclar dos UX distintas de fallback
manual en la misma app (una con diálogo modal, otra con foco directo)
sería más confuso que reutilizar el patrón ya establecido, y el costo de
reutilizar `ManualCopyDialog` tal cual es cero (cero código nuevo).

## 6. Rendimiento con harems grandes (Principio III)

**Decisión**: no se requiere ninguna estrategia de
memoización/virtualización más allá de un `flatMap` `O(n)` sobre
`harem.series` para `formatSortCommand`, y de mantener
`SortCommandToggle`/`SortCommandBar`/`CopyCommandButton` como
componentes hermanos de `HaremView` (nunca ancestros ni envoltorios de
él), de forma que abrir/cerrar la barra o recalcular el comando nunca
dispare un re-render del árbol de `dnd-kit`.

**Rationale**: el Principio III apunta al *reordenamiento* (drag & drop)
de listas grandes, no a serializar una lista ya en memoria a texto; un
`flatMap` sobre 200+ personajes es trabajo trivial (microsegundos) y no
requiere virtualización porque no se renderiza ningún ítem de lista
nuevo — solo un único nodo de texto.

**Alternativas consideradas**: ninguna — no hay compromiso de
performance real que resolver acá; se documenta la ausencia de
estrategia especial para dejar explícito que se evaluó contra el
Principio III y no aplica.
