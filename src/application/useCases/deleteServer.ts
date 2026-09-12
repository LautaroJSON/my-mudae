import { pickNextActiveProfileId, removeServer } from '../../domain/server/Server'
import type { ProfileRepository } from '../ports/ProfileRepository'
import type { ServerRepository } from '../ports/ServerRepository'

export type DeleteServerResult = { ok: true; deletedProfileCount: number }

/**
 * Caso de uso de la User Story 2 (008): elimina el servidor indicado y,
 * en cascada, todos los perfiles cuyo `serverId` coincida (FR-019),
 * reactivando vía `pickNextActiveProfileId` si el activo estaba entre
 * los eliminados. Es responsabilidad de quien llama (la UI) decidir SI
 * mostrar una advertencia de confirmación antes de invocar esto — este
 * caso de uso siempre ejecuta la eliminación completa.
 */
export function deleteServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  serverId: string,
): DeleteServerResult {
  const profiles = profileRepository.getAll()
  const affectedProfiles = profiles.filter((profile) => profile.serverId === serverId)
  const hadActiveAmongAffected = affectedProfiles.some((profile) => profile.isActive)

  const remainingProfiles = profiles.filter((profile) => profile.serverId !== serverId)
  const nextServers = removeServer(serverRepository.getAll(), serverId)
  serverRepository.save(nextServers)

  if (!hadActiveAmongAffected) {
    profileRepository.save(remainingProfiles)
    return { ok: true, deletedProfileCount: affectedProfiles.length }
  }

  const nextActiveId = pickNextActiveProfileId(nextServers, remainingProfiles)
  profileRepository.save(
    remainingProfiles.map((profile) => (profile.id === nextActiveId ? { ...profile, isActive: true } : profile)),
  )

  return { ok: true, deletedProfileCount: affectedProfiles.length }
}
