import type { Character } from './Character'

/**
 * Agrupador con nombre dentro de un Harem (FR-017, FR-018). Nunca debe
 * persistirse con `characters: []`: una Series que se queda sin personajes
 * se elimina automáticamente (FR-022) — ver `removeCharacterFromSeries` en
 * Harem.ts, que es quien aplica esa regla.
 *
 * Una misma serie (mismo `name`) puede repartirse en varios **bloques**
 * (012): cada bloque es una `Series` con su propio `id`. Por cada `name`
 * hay exactamente un bloque principal (`detached` ausente/false), que es
 * adonde caen los personajes nuevos de esa serie al sincronizar; el resto
 * son bloques separados por el usuario (`detached: true`). Ver
 * `ensurePrincipalBlocks` en Harem.ts, que mantiene esa invariante.
 */
export interface Series {
  id: string
  name: string
  characters: Character[]
  /** `true` si es un bloque separado a mano del bloque principal de su serie (012). */
  detached?: boolean
}
