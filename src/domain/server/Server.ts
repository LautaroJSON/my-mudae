import type { Profile } from '../profile/Profile'

/**
 * Agrupador de nivel superior de la feature 008: cada perfil pertenece a
 * exactamente un `Server`. `profileIds` da tanto la membresía como el
 * orden de los perfiles dentro de ese servidor (no hay un campo `order`
 * separado, mismo criterio que `Harem.series`/`Series.characters` de
 * `003`). Puede quedar vacío (`[]`): un servidor sin perfiles sigue
 * existiendo, persistido y elegible/eliminable desde el pedido de
 * servidor del alta (FR-014).
 */
export interface Server {
  id: string
  name: string
  profileIds: string[]
}

/**
 * Agrega `profileId` al final de `profileIds` del servidor indicado, si
 * no lo tenía ya (no lo duplica). No falla ni cambia nada si `serverId`
 * no corresponde a ningún servidor.
 */
export function addProfileToServer(servers: Server[], serverId: string, profileId: string): Server[] {
  return servers.map((server) => {
    if (server.id !== serverId || server.profileIds.includes(profileId)) {
      return server
    }
    return { ...server, profileIds: [...server.profileIds, profileId] }
  })
}

/**
 * Quita `profileId` de `profileIds` del servidor indicado. El servidor
 * persiste igual aunque quede con `profileIds: []` (FR-014) — a
 * diferencia de `removeCharacterFromSeries`, acá nunca se elimina el
 * grupo vacío.
 */
export function removeProfileFromServer(servers: Server[], serverId: string, profileId: string): Server[] {
  return servers.map((server) =>
    server.id === serverId
      ? { ...server, profileIds: server.profileIds.filter((id) => id !== profileId) }
      : server,
  )
}

/**
 * Elimina el servidor indicado de `Server[]` por completo. No toca
 * `Profile[]` — la eliminación en cascada de sus perfiles es
 * responsabilidad del caso de uso `deleteServer` (application/), no de
 * esta función.
 */
export function removeServer(servers: Server[], serverId: string): Server[] {
  return servers.filter((server) => server.id !== serverId)
}

/**
 * Reordena `Server[]` según `orderedIds` (User Story 4, FR-012). Mismo
 * algoritmo tolerante que `reorderProfiles`/`reorderCharactersInSeries`:
 * ids desconocidos se ignoran, servidores ausentes de la lista quedan al
 * final en su orden relativo anterior. Nunca pierde servidores, nunca
 * lanza.
 */
export function reorderServers(servers: Server[], orderedIds: string[]): Server[] {
  const knownIds = new Set(servers.map((server) => server.id))
  const requestedKnown = orderedIds.filter((id) => knownIds.has(id))
  const requestedSet = new Set(requestedKnown)

  const missing = servers.filter((server) => !requestedSet.has(server.id)).map((server) => server.id)

  const finalSequence = [...requestedKnown, ...missing]
  const serversById = new Map(servers.map((server) => [server.id, server]))

  return finalSequence.map((id) => serversById.get(id)!)
}

/**
 * Reordena `profileIds` de UN solo servidor (User Story 4, FR-011).
 * Mismo algoritmo tolerante que `reorderCharactersInSeries` — no afecta
 * a ningún otro servidor. Si `serverId` no corresponde a ningún
 * servidor, devuelve `servers` sin cambios.
 */
export function reorderProfilesInServer(servers: Server[], serverId: string, orderedProfileIds: string[]): Server[] {
  return servers.map((server) => {
    if (server.id !== serverId) {
      return server
    }

    const knownIds = new Set(server.profileIds)
    const requestedKnown = orderedProfileIds.filter((id) => knownIds.has(id))
    const requestedSet = new Set(requestedKnown)
    const missing = server.profileIds.filter((id) => !requestedSet.has(id))

    return { ...server, profileIds: [...requestedKnown, ...missing] }
  })
}

/**
 * Decide a quién activar tras eliminar un perfil (usado por los casos de
 * uso `deleteProfile`/`deleteServer`, que se invocan con el estado YA
 * actualizado). Recorre `servers` en su propio orden; dentro del primero
 * que todavía tenga algún `profileId` presente en `profiles`, devuelve
 * el primero de esos ids (en el orden de `profileIds` de ese servidor).
 * `undefined` si no queda ningún perfil en ningún servidor.
 */
export function pickNextActiveProfileId(servers: Server[], profiles: Profile[]): string | undefined {
  const existingIds = new Set(profiles.map((profile) => profile.id))

  for (const server of servers) {
    const nextId = server.profileIds.find((id) => existingIds.has(id))
    if (nextId) {
      return nextId
    }
  }

  return undefined
}
