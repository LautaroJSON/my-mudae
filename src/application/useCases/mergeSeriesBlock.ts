import { mergeSeriesBlock as mergeSeriesBlockInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de "Unir a la serie" (012): persiste la unión de un bloque
 * separado con el bloque principal de su serie, en el harem de
 * `profileId`. No hace nada si `profileId` no corresponde a ningún perfil
 * (ni siquiera llama a `repository.save()`).
 */
export function mergeSeriesBlock(repository: ProfileRepository, profileId: string, seriesId: string): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = mergeSeriesBlockInDomain(targetProfile.harem, seriesId)
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
