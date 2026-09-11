import type { Character } from './Character'

/**
 * Agrupador con nombre dentro de un Harem (FR-017, FR-018). Nunca debe
 * persistirse con `characters: []`: una Series que se queda sin personajes
 * se elimina automáticamente (FR-022) — ver `removeCharacterFromSeries` en
 * Harem.ts, que es quien aplica esa regla.
 */
export interface Series {
  id: string
  name: string
  characters: Character[]
}
