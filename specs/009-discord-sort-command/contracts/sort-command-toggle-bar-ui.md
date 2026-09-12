# Contrato: UI de la barra de comando (`SortCommandToggle` / `SortCommandBar`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna. El botón de copiar
(`CopyCommandButton`) tiene su propio contrato en
`copy-command-button-ui.md`.

## `SortCommandToggle`

- **Responsabilidad única**: el ícono de flecha (FR-001) y si la barra
  está oculta o visible (`isOpen`).
- **Siempre visible**: `position: fixed`, mismo `bottom` que
  `SettingsFab`, inmediatamente a su izquierda; montado en `App.tsx`
  como hermano de `<SettingsFab />`, fuera de cualquier condicional de
  perfil/vista (mismo criterio que `SettingsFab`: presente en el estado
  vacío, con harem cargado, y en "perfil no encontrado").
- **No** modifica ni depende del estado interno de `SettingsFab`/
  `SettingsMenu` — son hermanos independientes (Assumption de
  `spec.md`).
- **Icono**: `ChevronUp` de `lucide-react` cuando `isOpen === false`
  (indica "al presionar, se abre hacia arriba"), `ChevronDown` cuando
  `isOpen === true` (indica "al presionar, se cierra") — FR-010.
- **Al activarse** (click/tap/Enter con foco): alterna `isOpen`
  (FR-002). Siempre monta `<SortCommandBar isOpen={isOpen} />` como
  hijo/hermano — nunca la desmonta condicionalmente (ver
  `research.md` §3, necesario para poder animar el cierre).
- **Cierre por click afuera / Escape**: mismo patrón ya implementado por
  `SettingsFab` (listener de `pointerdown`/`keydown` a nivel de
  documento mientras `isOpen === true`, comparando contra un
  `wrapperRef` que engloba el ícono y la barra desplegada) — cierra
  (`isOpen = false`) sin aplicar ningún cambio adicional.
- **Accesibilidad**: `aria-label="Mostrar comando de orden"` (o
  equivalente, cambiando a `"Ocultar comando de orden"` cuando
  `isOpen === true`), `aria-expanded` reflejando `isOpen`, operable por
  teclado (Enter/Space).

## `SortCommandBar`

- **Responsabilidad única**: el panel deslizable (FR-002, FR-003) y el
  campo de texto de solo lectura con el comando generado. **No** decide
  por sí sola cuándo abrirse/cerrarse (lo controla `isOpen`, prop
  recibida de `SortCommandToggle`) ni gestiona el copiado (delegado a
  `CopyCommandButton`).
- **Props**: `isOpen: boolean`.
- **Siempre montada** en el DOM mientras `SortCommandToggle` está
  montado (independientemente de `isOpen`); la visibilidad/posición se
  controla 100% por CSS vía una prop transitoria `$isOpen` (ver
  `research.md` §3):
  - `isOpen === false`: `transform: translateY(100%)`, `opacity: 0`,
    `visibility: hidden` (tras la transición), `pointer-events: none`
    — no interactuable ni alcanzable por teclado mientras está oculta.
  - `isOpen === true`: `transform: translateY(0)`, `opacity: 1`,
    `visibility: visible`, `pointer-events: auto`.
  - Transición: `transform`/`opacity` con
    `theme.motion.duration.base` + `theme.motion.easing`, en **ambos**
    sentidos (FR-003) — nunca aparición/desaparición instantánea.
- **Contenido**:
  1. Un campo de texto de solo lectura (`<input readOnly>` o
     `<textarea readOnly>` de una sola línea) con el valor de
     `formatSortCommand(activeProfile.harem)` cuando no es `null`; con
     scroll horizontal si el contenido excede el ancho disponible
     (edge case de `spec.md` en mobile), sin romper el layout de la
     barra ni tapar `CopyCommandButton`.
  2. Cuando `activeProfile` no existe o `formatSortCommand(...)`
     devuelve `null` (harem vacío): el campo se reemplaza por (o
     muestra) un mensaje de estado vacío ("No hay personajes para
     ordenar" o equivalente) — nunca un comando `"$sm"` sin nombres
     (FR-008).
  3. `<CopyCommandButton text={comando} />` (ver su propio contrato),
     recibiendo `null` en el mismo caso de harem vacío, para que nazca
     deshabilitado.
- **Recalcula el comando en cada render** mientras está montada,
  leyendo `activeProfile.harem` de `useProfiles()` directamente (nunca
  un snapshot tomado al abrirse) — así un reordenamiento o cambio de
  perfil con la barra abierta se refleja de inmediato (FR-009).
- **Al cambiar `activeProfile`** con la barra abierta: el campo de
  texto se actualiza al nuevo harem sin necesidad de cerrar y volver a
  abrir la barra.

## Casos borde cubiertos por el contrato

- Sin perfil activo o harem vacío al momento de abrir la barra por
  primera vez → nace mostrando el estado vacío, sin que el usuario
  tenga que intentar copiar primero para enterarse (FR-008).
- El usuario presiona el ícono de flecha varias veces seguidas muy
  rápido → cada toggle interrumpe la transición en curso limpiamente
  (CSS `transition` sobre las mismas propiedades no deja estados
  intermedios rotos); no se apilan animaciones ni el panel queda a
  medio camino de forma permanente (FR/Edge case de Historia 2).
- Viewport angosto (~390px, Principio V): la barra no debe forzar
  scroll horizontal de toda la página — solo el campo de texto interno
  puede scrollear; el botón "Copiar Comando" permanece siempre visible
  y alcanzable (no se corta fuera de la pantalla).
- El usuario reordena personajes (drag & drop de `003`) con la barra
  abierta → el texto se actualiza sin cerrar la barra.

## Testing de este contrato

- `SortCommandBar` con `isOpen={false}` → no interactuable
  (`pointer-events: none` efectivo, o el campo/botón no reciben foco
  por tab) y visualmente fuera de posición (`translateY(100%)`/
  `opacity: 0` en el snapshot de estilos).
- Alternar `isOpen` a `true` → el campo de texto muestra
  `formatSortCommand(activeProfile.harem)` exacto (comparación de
  string completo, no parcial).
- Sin perfil activo / harem vacío → se muestra el mensaje de estado
  vacío en vez del campo de texto, y `CopyCommandButton` recibe
  `text={null}` (deshabilitado).
- Reordenar personajes (invocar el mismo use case que usa `003`) con la
  barra ya abierta → el texto mostrado cambia sin necesidad de
  re-abrir.
- El ícono de `SortCommandToggle` alterna entre `ChevronUp`/
  `ChevronDown` según `isOpen`, y su `aria-expanded` coincide.
- Cerrar con Escape o click afuera del `wrapperRef` cierra la barra
  (`isOpen` vuelve a `false`) sin cambiar el contenido del harem.
