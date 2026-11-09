import { ensurePrincipalBlocks, type Harem } from './Harem'
import type { Character } from './Character'
import type { Series } from './Series'
import type { ParsedSeries } from '../parsing/parseHaremMessage'

function generateId(): string {
  return crypto.randomUUID()
}

function seriesAndNameKey(seriesName: string, characterName: string): string {
  return `${seriesName}\u0000${characterName}`
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
 * reclamado" entre ambos pegados es el **nombre** del personaje dentro
 * de su serie (por cola FIFO ante duplicados; con fallback al nombre
 * solo si la serie cambió, ver las dos pasadas más abajo), NO el claim
 * rank (`#N`) — a pesar de lo que decidió research.md de
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
 * Bloques (012): un personaje existente vuelve al mismo bloque donde
 * estaba (principal o separado), así que separar personajes de su serie
 * sobrevive a las actualizaciones; un personaje nuevo, o uno cuya serie
 * cambió en el pegado, va al bloque principal de su serie (conservando
 * su `id`, o uno nuevo si la serie es nueva). Cómo venga agrupado el
 * pegado (ej. la misma serie dos veces) no crea ni junta bloques. Un
 * bloque sin personajes no aparece en el resultado (mismo invariante
 * que `removeCharacterFromSeries`, FR-022 de 001) y, si era el
 * principal, se promueve otro (`ensurePrincipalBlocks`).
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
  type ExistingEntry = { character: Character; block: Series }

  const existingBySeriesAndName = new Map<string, ExistingEntry[]>()
  const existingByName = new Map<string, ExistingEntry[]>()
  const principalIdByName = new Map<string, string>()
  const existingSeriesOrderById = new Map<string, number>()
  const existingCharacterOrderById = new Map<string, number>()

  const pushTo = (map: Map<string, ExistingEntry[]>, key: string, entry: ExistingEntry) => {
    const queue = map.get(key)
    if (queue) {
      queue.push(entry)
    } else {
      map.set(key, [entry])
    }
  }

  currentHarem.series.forEach((block, blockIndex) => {
    existingSeriesOrderById.set(block.id, blockIndex)
    if (!block.detached) {
      principalIdByName.set(block.name, block.id)
    }
    block.characters.forEach((character, characterIndex) => {
      existingCharacterOrderById.set(character.id, characterIndex)
      const entry = { character, block }
      pushTo(existingBySeriesAndName, seriesAndNameKey(block.name, character.name), entry)
      pushTo(existingByName, character.name, entry)
    })
  })

  // Cada copia existente se consume una sola vez, aunque figure en las dos
  // colas (por serie+nombre y por nombre solo).
  const consumed = new Set<string>()
  const takeFrom = (queue: ExistingEntry[] | undefined): ExistingEntry | undefined => {
    const entry = queue?.find((candidate) => !consumed.has(candidate.character.id))
    if (entry) {
      consumed.add(entry.character.id)
    }
    return entry
  }

  // Dos pasadas: primero se resuelven TODAS las coincidencias exactas
  // (misma serie + mismo nombre) y recién después el fallback por nombre
  // solo, para que un personaje que cambió de serie (ej. Mudae renombró la
  // serie) no le robe la copia existente a uno que sí coincide exacto.
  // FIFO (`find` sobre el orden del harem actual) ante duplicados: dos
  // copias del mismo personaje conservan cada una su propio `id`.
  const flatParsed = parsedSeries.flatMap((parsedSerie) =>
    parsedSerie.characters.map((parsedCharacter) => ({ seriesName: parsedSerie.name, parsedCharacter })),
  )
  const matches: (ExistingEntry | undefined)[] = flatParsed.map(({ seriesName, parsedCharacter }) =>
    takeFrom(existingBySeriesAndName.get(seriesAndNameKey(seriesName, parsedCharacter.name))),
  )
  flatParsed.forEach(({ parsedCharacter }, index) => {
    matches[index] ??= takeFrom(existingByName.get(parsedCharacter.name))
  })

  // El ancho elegido por el usuario (013) sobrevive al re-pegado: se
  // copia del bloque existente con el mismo id.
  const visibleCountById = new Map<string, number>()
  currentHarem.series.forEach((block) => {
    if (block.visibleCount !== undefined) {
      visibleCountById.set(block.id, block.visibleCount)
    }
  })

  const blocksById = new Map<string, Series>()
  const blockFor = (id: string, name: string, detached: boolean): Series => {
    let block = blocksById.get(id)
    if (!block) {
      block = detached ? { id, name, characters: [], detached: true } : { id, name, characters: [] }
      const visibleCount = visibleCountById.get(id)
      if (visibleCount !== undefined) {
        block.visibleCount = visibleCount
      }
      blocksById.set(id, block)
    }
    return block
  }

  flatParsed.forEach(({ seriesName, parsedCharacter }, index) => {
    const existing = matches[index]
    const character: Character = {
      id: existing?.character.id ?? generateId(),
      name: parsedCharacter.name,
      imageUrl: parsedCharacter.imageUrl,
      kakera: parsedCharacter.kakera,
      claimRank: parsedCharacter.claimRank,
    }

    // Un personaje existente vuelve al bloque donde ya estaba (012), salvo
    // que el pegado lo traiga bajo otra serie; los nuevos van siempre al
    // bloque principal de su serie, aunque el usuario lo haya movido de
    // posición o haya bloques separados antes que él.
    if (existing && existing.block.name === seriesName) {
      blockFor(existing.block.id, seriesName, Boolean(existing.block.detached)).characters.push(character)
      return
    }

    let principalId = principalIdByName.get(seriesName)
    if (!principalId) {
      principalId = generateId()
      principalIdByName.set(seriesName, principalId)
    }
    blockFor(principalId, seriesName, false).characters.push(character)
  })

  const series = Array.from(blocksById.values())
    .filter((block) => block.characters.length > 0)
    .map((block) => {
      const reordered = {
        ...block,
        characters: stableReorder(block.characters, (character) => existingCharacterOrderById.get(character.id)),
      }
      // Si el bloque perdió personajes, el ancho guardado puede haber
      // quedado igual o mayor que el total: en ese caso ya no aplica.
      if (reordered.visibleCount !== undefined && reordered.visibleCount >= reordered.characters.length) {
        delete reordered.visibleCount
      }
      return reordered
    })

  return {
    ...currentHarem,
    series: ensurePrincipalBlocks(stableReorder(series, (block) => existingSeriesOrderById.get(block.id))),
  }
}
