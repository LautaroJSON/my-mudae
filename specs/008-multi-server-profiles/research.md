# Research: Servidores Múltiples por Usuario (Reestructura de Perfiles)

**Feature**: `008-multi-server-profiles` | **Date**: 2026-09-12

## Decisión: identidad de perfil — `id` (UUID interno) + `serverId` + `username`, en vez de `id = nombre de usuario`

- **Contexto del problema**: desde `002`, `Profile.id` es literalmente el
  nombre de usuario extraído del pegado (fijo de por vida, único
  globalmente) — es lo que decide si un segundo pegado crea un perfil
  nuevo o sincroniza uno existente, y es el valor que viaja en la URL
  `?id=`. Con esta feature, el mismo nombre de usuario puede tener un
  perfil independiente en cada servidor (FR-007) — si `id` siguiera
  siendo solo el nombre de usuario, dos perfiles del mismo usuario en
  servidores distintos colisionarían en el mismo `id`, rompiendo la
  unicidad que el resto de la app ya asume (React keys, `?id=`,
  búsquedas por `id`).
- **Decision**: `Profile` gana dos campos nuevos y pierde uno:
  - `id: string` — vuelve a ser un UUID generado (`crypto.randomUUID()`),
    igual que en `001`, antes de que `002` lo derivara del nombre de
    usuario. Estable de por vida, sin relación con el nombre de usuario.
  - `serverId: string` — a qué servidor pertenece; se fija al crear el
    perfil y nunca cambia (un perfil no puede "moverse" de servidor en
    esta iteración).
  - `username: string` — el nombre extraído del encabezado del pegado
    (`"<username>'s harem"`), inmutable, usado únicamente para decidir
    crear-vs-sincronizar (`createProfileWithServer`) y para detectar
    discordancias en "actualizar harem" (`updateActiveProfileHarem`,
    `005`). Reemplaza el rol que `id` cumplía antes en esos dos casos de
    uso.
  - `alias: string` seguidor existiendo sin cambios (nombre visible y
    editable, igual a `username` al crearse).
  - `order: number` se elimina (ver próxima decisión).
- **Impacto en "crear o sincronizar"** (`createProfileWithServer`, antes
  `createProfileFromPaste`): la coincidencia pasa de `profile.id ===
  parsed.profileName` a `profile.serverId === targetServerId &&
  profile.username === parsed.profileName` — dos perfiles con el mismo
  `username` en servidores distintos nunca coinciden entre sí (FR-007).
- **Impacto en "actualizar harem"** (`updateActiveProfileHarem`, `005`):
  la comparación pasa de `parsed.profileName !== activeProfileId` a
  `parsed.profileName !== target.username` (con `target` ya resuelto
  por `id`). Como `target.serverId` es fijo y nunca proviene del texto
  pegado (el mensaje de Mudae no menciona el servidor de Discord en
  ningún lado), no hace falta ninguna comparación de servidor aparte:
  comparar contra `target.username` ya captura exactamente "¿este
  pegado es de la misma cuenta de Mudae que este perfil, en este mismo
  servidor?", que es lo que pide FR-008 — el servidor ya quedó fijado
  al elegir qué perfil actualizar, no se vuelve a inferir del pegado.
- **Impacto en `?id=` (deep link, `002`)**: ninguno — `id` sigue siendo
  un string opaco desde la perspectiva de `urlParams.ts`; que ahora sea
  un UUID en vez de un nombre de usuario no cambia ninguna lógica ahí.
- **Alternatives considered**:
  - Componer `id` como `` `${serverId}::${username}` `` (string
    compuesto) en vez de un UUID + campos separados — se descarta por
    ser más frágil (parseo de string para extraer el servidor en
    `updateActiveProfileHarem`) sin ningún beneficio real, ya que de
    todas formas hace falta guardar `username` aparte para el `alias`
    inicial y para el propio pegado; un campo explícito `serverId` es
    más directo de leer/testear que desarmar un string.
  - Mantener `id = username` y resolver duplicados con algún sufijo de
    desambiguación (como ya hace `migrateLegacyProfiles` para nombres
    repetidos) — se descarta porque el propio propósito de esta feature
    es que el mismo nombre de usuario sea completamente independiente
    por servidor, no "el mismo nombre con un sufijo distinto".

## Decisión: orden de perfiles — el array `Server.profileIds`, no un campo `Profile.order`

- **Decision**: se elimina `Profile.order`. El orden de los perfiles
  dentro de un servidor lo da directamente la posición de sus ids en
  `Server.profileIds: string[]` — el mismo criterio que ya usan
  `Harem.series` y `Series.characters` (el orden del array es la fuente
  de verdad, sin un campo numérico redundante), documentado y elegido a
  propósito en `003/research.md` por esta misma razón.
- **Rationale**: antes de esta feature, `Profile[]` era una colección
  plana sin ningún array "padre" natural, así que un campo `order`
  numérico era la única forma de expresar su orden. Ahora que cada
  perfil pertenece a un `Server`, ese servidor SÍ es el array padre
  natural — mantener `order` en paralelo sería una segunda fuente de
  verdad redundante (el mismo problema que `003/research.md` ya
  evaluó y descartó para personajes/series).
- **Reordenar perfiles dentro de un servidor** (`reorderProfilesInServer`,
  User Story 4): reordena `profileIds` del servidor indicado —mismo
  algoritmo tolerante que ya usan `reorderCharactersInSeries`/
  `reorderProfiles` (ids desconocidos se ignoran, ids faltantes quedan
  al final en su orden relativo anterior).
- **Reordenar servidores entre sí** (`reorderServers`, User Story 4):
  reordena el array `Server[]` completo — mismo algoritmo tolerante,
  aplicado a los ids de servidor en vez de perfiles.

## Decisión: `Server` es una colección nueva y separada (`ServerRepository`), no embebida en `Profile`

- **Decision**: `Server[]` se persiste en su propia clave de
  `localStorage` (`mymudae:serverList`) a través de un `ServerRepository`
  nuevo (mismo contrato "leer todo/guardar todo" que `ProfileRepository`),
  con su implementación `LocalStorageServerRepository` (mismo patrón
  defensivo: nunca lanza, `[]` si no hay nada persistido, catch
  silencioso en fallas de `localStorage`/JSON corrupto).
- **Rationale**: `Server` tiene su propio ciclo de vida (se crea, se
  elimina, se reordena) independiente de cualquier `Profile` puntual —
  un servidor puede existir sin ningún perfil (FR-014). Modelarlo como
  una colección de nivel superior aparte, con su propio repositorio, es
  el mismo patrón ya usado para `Profile[]` — no una capa nueva de
  complejidad, sino la aplicación consistente del patrón existente a
  una segunda colección persistida (Principio IV).
- **Invariante mantenida por construcción** (no por validación en
  runtime): `profile.serverId` siempre corresponde a un `Server` cuyo
  `profileIds` incluye `profile.id`. Los casos de uso (`createProfileWithServer`,
  `deleteProfile`, `deleteServer`) son los únicos puntos que mutan
  ambas colecciones, y siempre las actualizan juntas en la misma
  operación — nunca queda un estado a medio actualizar entre ellas.
- **Alternatives considered**: embeber la lista de perfiles completa
  dentro de cada `Server` (`Server.profiles: Profile[]` en vez de
  `Server.profileIds: string[]` + `Profile[]` aparte) — se descarta
  porque duplicaría dónde vive el harem de cada perfil (¿dentro del
  servidor, o en la colección plana ya existente?) sin necesidad; el
  pedido original del usuario ya describe exactamente el diseño elegido
  ("cada server tiene además una key con el array de ID de usuarios de
  ese servidor").

## Decisión: servidor vacío persiste, no aparece en la lista de perfiles, sí en el alta (FR-014)

- **Decision**: a diferencia de `Series`/`removeCharacterFromSeries`
  (`001`), donde una serie sin personajes se elimina automáticamente,
  un `Server` sin perfiles **no** se borra solo — queda en
  `Server[]` tal cual, y la única diferencia visual es que `ServerList`
  (la vista de la lista de perfiles) filtra los servidores con
  `profileIds.length === 0` antes de renderizar, mientras que
  `ServerPickerModal` (el pedido de servidor del alta) los sigue
  mostrando todos, sin filtrar.
- **Rationale**: aclaración explícita del usuario tras la primera
  versión de esta spec (que asumía el criterio de "grupo vacío
  desaparece" por defecto, análogo a `Series`) — un servidor vacío
  sigue siendo útil como "casillero" reutilizable para dar de alta el
  próximo perfil de ese servidor, y solo se elimina explícitamente
  (User Story 2), no como efecto colateral de borrar su último perfil.
- **Alternatives considered**: ninguna — es una corrección directa
  sobre una suposición inicial equivocada, ya validada por el usuario.

## Decisión: eliminar servidor — sin confirmación si está vacío, con advertencia + lista si tiene perfiles (User Story 2)

- **Decision**: `deleteServer(serverId)` (caso de uso nuevo) siempre
  elimina el servidor Y todos los perfiles que tuviera asociados
  (cascada, FR-019) — la diferencia de UX es **antes** de invocarlo:
  - Servidor con `profileIds.length === 0`: `ServerPickerModal` llama a
    `deleteServer` directamente al tocar "Eliminar" en esa fila, sin
    ningún diálogo intermedio (FR-016).
  - Servidor con `profileIds.length > 0`: `ServerPickerModal` abre
    `ConfirmDeleteServerDialog` (construido sobre el `Modal` genérico
    con `zIndex.nestedDialog`, mismo patrón que
    `ConfirmDeleteProfileDialog`) mostrando la cantidad y una lista con
    el `alias` de cada perfil afectado, con `max-height: 300px` y
    `overflow-y: auto` (scroll si no entran) ocupando el ancho completo
    del diálogo (FR-017/FR-018) — recién al confirmar ahí se llama a
    `deleteServer`.
- **Rationale**: es exactamente el comportamiento pedido por el usuario,
  y reutiliza el patrón ya establecido de `ConfirmDeleteProfileDialog`
  (modal de confirmación construido sobre `Modal`, con
  `zIndex.nestedDialog` porque se abre encima de `ServerPickerModal`)
  en vez de inventar un mecanismo de confirmación nuevo.
- **Cómo se calcula la lista de perfiles a mostrar**: `profiles.filter(p
  => p.serverId === serverId).map(p => p.alias)` — no hace falta leer
  `Server.profileIds` para esto, ya que `Profile.serverId` da la
  relación directamente (ver decisión de identidad, arriba).

## Decisión: `removeProfile` se simplifica; la reactivación tras eliminar se resuelve en el caso de uso, considerando el orden de servidores

- **Decision**: `domain/profile/Profile.ts`'s `removeProfile` se
  simplifica a solo filtrar el perfil eliminado (ya no intenta elegir
  un reemplazo activo por sí sola, porque ya no tiene un campo `order`
  propio con el que decidir "el siguiente"). Se agrega una función pura
  nueva en `domain/server/Server.ts`:
  ```ts
  function pickNextActiveProfileId(servers: Server[], profiles: Profile[]): string | undefined
  ```
  que recorre los servidores en su propio orden de array, y dentro del
  primero que todavía tenga algún `profileId` presente en `profiles`,
  devuelve el primero de esos ids (en el orden de `profileIds` de ese
  servidor). El caso de uso `deleteProfile` (application/) es quien
  orquesta: lee ambas colecciones, quita el perfil de `Profile[]` y de
  `Server.profileIds`, y si el eliminado era el activo, llama a
  `pickNextActiveProfileId` sobre el estado ya actualizado para decidir
  a quién activar (o a nadie, si no queda ningún perfil).
- **Rationale**: la elección de "cuál es el próximo perfil activo" ahora
  depende de DOS colecciones (dónde vive el orden real es `Server.
  profileIds`, no `Profile` en sí), así que ya no puede resolverse
  dentro de una función que solo recibe `Profile[]` — se traslada esa
  decisión a donde ya se coordinan ambas colecciones (el caso de uso),
  reutilizando una función pura nueva para el cálculo en sí (sigue
  siendo domain/, sin I/O, solo que ahora toma dos colecciones como
  entrada en vez de una).
- **Alternatives considered**: mantener la lógica de reactivación
  dentro de `removeProfile` pasándole también `Server[]` como
  parámetro — se descarta por mezclar la responsabilidad de "filtrar un
  perfil de una lista" con "decidir el próximo activo considerando
  servidores", cuando separarlas en dos funciones puras pequeñas
  (Principio VII aplicado también a funciones de dominio, no solo a
  componentes) deja cada una más fácil de testear de forma aislada.

## Decisión: se elimina `migrateLegacyProfiles` (shim de migración 001→002)

- **Decision**: se borra `domain/profile/migrateLegacyProfiles.ts`, su
  contrato, sus tests, y la llamada a esa función dentro de
  `LocalStorageProfileRepository.getAll()`.
- **Rationale**: el usuario confirmó explícitamente que no hay
  perfiles/servidores reales que preservar ("no hay usuarios previos").
  Esa función migraba perfiles con la forma de `001` (sin `alias`/
  `order`) a la forma de `002` — con el shape de `Profile` cambiando de
  nuevo en esta feature (nuevo `id` UUID, `+serverId`, `+username`,
  `-order`), esa función ya no produce un resultado compatible con el
  tipo `Profile` actual de todas formas, y mantenerla viva sin ningún
  dato real que necesite pasar por ahí sería código muerto que además
  quedaría desactualizado respecto del tipo vigente — exactamente el
  tipo de "compatibilidad hacia atrás sin necesidad real" que las
  instrucciones de este proyecto piden evitar.
- **Alternatives considered**: dejarla intacta pero sin usarla — se
  descarta porque quedaría código y tests sin ningún llamador real,
  además de referenciar un shape de `Profile` (`alias`/`order` como los
  únicos campos "nuevos") que ya no reflejaría la realidad del tipo
  actual.

## Decisión: flujo de alta en dos pasos — validar pegado (sin persistir) → elegir servidor → recién ahí crear

- **Decision**: `PasteHaremScreen` deja de llamar a un caso de uso que
  parsea-y-persiste en un solo paso. En su lugar:
  1. Al pegar, llama directamente a `parseHaremMessage(rawText)` (función
     pura de `domain/`, sin pasar por `ProfilesContext` — mismo criterio
     ya usado por `ProfileCard` al llamar a `countCharacters`/`sumKakera`
     directamente) para decidir si el formato es válido.
  2. Si no es válido: mismo mensaje de error ya existente, sin abrir
     nada nuevo (comportamiento sin cambios).
  3. Si es válido: guarda el resultado parseado (`profileName` +
     `series`) en estado local de React y abre `ServerPickerModal`, sin
     persistir nada todavía.
  4. `ServerPickerModal`, al confirmarse con una elección de servidor
     (nuevo o existente), es quien recién ahí llama a
     `useProfiles().createProfileWithServer(...)`, que persiste el
     perfil y actualiza `Server[]` en una sola operación.
- **Rationale**: es exactamente el flujo pedido ("si el formato está
  bien, se abre un nuevo modal preguntando el nombre del servidor...
  una vez cargado"). Separar "parsear" de "persistir" en dos pasos es
  necesario porque ahora hay una decisión del usuario (el servidor) en
  el medio que puede tardar o cancelarse, y no tiene sentido haber
  creado ya el perfil antes de saber a qué servidor va.
- **Alternatives considered**: seguir teniendo un único caso de uso que
  reciba `rawText` + la elección de servidor juntos, parseando adentro
  — se descarta porque obligaría a volver a pegar el texto si el
  usuario cancela el pedido de servidor (en vez de solo cerrar ese
  modal y mantener el texto ya parseado disponible para reintentar).

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.
