import { reorderSeries as reorderSeriesInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 3 (003): persiste el nuevo orden de
 * series del harem de `profileId`, tras un arrastre (FR-006/FR-009). No
 * afecta a ningún otro perfil ni al orden interno de personajes de
 * ninguna serie (FR-007). No hace nada si `profileId` no corresponde a
 * ningún perfil (ni siquiera llama a `repository.save()`).
 */
export function reorderSeries(
  repository: ProfileRepository,
  profileId: string,
  orderedSeriesIds: string[],
): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = reorderSeriesInDomain(targetProfile.harem, orderedSeriesIds)
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
