import { removeProfile } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 2: elimina un perfil y, por construcción,
 * su harem completo con él (FR-011). Si el eliminado era el activo y
 * quedan otros perfiles, activa automáticamente otro (FR-015).
 */
export function deleteProfile(repository: ProfileRepository, profileId: string): void {
  const next = removeProfile(repository.getAll(), profileId)
  repository.save(next)
}
