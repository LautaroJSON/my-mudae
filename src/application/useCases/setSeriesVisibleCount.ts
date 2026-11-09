import { setSeriesVisibleCount as setSeriesVisibleCountInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la manija de ancho de un bloque de serie (013): persiste
 * cuántos personajes muestra a lo ancho el bloque `seriesId` del harem de
 * `profileId` (`null` = ancho completo). No hace nada si el perfil no
 * existe o si el valor no cambia (ni siquiera llama a `repository.save()`).
 */
export function setSeriesVisibleCount(
  repository: ProfileRepository,
  profileId: string,
  seriesId: string,
  visibleCount: number | null,
): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = setSeriesVisibleCountInDomain(targetProfile.harem, seriesId, visibleCount)
  if (nextHarem === targetProfile.harem) {
    return
  }
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
