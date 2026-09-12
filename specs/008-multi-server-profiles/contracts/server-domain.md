# Contrato: funciones puras de `domain/server/Server.ts`

**Módulo**: `domain/server/Server.ts` — funciones puras de `domain/`
(sin React/`styled-components`/`localStorage`), mismo estilo tolerante
ya usado por `domain/profile/Profile.ts` y `domain/harem/Harem.ts`.

## `addProfileToServer(servers, serverId, profileId): Server[]`

- **Postcondición**: el servidor con `id === serverId` gana `profileId`
  al final de su `profileIds` (si no lo tenía ya — agregar un id ya
  presente no lo duplica). Ningún otro servidor cambia.
- **Caso borde**: `serverId` inexistente → devuelve `servers` sin
  cambios (no lanza, no crea nada).

## `removeProfileFromServer(servers, serverId, profileId): Server[]`

- **Postcondición**: el servidor con `id === serverId` pierde
  `profileId` de su `profileIds`. El servidor persiste igual aunque
  quede con `profileIds: []` (FR-014 — a diferencia de
  `removeCharacterFromSeries`, acá NO se elimina el grupo vacío).
- **Caso borde**: `serverId` o `profileId` inexistentes → sin cambios.

## `removeServer(servers, serverId): Server[]`

- **Postcondición**: el servidor desaparece de `Server[]`. No toca
  `Profile[]` — la eliminación en cascada de sus perfiles es
  responsabilidad del caso de uso `deleteServer`, no de esta función.
- **Caso borde**: `serverId` inexistente → devuelve `servers` sin
  cambios.

## `reorderServers(servers, orderedIds): Server[]`

- **Postcondición**: idéntico contrato que `reorderProfiles` de `001`/
  `002` (`specs/002-header-profile-modal/contracts/...`, mismo
  algoritmo): ids desconocidos en `orderedIds` se ignoran; servidores
  cuyo id no está en `orderedIds` quedan al final, en su orden relativo
  anterior. Nunca pierde servidores, nunca lanza.

## `reorderProfilesInServer(servers, serverId, orderedProfileIds): Server[]`

- **Postcondición**: mismo algoritmo tolerante, aplicado únicamente al
  `profileIds` del servidor indicado — ningún otro servidor cambia
  (mismo aislamiento que ya garantiza `reorderCharactersInSeries` de
  `003` entre series).
- **Caso borde**: `serverId` inexistente → devuelve `servers` sin
  cambios.

## `pickNextActiveProfileId(servers, profiles): string | undefined`

- **Precondición**: se invoca con el estado YA actualizado (después de
  quitar el perfil que se está eliminando tanto de `profiles` como de
  `Server.profileIds`).
- **Postcondición**: recorre `servers` en su propio orden de array;
  dentro del primer servidor cuyo `profileIds` tenga al menos un id que
  siga existiendo en `profiles`, devuelve el primero de esos ids (en el
  orden de `profileIds` de ese servidor). Si ningún servidor tiene
  ningún perfil restante, devuelve `undefined`.
- **Caso borde**: `servers`/`profiles` vacíos → `undefined`.

## Testing de este contrato

- `addProfileToServer`/`removeProfileFromServer`: agregar y quitar en
  un servidor de 2+ perfiles sin afectar otro servidor del mismo array;
  agregar un id ya presente no lo duplica; ids/servidores inexistentes
  no lanzan.
- `removeServer`: elimina el servidor indicado sin tocar `Profile[]`
  (verificable pasando un `Profile[]` de prueba y comprobando que la
  función ni siquiera lo recibe como parámetro); servidor inexistente no
  lanza.
- `reorderServers`/`reorderProfilesInServer`: casos de reordenamiento
  parcial/con ids desconocidos, análogos a los ya existentes para
  `reorderProfiles`/`reorderCharactersInSeries`.
- `pickNextActiveProfileId`: con 2+ servidores y perfiles repartidos,
  eliminar el primer servidor completo (sin perfiles restantes) y
  verificar que devuelve el primer perfil del segundo servidor; con
  todos los servidores vacíos, devuelve `undefined`.
