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
 * FR-015a/FR-015b). La clave de identidad de "es el mismo personaje
 * reclamado" entre ambos pegados es el **nombre** del personaje (por
 * cola FIFO ante duplicados, ver `existingCharactersByName` más abajo),
 * NO el claim rank (`#N`) — a pesar de lo que decidió research.md de
 * 002. El `#N` de Mudae no identifica una copia puntual reclamada: es
 * el ranking global de claims de ese personaje entre TODOS los
 * usuarios de Mudae, así que cambia con el tiempo aunque el usuario no
 * toque nada de su harem. Usarlo como clave hacía que, en cualquier
 * actualización donde ese ranking global se hubiera movido, el
 * personaje se viera como "nuevo" (id nuevo, sin posición previa) y
 * terminara reubicado al final por `stableReorder` — el bug real
 * detrás de "el orden de los personajes se desordena al actualizar el
 * harem", pese a que las series (agrupadas por nombre, siempre
 * estable) no se veían afectadas. Ver contracts/sync-harem.md:
 *
 * - nombre ya presente en el harem actual (por orden de aparición,
 *   ante duplicados) → se actualiza ese personaje (imagen/kakera/claim
 *   rank), conservando su `id` interno para no re-disparar su
 *   animación de entrada si no cambió de verdad.
 * - nombre nuevo (o duplicado sin más copias existentes disponibles) →
 *   se agrega como personaje nuevo (`id` generado).
 * - nombre del harem actual que no aparece en el pegado nuevo → se
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
  const existingCharactersByName = new Map<string, Character[]>()
  const existingSeriesIdByName = new Map<string, string>()
  const existingSeriesOrderByName = new Map<string, number>()
  const existingCharacterOrderById = new Map<string, number>()

  currentHarem.series.forEach((series, seriesIndex) => {
    existingSeriesIdByName.set(series.name, series.id)
    existingSeriesOrderByName.set(series.name, seriesIndex)
    series.characters.forEach((character, characterIndex) => {
      existingCharacterOrderById.set(character.id, characterIndex)
      const queue = existingCharactersByName.get(character.name)
      if (queue) {
        queue.push(character)
      } else {
        existingCharactersByName.set(character.name, [character])
      }
    })
  })

  const seriesByName = new Map<string, Series>()

  for (const parsedSerie of parsedSeries) {
    const characters: Character[] = parsedSerie.characters.map((parsedCharacter) => {
      // `.shift()` consume la copia existente más antigua con este
      // nombre primero, así que ante duplicados (dos copias del mismo
      // personaje) cada una conserva su propio `id` en el mismo orden
      // relativo en que ya aparecían, en vez de que ambas colapsen a
      // una sola identidad.
      const existing = existingCharactersByName.get(parsedCharacter.name)?.shift()

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
