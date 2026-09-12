import { reorderProfilesInServer as reorderProfilesInServerInDomain } from '../../domain/server/Server'
import type { ServerRepository } from '../ports/ServerRepository'

/**
 * Caso de uso de la User Story 4 (008): persiste el nuevo orden de
 * perfiles dentro de UN servidor tras un arrastre (FR-011), sin afectar
 * a ningún otro servidor.
 */
export function reorderProfilesInServer(repository: ServerRepository, serverId: string, orderedProfileIds: string[]): void {
  const next = reorderProfilesInServerInDomain(repository.getAll(), serverId, orderedProfileIds)
  repository.save(next)
}
