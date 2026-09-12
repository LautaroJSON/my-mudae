import type { Server } from '../../src/domain/server/Server'
import type { ServerRepository } from '../../src/application/ports/ServerRepository'

/**
 * Doble de ServerRepository para tests de application/ y presentation/
 * sin tocar localStorage real. Mismo patrón que InMemoryProfileRepository.
 */
export class InMemoryServerRepository implements ServerRepository {
  private servers: Server[]

  constructor(initialServers: Server[] = []) {
    this.servers = initialServers
  }

  getAll(): Server[] {
    return this.servers
  }

  save(servers: Server[]): void {
    this.servers = servers
  }
}
