# Contrato: UI de servidores (`ServerPickerModal` / `ConfirmDeleteServerDialog` / `ServerList` / `ServerListItem` / `PasteHaremScreen` modificado)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna.

## `PasteHaremScreen` (modificado)

- **Al pegar**: llama a `parseHaremMessage(rawText)` directamente (no a
  ningún método del contexto) para decidir el formato.
- **Formato inválido**: mismo mensaje de error ya existente
  ("No se reconoció el formato..."), sin abrir nada nuevo — **sin
  cambios** de comportamiento observable acá.
- **Formato válido**: en vez de crear el perfil, guarda
  `{ username: parsed.profileName, series: parsed.series }` en estado
  local y monta `<ServerPickerModal>` (FR-001).
- **Al confirmar `ServerPickerModal`** con una elección de servidor:
  llama a `useProfiles().createProfileWithServer(username, series,
  choice)`; si `ok: true`, limpia el estado local y llama a
  `onCreated?.()` (mismo comportamiento que hoy); el caso defensivo
  `SERVER_NOT_FOUND` se trata igual que un error de formato inline
  (rama prácticamente inalcanzable desde el flujo normal, ver
  `contracts/create-profile-with-server.md`).
- **Al cancelar `ServerPickerModal`**: se cierra sin crear nada; el
  usuario vuelve a la zona de pegado (puede volver a pegar sin
  problema).

## `ServerPickerModal`

- **Responsabilidad única**: pedir el servidor (FR-001 a FR-006) y
  permitir eliminar servidores existentes desde ahí mismo (User Story
  2).
- **Props**: `onConfirm: (choice: ServerChoice) => void`,
  `onClose: () => void`.
- **Construido sobre** el `Modal` genérico existente.
- **Contenido**:
  - Un `<input>` de texto, `maxLength={50}` (FR-002), deshabilitado
    (`disabled`, con estilo opaco) cuando hay un servidor existente
    seleccionado (FR-004).
  - Debajo, si `useProfiles().servers` no está vacío: una lista de esos
    servidores, cada uno con un `<input type="radio">` (mismo `name`
    para que sean mutuamente excluyentes, FR-003) y, junto a cada uno,
    un botón "Eliminar" (icono `Trash2`, mismo ícono que
    `ProfileCard`).
  - Un botón de confirmar, deshabilitado hasta que el input de texto
    tenga contenido no vacío O haya un radio seleccionado (FR-005).
- **Al confirmar**: si hay un radio seleccionado, llama a
  `onConfirm({ kind: 'existing-server', serverId })`; si no, y el input
  de texto tiene contenido, llama a
  `onConfirm({ kind: 'new-server', name: texto.trim() })`.
- **Al tocar "Eliminar" en una fila de servidor existente**:
  - Si ese servidor tiene `profileIds.length === 0`: llama a
    `useProfiles().deleteServer(serverId)` de inmediato (FR-016), sin
    ningún diálogo intermedio; si ese servidor estaba seleccionado por
    radio, la selección se limpia (vuelve a habilitarse el input de
    texto).
  - Si tiene `profileIds.length > 0`: monta
    `<ConfirmDeleteServerDialog>` (FR-017) en vez de eliminar
    directamente.

## `ConfirmDeleteServerDialog`

- **Responsabilidad única**: la advertencia de eliminar un servidor con
  perfiles cargados (User Story 2, FR-017/FR-018).
- **Props**: `serverName: string`, `profileAliases: string[]`,
  `onConfirm: () => void`, `onCancel: () => void`.
- **Construido sobre** el `Modal` genérico, con `zIndex.nestedDialog`
  (se abre encima de `ServerPickerModal`, mismo patrón que
  `ConfirmDeleteProfileDialog` encima de `ProfilesModal`).
- **Contenido**: un mensaje que indica la cantidad de perfiles
  (`profileAliases.length`) cargados en `serverName`, seguido de una
  lista de esos nombres (`<ul>` con los `alias`) dentro de un
  contenedor con `max-height: 300px` y `overflow-y: auto` (scroll
  vertical si no entran todos), que ocupa el ancho completo disponible
  del diálogo (FR-018) — y la pregunta de confirmación indicando que se
  eliminarán esos perfiles.
- **Al confirmar**: llama a `onConfirm` (quien la monta —
  `ServerPickerModal` — es quien invoca
  `useProfiles().deleteServer(serverId)` y cierra el diálogo).
- **Al cancelar**: llama a `onCancel`, sin ningún cambio de datos
  (FR-020).

## `ServerList` (reemplaza a `ProfileList` como contenido de `ProfilesModal`)

- **Responsabilidad única**: nivel superior del acordeón (FR-009) — la
  lista de servidores con `profileIds.length > 0` (los vacíos NO
  aparecen acá, FR-014), cada uno como un `ServerListItem`.
- Monta un `DndContext`/`SortableContext` propio sobre los ids de esos
  servidores (mismo patrón de sensores que `ProfileList`/`HaremView`:
  `PointerSensor` + `KeyboardSensor`), llamando a
  `useProfiles().reorderServers(...)` en `onDragEnd` (FR-012, User
  Story 4) vía `computeReorderedIds` (reutilizado sin cambios).
- Sin ningún servidor visible (todos vacíos o no hay ninguno) → mismo
  mensaje `EmptyMessage` ya existente en `ProfileList`, adaptado a
  "Todavía no tenés ningún perfil" (sigue siendo cierto: un servidor
  vacío no cuenta como "tener un perfil").

## `ServerListItem`

- **Responsabilidad única**: una fila de servidor sortable (manija de
  arrastre, mismo patrón que `ProfileListItem`/`SeriesGroupItem`) con
  acordeón (FR-010): el nombre del servidor es clickeable para
  expandir/colapsar; expandido, monta `<ProfileList>` con los perfiles
  de ESE servidor (en el orden de su `profileIds`) y `serverId={server.id}`.
- Más de un `ServerListItem` puede estar expandido a la vez
  (Assumptions de `spec.md`) — el estado de expandido/colapsado es
  local a cada `ServerListItem`, no coordinado entre servidores.

## `ProfileList` (modificado)

- **Cambio de props**: en vez de leer `profiles` directamente de
  `useProfiles()`, recibe `profiles: Profile[]` (ya filtrados/ordenados
  por su `ServerListItem` padre según `server.profileIds`) y
  `serverId: string` por props.
- **Reordenamiento**: su `onDragEnd` ahora llama a
  `useProfiles().reorderProfilesInServer(serverId, orderedIds)` en vez
  del `reorderProfiles` plano eliminado (FR-011, User Story 4) — mismo
  mecanismo de `DndContext`/`computeReorderedIds` sin cambios
  estructurales.
- `ProfileListItem`/`ProfileCard` **no cambian** — siguen recibiendo un
  `Profile` con la misma forma de props que ya consumían (`alias`,
  `harem`, `isActive`, etc.; los campos nuevos `serverId`/`username` no
  se muestran en la UI de la tarjeta).

## Casos borde cubiertos por el contrato

- Un servidor sin perfiles nunca aparece en `ServerList`, pero sigue
  disponible (con opción de eliminar) en `ServerPickerModal` la próxima
  vez que se abra el alta (FR-014, Edge Case de `spec.md`).
- Cancelar `ConfirmDeleteServerDialog` dentro de `ServerPickerModal` no
  cierra `ServerPickerModal` en sí — el usuario puede seguir eligiendo
  otro servidor o escribiendo uno nuevo.
- Viewport móvil (~390px, Principio V): `ServerPickerModal` (radios +
  input + lista con scroll) y el acordeón de dos niveles deben leerse
  completos y ser operables por touch, sin desbordar horizontalmente.

## Testing de este contrato

- `PasteHaremScreen`: pegar un texto válido abre `ServerPickerModal`
  sin haber llamado a ningún método de creación todavía; confirmar el
  modal sí llama a `createProfileWithServer`; cancelar el modal no crea
  nada y permite pegar de nuevo.
- `ServerPickerModal`: input deshabilitado al elegir un radio; botón de
  confirmar deshabilitado sin texto ni radio elegido; eliminar un
  servidor vacío no abre ningún diálogo adicional; eliminar uno con
  perfiles sí abre `ConfirmDeleteServerDialog` con la lista correcta de
  alias.
- `ConfirmDeleteServerDialog`: confirmar elimina servidor + perfiles
  (verificable contra los repositorios de test); cancelar no cambia
  nada.
- `ServerList`/`ServerListItem`: servidores vacíos no se renderizan;
  expandir/colapsar muestra/oculta solo los perfiles de ese servidor;
  más de un servidor puede estar expandido a la vez; arrastrar un
  servidor llama a `reorderServers` con la secuencia esperada.
- `ProfileList` (con las nuevas props): arrastrar un perfil dentro de
  un servidor llama a `reorderProfilesInServer` con el `serverId`
  correcto, sin afectar otro servidor.
