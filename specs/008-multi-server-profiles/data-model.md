# Data Model: Servidores Múltiples por Usuario (Reestructura de Perfiles)

**Feature**: `008-multi-server-profiles` | **Date**: 2026-09-12

## Nuevo: `Server` (`domain/server/Server.ts`)

```ts
export interface Server {
  id: string          // UUID, estable de por vida
  name: string        // hasta 50 caracteres (validado en la UI del alta, FR-002)
  profileIds: string[] // orden = orden de perfiles dentro del servidor (FR-011)
}
```

- El orden de `Server[]` (dondequiera que se persista/lea la colección
  completa) es el orden de los servidores entre sí (FR-012) — no hay un
  campo `order` separado, mismo criterio que `Harem.series`.
- `profileIds` puede estar vacío (`[]`) — un servidor sin perfiles sigue
  existiendo (FR-014), no se elimina automáticamente.

### Funciones puras nuevas de `domain/server/Server.ts`

```ts
function addProfileToServer(servers: Server[], serverId: string, profileId: string): Server[]
```
Agrega `profileId` al final de `profileIds` del servidor indicado. No
falla si `serverId` no existe (devuelve `servers` sin cambios).

```ts
function removeProfileFromServer(servers: Server[], serverId: string, profileId: string): Server[]
```
Quita `profileId` de `profileIds` del servidor indicado, si está. El
servidor persiste igual aunque quede con `profileIds: []` (FR-014).

```ts
function removeServer(servers: Server[], serverId: string): Server[]
```
Quita el servidor indicado de `Server[]` por completo. No toca
`Profile[]` — quien orquesta la eliminación en cascada de sus perfiles
es el caso de uso `deleteServer` (application/), no esta función.

```ts
function reorderServers(servers: Server[], orderedIds: string[]): Server[]
```
Reordena `Server[]` — mismo algoritmo tolerante que `reorderProfiles`
de `001`/`002` (ids desconocidos se ignoran, ids ausentes quedan al
final en su orden relativo anterior).

```ts
function reorderProfilesInServer(servers: Server[], serverId: string, orderedProfileIds: string[]): Server[]
```
Reordena `profileIds` de un único servidor — mismo algoritmo tolerante
que `reorderCharactersInSeries` de `003` (no afecta a ningún otro
servidor).

```ts
function pickNextActiveProfileId(servers: Server[], profiles: Profile[]): string | undefined
```
Recorre `servers` en su propio orden; dentro del primero cuyo
`profileIds` tenga al menos un id presente en `profiles`, devuelve el
primero de esos ids (en el orden de `profileIds` de ese servidor).
`undefined` si no queda ningún perfil en ningún servidor. Ver
`research.md` ("`removeProfile` se simplifica...").

## Modificado: `Profile` (`domain/profile/Profile.ts`)

```ts
export interface Profile {
  id: string          // UUID, estable de por vida (YA NO es el nombre de usuario, ver research.md)
  serverId: string    // NUEVO — a qué servidor pertenece; fijo desde la creación
  username: string    // NUEVO — nombre extraído del pegado ("<username>'s harem"), inmutable; usado para crear-vs-sincronizar y para detectar discordancias en "actualizar harem"
  alias: string        // sin cambios de forma — nombre visible/editable, igual a `username` al crear
  isActive: boolean    // sin cambios
  harem: Harem          // sin cambios
  createdAt: string     // sin cambios
  // order: ELIMINADO — el orden ahora lo da Server.profileIds
}
```

**Invariante**: `profile.serverId` siempre corresponde a un `Server`
existente cuyo `profileIds` incluye `profile.id` — mantenida por
construcción en los casos de uso que mutan ambas colecciones juntas
(`createProfileWithServer`, `deleteProfile`, `deleteServer`), nunca
verificada en runtime.

### Funciones de `Profile.ts` — cambios

- `activateOnlyProfile`, `deactivateAllProfiles`, `renameProfile`: **sin
  cambios** (operan solo sobre campos que no cambiaron de forma).
- `removeProfile(profiles, profileId): Profile[]`: **simplificada** —
  ahora solo filtra el perfil indicado. Ya no intenta elegir un
  reemplazo activo (esa decisión se movió al caso de uso `deleteProfile`,
  que sí tiene acceso a `Server[]` para usar `pickNextActiveProfileId`).
- `reorderProfiles`: **eliminada** — reemplazada por
  `reorderProfilesInServer` de `domain/server/Server.ts`.

## Nuevo: `ServerRepository` (`application/ports/ServerRepository.ts`)

```ts
export interface ServerRepository {
  getAll(): Server[]   // nunca lanza; [] si no hay nada persistido
  save(servers: Server[]): void
}
```

Implementación `infrastructure/storage/LocalStorageServerRepository.ts`
bajo la clave `mymudae:serverList` — mismo patrón defensivo (try/catch
silencioso) que `LocalStorageProfileRepository`.

## Casos de uso — firmas nuevas/modificadas

```ts
type ServerChoice = { kind: 'new-server'; name: string } | { kind: 'existing-server'; serverId: string }

type CreateProfileWithServerResult =
  | { ok: true; mode: 'created' | 'synced' }
  | { ok: false; reason: 'SERVER_NOT_FOUND' } // defensivo: el serverId elegido ya no existe (ver contracts/)

function createProfileWithServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  parsedUsername: string,
  parsedSeries: ParsedSeries[],
  serverChoice: ServerChoice,
): CreateProfileWithServerResult
```
Reemplaza a `createProfileFromPaste` — recibe el pegado YA parseado
(FR-001, ver research.md "flujo en dos pasos"), no el texto crudo.

```ts
type DeleteServerResult = { ok: true; deletedProfileCount: number }

function deleteServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  serverId: string,
): DeleteServerResult
```
Elimina el servidor y, en cascada, todos los perfiles cuyo `serverId`
coincida (FR-019). Si el perfil activo estaba entre los eliminados,
activa el que indique `pickNextActiveProfileId` sobre el estado ya
actualizado.

```ts
function deleteProfile(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository, // NUEVO parámetro
  profileId: string,
): void
```
Ahora también quita `profileId` de `Server.profileIds` (vía
`removeProfileFromServer`) y, si era el activo, usa
`pickNextActiveProfileId` para decidir el reemplazo.

```ts
function reorderServers(serverRepository: ServerRepository, orderedIds: string[]): void
function reorderProfilesInServer(serverRepository: ServerRepository, serverId: string, orderedProfileIds: string[]): void
```
Casos de uso finos, mismo patrón que `reorderProfiles`/
`reorderCharactersInSeries` ya existentes — leen, aplican la función de
dominio correspondiente, guardan.

```ts
function updateActiveProfileHarem(
  profileRepository: ProfileRepository,
  activeProfileId: string,
  rawText: string,
): UpdateActiveProfileHaremResult
```
Firma **sin cambios**; cambia la comparación interna de
`parsed.profileName !== activeProfileId` a
`parsed.profileName !== target.username` (con `target` resuelto por
`id` antes de comparar) — ver research.md.

## `ProfilesContext` (`presentation/context/ProfilesContext.tsx`) — forma expuesta

```ts
interface IProfilesContext {
  servers: Server[]              // NUEVO, en su propio orden de array
  profiles: Profile[]            // ya no se ordena por `order` (no existe); el orden de despliegue lo decide ServerList a partir de servers
  activeProfile: Profile | undefined
  urlProfileStatus: UrlProfileStatus

  createProfileWithServer: (parsedUsername: string, parsedSeries: ParsedSeries[], choice: ServerChoice) => CreateProfileWithServerResult // NUEVO, reemplaza createProfileFromPaste
  deleteServer: (serverId: string) => void        // NUEVO
  reorderServers: (orderedServerIds: string[]) => void // NUEVO
  reorderProfilesInServer: (serverId: string, orderedProfileIds: string[]) => void // NUEVO, reemplaza reorderProfiles

  renameProfile: (profileId: string, alias: string) => void          // sin cambios
  deleteProfile: (profileId: string) => void                          // misma firma externa; internamente ahora también toca servers
  activateProfile: (profileId: string) => void                        // sin cambios
  reorderCharactersInSeries: (seriesId: string, orderedCharacterIds: string[]) => void // sin cambios
  reorderSeries: (orderedSeriesIds: string[]) => void                  // sin cambios
  updateActiveProfileHarem: (rawText: string) => UpdateActiveProfileHaremResult // sin cambios de firma
}
```

`ProfilesProvider` pasa a inyectar **dos** repositorios (`profileRepository`,
`serverRepository`), ambos con default a su implementación de
`localStorage` y ambos inyectables para tests (mismo patrón ya usado
para `repository` hoy).
