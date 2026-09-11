import type { Profile } from './Profile'

/**
 * Forma persistida de un Profile de la feature 001, antes de que
 * existieran `alias`/`order` (su `id` era un UUID generado, no el
 * nombre del harem). Ver contracts/migrate-legacy-profiles.md.
 */
interface LegacyProfile {
  id: string
  name: string
  isActive: boolean
  harem: Profile['harem']
  createdAt: string
}

function isMigrated(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Partial<Profile>
  return typeof candidate.alias === 'string' && typeof candidate.order === 'number'
}

function dedupeId(candidate: string, usedIds: Set<string>): string {
  if (!usedIds.has(candidate)) {
    return candidate
  }
  let suffix = 2
  while (usedIds.has(`${candidate}-${suffix}`)) {
    suffix += 1
  }
  return `${candidate}-${suffix}`
}

/**
 * Migra perfiles persistidos con la forma de 001 (`{id: uuid, name,
 * ...}`) a la forma de 002 (`{id: <nombre original, único>, alias,
 * order, ...}`). Idempotente: un elemento que ya tiene `alias`/`order`
 * se devuelve sin cambios. Función pura, sin I/O — ver
 * contracts/migrate-legacy-profiles.md.
 */
export function migrateLegacyProfiles(raw: unknown[]): Profile[] {
  const usedIds = new Set<string>()
  for (const item of raw) {
    if (isMigrated(item)) {
      usedIds.add(item.id)
    }
  }

  return raw.map((item, index): Profile => {
    if (isMigrated(item)) {
      return item
    }

    const legacy = item as LegacyProfile
    const id = dedupeId(legacy.name, usedIds)
    usedIds.add(id)

    return {
      id,
      alias: legacy.name,
      order: index,
      isActive: legacy.isActive,
      harem: legacy.harem,
      createdAt: legacy.createdAt,
    }
  })
}
