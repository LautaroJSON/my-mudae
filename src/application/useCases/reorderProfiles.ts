import { reorderProfiles as reorderProfilesInDomain } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 2 (002): persiste el nuevo orden de la
 * lista de perfiles tras un arrastre (FR-008/009). No activa ni
 * desactiva ningún perfil (FR-010).
 */
export function reorderProfiles(repository: ProfileRepository, orderedIds: string[]): void {
  const next = reorderProfilesInDomain(repository.getAll(), orderedIds)
  repository.save(next)
}
