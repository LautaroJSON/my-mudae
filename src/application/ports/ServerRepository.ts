import type { Server } from '../../domain/server/Server'

/**
 * Puerto de persistencia de application/ para la colección `Server[]`
 * (feature 008). Mismo contrato "leer todo/guardar todo" que
 * `ProfileRepository` — un repositorio nuevo por colección de nivel
 * superior persistida, en vez de forzar `Server[]` dentro de
 * `ProfileRepository` (Principio IV, ver research.md/plan.md).
 */
export interface ServerRepository {
  /** Nunca lanza: devuelve `[]` si no hay nada persistido todavía. */
  getAll(): Server[]
  /** Persiste de forma síncrona la colección completa. */
  save(servers: Server[]): void
}
