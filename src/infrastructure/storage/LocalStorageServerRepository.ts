import type { Server } from '../../domain/server/Server'
import type { ServerRepository } from '../../application/ports/ServerRepository'

const STORAGE_KEY = 'mymudae:serverList'

/**
 * Implementación de ServerRepository sobre localStorage, mismo patrón
 * defensivo (nunca lanza) que LocalStorageProfileRepository (Principio I).
 */
export class LocalStorageServerRepository implements ServerRepository {
  getAll(): Server[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as Server[]) : []
    } catch {
      return []
    }
  }

  save(servers: Server[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
    } catch {
      // Ver nota en LocalStorageProfileRepository: no se propaga la excepción.
    }
  }
}
