import { renameProfile as renameProfileInDomain } from '../../domain/profile/Profile'
import type { ProfileRepository } from '../ports/ProfileRepository'

/**
 * Caso de uso de la User Story 3 (001): renombra el alias de un perfil
 * sin afectar ningún otro campo, en particular sin afectar su `id`
 * (FR-016 de 002).
 */
export function renameProfile(repository: ProfileRepository, profileId: string, alias: string): void {
  const next = renameProfileInDomain(repository.getAll(), profileId, alias)
  repository.save(next)
}
