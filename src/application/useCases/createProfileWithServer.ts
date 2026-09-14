import { activateOnlyProfile, deactivateAllProfiles } from '../../domain/profile/Profile'
import { syncHarem } from '../../domain/harem/syncHarem'
import { addProfileToServer } from '../../domain/server/Server'
import { isSameUsername } from '../../domain/profile/username'
import type { ParsedSeries } from '../../domain/parsing/parseHaremMessage'
import type { Profile } from '../../domain/profile/Profile'
import type { Server } from '../../domain/server/Server'
import type { ProfileRepository } from '../ports/ProfileRepository'
import type { ServerRepository } from '../ports/ServerRepository'

export type ServerChoice = { kind: 'new-server'; name: string } | { kind: 'existing-server'; serverId: string }

export type CreateProfileWithServerResult =
  | { ok: true; mode: 'created' | 'synced' }
  | { ok: false; reason: 'SERVER_NOT_FOUND' }

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Caso de uso de la User Story 1 (008): recibe el pegado YA parseado
 * (`parsedUsername`/`parsedSeries`, ver `parseHaremMessage`) y una
 * elección de servidor; crea el servidor si corresponde, y decide
 * crear-vs-sincronizar comparando `serverId + username` (no solo
 * `username`, a diferencia de la extinta `createProfileFromPaste`) —
 * FR-006/FR-007. Reemplaza a `createProfileFromPaste`.
 */
export function createProfileWithServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  parsedUsername: string,
  parsedSeries: ParsedSeries[],
  serverChoice: ServerChoice,
): CreateProfileWithServerResult {
  const existingServers = serverRepository.getAll()

  let targetServer: Server
  let serversAfterEnsuringTarget: Server[]

  if (serverChoice.kind === 'new-server') {
    targetServer = { id: generateId(), name: serverChoice.name, profileIds: [] }
    serversAfterEnsuringTarget = [...existingServers, targetServer]
  } else {
    const found = existingServers.find((server) => server.id === serverChoice.serverId)
    if (!found) {
      return { ok: false, reason: 'SERVER_NOT_FOUND' }
    }
    targetServer = found
    serversAfterEnsuringTarget = existingServers
  }

  const existingProfiles = profileRepository.getAll()
  // La comparación de nombre es tolerante (mismo criterio que
  // `updateActiveProfileHarem`): casing o caracteres invisibles del
  // copiado de Discord no deben crear un perfil duplicado en el mismo
  // servidor en vez de sincronizar el que ya existe.
  const matchingProfile = existingProfiles.find(
    (profile) => profile.serverId === targetServer.id && isSameUsername(profile.username, parsedUsername),
  )

  if (matchingProfile) {
    const syncedHarem = syncHarem(matchingProfile.harem, parsedSeries)
    const updatedProfiles = existingProfiles.map((profile) =>
      profile.id === matchingProfile.id ? { ...profile, harem: syncedHarem } : profile,
    )
    profileRepository.save(activateOnlyProfile(updatedProfiles, matchingProfile.id))
    serverRepository.save(serversAfterEnsuringTarget)
    return { ok: true, mode: 'synced' }
  }

  const newProfileId = generateId()
  const newProfile: Profile = {
    id: newProfileId,
    serverId: targetServer.id,
    username: parsedUsername,
    alias: parsedUsername,
    isActive: true,
    createdAt: new Date().toISOString(),
    harem: {
      profileId: newProfileId,
      series: parsedSeries.map((series) => ({
        id: generateId(),
        name: series.name,
        characters: series.characters.map((character) => ({
          id: generateId(),
          name: character.name,
          imageUrl: character.imageUrl,
          kakera: character.kakera,
          claimRank: character.claimRank,
        })),
      })),
    },
  }

  const deactivated = deactivateAllProfiles(existingProfiles)
  profileRepository.save([...deactivated, newProfile])
  serverRepository.save(addProfileToServer(serversAfterEnsuringTarget, targetServer.id, newProfileId))

  return { ok: true, mode: 'created' }
}
