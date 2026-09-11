import { reorderCharactersInSeries as reorderCharactersInSeriesInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 2 (003): persiste el nuevo orden de
 * personajes de una serie puntual del harem de `profileId`, tras un
 * arrastre (FR-004/FR-008). No afecta a ningún otro perfil ni a ninguna
 * otra serie del mismo harem. No hace nada si `profileId` no corresponde
 * a ningún perfil (ni siquiera llama a `repository.save()`).
 */
export function reorderCharactersInSeries(
  repository: ProfileRepository,
  profileId: string,
  seriesId: string,
  orderedCharacterIds: string[],
): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = reorderCharactersInSeriesInDomain(targetProfile.harem, seriesId, orderedCharacterIds)
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
