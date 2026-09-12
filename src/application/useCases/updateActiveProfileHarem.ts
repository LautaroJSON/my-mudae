import { parseHaremMessage } from '../../domain/parsing/parseHaremMessage'
import { syncHarem } from '../../domain/harem/syncHarem'
import type { ProfileRepository } from '../ports/ProfileRepository'

export type UpdateActiveProfileHaremResult =
  | { ok: true }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }
  | { ok: false; reason: 'PROFILE_MISMATCH'; pastedProfileName: string }
  | { ok: false; reason: 'NO_ACTIVE_PROFILE' }

/**
 * Caso de uso de la User Story 1 (005): sobrescribe el harem del perfil
 * activo con un nuevo pegado, siempre que el nombre de perfil extraído
 * coincida exactamente con `activeProfileId` (comparación por `id`, no
 * por `alias` — ver research.md). A diferencia de
 * `createProfileFromPaste`, nunca crea un perfil nuevo ni sincroniza
 * ningún perfil distinto del indicado: cualquier discordancia de
 * nombre (con el activo o con cualquier otro perfil existente) bloquea
 * la operación sin persistir nada (contracts/update-active-profile-harem.md).
 */
export function updateActiveProfileHarem(
  repository: ProfileRepository,
  activeProfileId: string,
  rawText: string,
): UpdateActiveProfileHaremResult {
  const parsed = parseHaremMessage(rawText)

  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason }
  }

  if (parsed.profileName !== activeProfileId) {
    return { ok: false, reason: 'PROFILE_MISMATCH', pastedProfileName: parsed.profileName }
  }

  const profiles = repository.getAll()
  const target = profiles.find((profile) => profile.id === activeProfileId)

  if (!target) {
    return { ok: false, reason: 'NO_ACTIVE_PROFILE' }
  }

  const syncedHarem = syncHarem(target.harem, parsed.series)
  repository.save(
    profiles.map((profile) => (profile.id === activeProfileId ? { ...profile, harem: syncedHarem } : profile)),
  )

  return { ok: true }
}
