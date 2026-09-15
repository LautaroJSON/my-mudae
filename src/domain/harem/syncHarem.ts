import type { Harem } from './Harem'
import type { Character } from './Character'
import type { Series } from './Series'
import type { ParsedSeries } from '../parsing/parseHaremMessage'

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Reordena `items` dejando primero a los que ya tenían una posición
 * conocida (según `existingIndexOf`, ascendente), y al final a los que
 * no (sin posición previa), preservando entre estos últimos su orden
 * relativo de llegada — `Array.prototype.sort` es estable (garantizado
 * desde ES2019), así que alcanza con mandar los "nuevos" a `Infinity`.
 * Es la pieza que hace que el orden de "quién apareció primero en el
 * pegado" nunca pise el orden manual (drag&drop) que el usuario ya
 * tenía: ver bug "el ordenamiento se ve pisado al actualizar la lista".
 */
function stableReorder<T>(items: T[], existingIndexOf: (item: T) => number | undefined): T[] {
  return [...items].sort((a, b) => {
    const indexA = existingIndexOf(a) ?? Number.POSITIVE_INFINITY
    const indexB = existingIndexOf(b) ?? Number.POSITIVE_INFINITY
    return indexA - indexB
  })
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
 *
 * El orden final de series, y el de personajes dentro de cada serie
 * existente, respeta la posición que ya tenían en `currentHarem` (la
 * que el usuario haya fijado a mano por drag&drop) — el orden en que
 * vienen en `parsedSeries` solo decide dónde caen los que son nuevos
 * (al final, en su orden de aparición en el pegado). Sin esto, cada
 * actualización pisaba el ordenamiento manual con el orden crudo del
 * pegado de Discord.
 */
export function syncHarem(currentHarem: Harem, parsedSeries: ParsedSeries[]): Harem {
  const existingCharacterByClaimRank = new Map<string, Character>()
  const existingSeriesIdByName = new Map<string, string>()
  const existingSeriesOrderByName = new Map<string, number>()
  const existingCharacterOrderById = new Map<string, number>()

  currentHarem.series.forEach((series, seriesIndex) => {
    existingSeriesIdByName.set(series.name, series.id)
    existingSeriesOrderByName.set(series.name, seriesIndex)
    series.characters.forEach((character, characterIndex) => {
      existingCharacterOrderById.set(character.id, characterIndex)
      if (character.claimRank) {
        existingCharacterByClaimRank.set(character.claimRank, character)
      }
    })
  })

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

  const series = Array.from(seriesByName.values())
    .filter((series) => series.characters.length > 0)
    .map((series) => ({
      ...series,
      characters: stableReorder(series.characters, (character) => existingCharacterOrderById.get(character.id)),
    }))

  return {
    ...currentHarem,
    series: stableReorder(series, (oneSeries) => existingSeriesOrderByName.get(oneSeries.name)),
  }
}
