import { moveCharacterToBlock as moveCharacterToBlockInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de "Mover a…" (012): persiste el movimiento de un personaje
 * a otro bloque de su misma serie del harem de `profileId`, o a un bloque
 * separado nuevo (`targetSeriesId: null`). No hace nada si `profileId` no
 * corresponde a ningún perfil (ni siquiera llama a `repository.save()`).
 */
export function moveCharacterToBlock(
  repository: ProfileRepository,
  profileId: string,
  fromSeriesId: string,
  characterId: string,
  targetSeriesId: string | null,
): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = moveCharacterToBlockInDomain(targetProfile.harem, fromSeriesId, characterId, targetSeriesId)
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
