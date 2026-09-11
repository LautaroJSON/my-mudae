import { activateOnlyProfile } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 2: activa `profileId`, desactivando
 * cualquier otro perfil (FR-013). No falla si `profileId` no existe.
 */
export function activateProfile(repository: ProfileRepository, profileId: string): void {
  const next = activateOnlyProfile(repository.getAll(), profileId)
  repository.save(next)
}
