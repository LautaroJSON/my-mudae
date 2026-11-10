import { removeCharacters as removeCharactersInDomain } from '../../domain/harem/Harem'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de "Quitar del harem" (014): persiste la eliminación de los
 * personajes `characterIds` del harem de `profileId`, después de que el
 * usuario los divorció en Discord. No hace nada si el perfil no existe o
 * si ninguno de los ids está en su harem (ni siquiera llama a
 * `repository.save()`).
 */
export function removeCharacters(repository: ProfileRepository, profileId: string, characterIds: string[]): void {
  const profiles = repository.getAll()
  const targetProfile = profiles.find((profile) => profile.id === profileId)
  if (!targetProfile) {
    return
  }

  const nextHarem = removeCharactersInDomain(targetProfile.harem, characterIds)
  if (nextHarem === targetProfile.harem) {
    return
  }
  const next = profiles.map((profile) => (profile.id === profileId ? { ...profile, harem: nextHarem } : profile))
  repository.save(next)
}
