import { removeProfile } from '../../domain/profile/Profile'
import { pickNextActiveProfileId, removeProfileFromServer } from '../../domain/server/Server'
import type { ProfileRepository } from '../ports/ProfileRepository'
import type { ServerRepository } from '../ports/ServerRepository'

/**
 * Caso de uso de la User Story 2 (002), modificado en 008: elimina un
 * perfil y, por construcción, su harem completo con él (FR-011), y lo
 * quita también de `Server.profileIds` (el servidor en sí NO se elimina,
 * aunque quede vacío — FR-014). Si el eliminado era el activo, reactiva
 * usando `pickNextActiveProfileId` sobre el estado ya actualizado de
 * ambas colecciones (en vez de la lógica anterior basada en `order`, que
 * ya no existe).
 */
export function deleteProfile(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  profileId: string,
): void {
  const profiles = profileRepository.getAll()
  const removed = profiles.find((profile) => profile.id === profileId)
  const remainingProfiles = removeProfile(profiles, profileId)

  const servers = serverRepository.getAll()
  const nextServers = removed
    ? removeProfileFromServer(servers, removed.serverId, profileId)
    : servers
  serverRepository.save(nextServers)

  if (!removed?.isActive) {
    profileRepository.save(remainingProfiles)
    return
  }

  const nextActiveId = pickNextActiveProfileId(nextServers, remainingProfiles)
  profileRepository.save(
    remainingProfiles.map((profile) => (profile.id === nextActiveId ? { ...profile, isActive: true } : profile)),
  )
}
