import { parseHaremMessage } from '../../domain/parsing/parseHaremMessage'
import { activateOnlyProfile, deactivateAllProfiles } from '../../domain/profile/Profile'
import { syncHarem } from '../../domain/harem/syncHarem'
import type { Profile } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../ports/ProfileRepository'

export type CreateProfileFromPasteResult =
  | { ok: true; mode: 'created' | 'synced' }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }

function generateId(): string {
  return crypto.randomUUID()
}

function nextOrder(profiles: Profile[]): number {
  if (profiles.length === 0) {
    return 0
  }
  return Math.max(...profiles.map((profile) => profile.order)) + 1
}

/**
 * Caso de uso de la User Story 1 (001) + User Story 4 (002): crea un
 * perfil a partir del texto pegado por el usuario (FR-001 a FR-008 de
 * 001), o — si el nombre extraído ya es el `id` de un perfil existente —
 * sincroniza el harem de ese perfil en vez de duplicarlo (FR-015a de
 * 002). En cualquiera de los dos casos, el perfil resultante queda
 * activo, desactivando el que lo estuviera antes (FR-002, FR-008,
 * FR-014 de 001). En falla de parseo, no persiste absolutamente nada
 * (FR-007 de 001).
 */
export function createProfileFromPaste(
  repository: ProfileRepository,
  rawText: string,
): CreateProfileFromPasteResult {
  const parsed = parseHaremMessage(rawText)

  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason }
  }

  const existingProfiles = repository.getAll()
  const profileId = parsed.profileName
  const matchingProfile = existingProfiles.find((profile) => profile.id === profileId)

  if (matchingProfile) {
    const syncedHarem = syncHarem(matchingProfile.harem, parsed.series)
    const updatedProfiles = existingProfiles.map((profile) =>
      profile.id === profileId ? { ...profile, harem: syncedHarem } : profile,
    )
    repository.save(activateOnlyProfile(updatedProfiles, profileId))
    return { ok: true, mode: 'synced' }
  }

  const newProfile: Profile = {
    id: profileId,
    alias: profileId,
    isActive: true,
    createdAt: new Date().toISOString(),
    order: nextOrder(existingProfiles),
    harem: {
      profileId,
      series: parsed.series.map((series) => ({
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
  repository.save([...deactivated, newProfile])

  return { ok: true, mode: 'created' }
}
