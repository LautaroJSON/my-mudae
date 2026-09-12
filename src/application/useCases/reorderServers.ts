import { reorderServers as reorderServersInDomain } from '../../domain/server/Server'
import type { ServerRepository } from '../ports/ServerRepository'

/**
 * Caso de uso de la User Story 4 (008): persiste el nuevo orden de la
 * lista de servidores tras un arrastre (FR-012).
 */
export function reorderServers(repository: ServerRepository, orderedIds: string[]): void {
  const next = reorderServersInDomain(repository.getAll(), orderedIds)
  repository.save(next)
}
