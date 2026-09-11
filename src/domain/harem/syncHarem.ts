import type { Harem } from './Harem'
import type { Character } from './Character'
import type { Series } from './Series'
import type { ParsedSeries } from '../parsing/parseHaremMessage'

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Reconcilia el harem actual de un perfil con lo recién parseado de un
 * segundo pegado del mismo perfil (mismo `id`, User Story 4 de 002,
 * FR-015a/FR-015b). El claim rank (`#N`) es la clave de identidad de
 * "es el mismo personaje reclamado" entre ambos pegados — ver
 * contracts/sync-harem.md:
 *
 * - claim rank ya presente en el harem actual → se actualiza ese
 *   personaje (nombre/imagen/kakera), conservando su `id` interno para
 *   no re-disparar su animación de entrada si no cambió de verdad.
 * - claim rank nuevo → se agrega como personaje nuevo (`id` generado).
 * - claim rank del harem actual que no aparece en el pegado nuevo → se
 *   descarta (no sobrevive en el resultado).
 *
 * Las series se agrupan según el pegado más reciente (conservando el
 * `id` de una serie existente con el mismo nombre); una serie sin
 * personajes no aparece en el resultado (mismo invariante que
 * `removeCharacterFromSeries`, FR-022 de 001).
 */
export function syncHarem(currentHarem: Harem, parsedSeries: ParsedSeries[]): Harem {
  const existingCharacterByClaimRank = new Map<string, Character>()
  const existingSeriesIdByName = new Map<string, string>()

  for (const series of currentHarem.series) {
    existingSeriesIdByName.set(series.name, series.id)
    for (const character of series.characters) {
      if (character.claimRank) {
        existingCharacterByClaimRank.set(character.claimRank, character)
      }
    }
  }

  const seriesByName = new Map<string, Series>()

  for (const parsedSerie of parsedSeries) {
    const characters: Character[] = parsedSerie.characters.map((parsedCharacter) => {
      const existing = parsedCharacter.claimRank
        ? existingCharacterByClaimRank.get(parsedCharacter.claimRank)
        : undefined

      return {
        id: existing?.id ?? generateId(),
        name: parsedCharacter.name,
        imageUrl: parsedCharacter.imageUrl,
        kakera: parsedCharacter.kakera,
        claimRank: parsedCharacter.claimRank,
      }
    })

    const existingEntry = seriesByName.get(parsedSerie.name)
    if (existingEntry) {
      existingEntry.characters.push(...characters)
      continue
    }

    seriesByName.set(parsedSerie.name, {
      id: existingSeriesIdByName.get(parsedSerie.name) ?? generateId(),
      name: parsedSerie.name,
      characters,
    })
  }

  return {
    ...currentHarem,
    series: Array.from(seriesByName.values()).filter((series) => series.characters.length > 0),
  }
}
