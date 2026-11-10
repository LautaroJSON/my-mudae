import type { Series } from './Series'

/**
 * La colección de series/personajes de un Profile (FR-016, FR-017).
 * Pertenece exactamente a un Profile y se elimina junto con él.
 */
export interface Harem {
  profileId: string
  series: Series[]
}

/**
 * Reordena las series de un harem según `orderedSeriesIds` (User Story 3
 * de 003). Mismo algoritmo tolerante que `reorderProfiles`/
 * `reorderCharactersInSeries`: ids desconocidos se ignoran, series
 * ausentes de la lista quedan al final en su orden relativo anterior.
 * Nunca modifica `series.characters` de ninguna serie (FR-007) — solo
 * reordena el array externo.
 */
export function reorderSeries(harem: Harem, orderedSeriesIds: string[]): Harem {
  const knownIds = new Set(harem.series.map((series) => series.id))
  const requestedKnown = orderedSeriesIds.filter((id) => knownIds.has(id))
  const requestedSet = new Set(requestedKnown)

  const missing = harem.series.filter((series) => !requestedSet.has(series.id)).map((series) => series.id)

  const finalSequence = [...requestedKnown, ...missing]
  const seriesById = new Map(harem.series.map((series) => [series.id, series]))

  return { ...harem, series: finalSequence.map((id) => seriesById.get(id)!) }
}

/**
 * Elimina un personaje de su serie. Si esa serie se queda sin ningún
 * personaje, la serie misma se elimina del harem (FR-022): las series
 * existen solo como agrupación de sus personajes, nunca como entidad
 * independiente que pueda quedar vacía.
 */
export function removeCharacterFromSeries(
  harem: Harem,
  seriesId: string,
  characterId: string,
): Harem {
  const series = harem.series
    .map((series) =>
      series.id === seriesId
        ? { ...series, characters: series.characters.filter((character) => character.id !== characterId) }
        : series,
    )
    .filter((series) => series.characters.length > 0)

  return { ...harem, series: ensurePrincipalBlocks(series) }
}

/**
 * Quita del harem a todos los personajes de `characterIds` (014: los que
 * el usuario ya divorció en Discord), estén en el bloque que estén. Igual
 * que `removeCharacterFromSeries`: los bloques que quedan vacíos se
 * eliminan (FR-022) y se promueve un principal si hace falta. Un
 * `visibleCount` (013) que ya alcanza a todos los personajes que quedan
 * se borra, para respetar su invariante. Ids desconocidos se ignoran; si
 * ninguno coincide devuelve el mismo `harem`.
 */
export function removeCharacters(harem: Harem, characterIds: Iterable<string>): Harem {
  const toRemove = new Set(characterIds)
  const affected = harem.series.some((series) => series.characters.some((character) => toRemove.has(character.id)))
  if (!affected) {
    return harem
  }

  const series = harem.series
    .map((block) => {
      const characters = block.characters.filter((character) => !toRemove.has(character.id))
      if (characters.length === block.characters.length) {
        return block
      }
      const { visibleCount, ...rest } = block
      return visibleCount !== undefined && visibleCount < characters.length
        ? { ...rest, characters, visibleCount }
        : { ...rest, characters }
    })
    .filter((block) => block.characters.length > 0)

  return { ...harem, series: ensurePrincipalBlocks(series) }
}

/**
 * Mantiene la invariante de bloques (012): cada `name` presente tiene
 * exactamente un bloque principal. Si el principal de una serie
 * desapareció (se vació y se eliminó por FR-022) pero quedan bloques
 * separados, el primero de ellos — en el orden actual del harem — pasa a
 * ser el principal. Nunca reordena ni toca personajes.
 */
export function ensurePrincipalBlocks(series: Series[]): Series[] {
  const namesWithPrincipal = new Set(series.filter((block) => !block.detached).map((block) => block.name))

  return series.map((block) => {
    if (!block.detached || namesWithPrincipal.has(block.name)) {
      return block
    }
    namesWithPrincipal.add(block.name)
    const principal = { ...block }
    delete principal.detached
    return principal
  })
}

/**
 * Todos los bloques (012) de la misma serie que `seriesId`, incluido él
 * mismo, en el orden del harem. Vacío si `seriesId` no existe.
 */
export function getSeriesBlocks(harem: Harem, seriesId: string): Series[] {
  const block = harem.series.find((series) => series.id === seriesId)
  if (!block) {
    return []
  }
  return harem.series.filter((series) => series.name === block.name)
}

/**
 * Mueve un personaje de su bloque (`fromSeriesId`) a otro bloque de la
 * MISMA serie (012), al final de ese bloque. Con `targetSeriesId: null`
 * crea un bloque separado nuevo con solo ese personaje, justo después del
 * bloque de origen. Un personaje nunca puede terminar en un bloque de
 * otra serie (FR-005 de 003): un `targetSeriesId` de otra serie, o
 * desconocido, deja el harem sin cambios. Si el bloque de origen se
 * queda vacío se elimina (FR-022) y, si era el principal, se promueve
 * otro (`ensurePrincipalBlocks`).
 */
export function moveCharacterToBlock(
  harem: Harem,
  fromSeriesId: string,
  characterId: string,
  targetSeriesId: string | null,
): Harem {
  const source = harem.series.find((series) => series.id === fromSeriesId)
  const character = source?.characters.find((candidate) => candidate.id === characterId)
  if (!source || !character || targetSeriesId === fromSeriesId) {
    return harem
  }

  const target = targetSeriesId === null ? undefined : harem.series.find((series) => series.id === targetSeriesId)
  if (targetSeriesId !== null && (!target || target.name !== source.name)) {
    return harem
  }

  const series = harem.series.flatMap((block) => {
    if (block.id === fromSeriesId) {
      const remaining = { ...block, characters: block.characters.filter((candidate) => candidate.id !== characterId) }
      if (targetSeriesId !== null) {
        return [remaining]
      }
      const newBlock: Series = { id: crypto.randomUUID(), name: block.name, characters: [character], detached: true }
      return [remaining, newBlock]
    }
    if (block.id === targetSeriesId) {
      return [{ ...block, characters: [...block.characters, character] }]
    }
    return [block]
  })

  return { ...harem, series: ensurePrincipalBlocks(series.filter((block) => block.characters.length > 0)) }
}

/**
 * "Unir a la serie" (012): pasa todos los personajes de un bloque
 * separado al final del bloque principal de su serie, en su orden, y
 * elimina el bloque separado. Un `seriesId` desconocido o que ya es el
 * principal deja el harem sin cambios.
 */
export function mergeSeriesBlock(harem: Harem, seriesId: string): Harem {
  const block = harem.series.find((series) => series.id === seriesId)
  const principal = block && harem.series.find((series) => series.name === block.name && !series.detached)
  if (!block || !block.detached || !principal) {
    return harem
  }

  const series = harem.series
    .filter((series) => series.id !== seriesId)
    .map((series) => (series.id === principal.id ? { ...series, characters: [...series.characters, ...block.characters] } : series))

  return { ...harem, series }
}

/**
 * Ajusta cuántos personajes muestra a lo ancho un bloque (013). El valor
 * se acota a `[1, characters.length]`; `null` o un valor que alcanza a
 * todos los personajes borra el campo (el bloque vuelve a su ancho
 * natural). Devuelve el mismo `harem` si nada cambia, para no disparar
 * un guardado ni re-render inútiles.
 */
export function setSeriesVisibleCount(harem: Harem, seriesId: string, visibleCount: number | null): Harem {
  const target = harem.series.find((series) => series.id === seriesId)
  if (!target) {
    return harem
  }

  const total = target.characters.length
  const clamped = visibleCount === null ? null : Math.max(1, Math.min(total, Math.round(visibleCount)))
  const next = clamped === null || clamped >= total ? undefined : clamped
  if (next === target.visibleCount) {
    return harem
  }

  const series = harem.series.map((series) => {
    if (series.id !== seriesId) {
      return series
    }
    const { visibleCount: _previous, ...rest } = series
    return next === undefined ? rest : { ...rest, visibleCount: next }
  })
  return { ...harem, series }
}

/**
 * Cantidad total de personajes del harem, sumando todas sus series
 * (User Story 3 de 002). Se calcula en el momento a partir de los
 * personajes ya guardados — nunca se persiste aparte (research.md de
 * 002: evita desincronizarse del harem real).
 */
export function countCharacters(harem: Harem): number {
  return harem.series.reduce((total, series) => total + series.characters.length, 0)
}

/**
 * Reordena los personajes de UNA sola serie (`seriesId`) según
 * `orderedCharacterIds` (User Story 2 de 003). Mismo algoritmo tolerante
 * que `reorderProfiles` de `domain/profile/Profile.ts`: ids desconocidos
 * se ignoran, personajes ausentes de la lista quedan al final en su
 * orden relativo anterior. Si `seriesId` no corresponde a ninguna serie
 * del harem, lo devuelve sin cambios. No afecta a ninguna otra serie
 * (FR-005: un personaje nunca puede terminar en otra serie por este
 * camino, porque esta función nunca mueve un `Character` entre arrays de
 * `characters` distintos).
 */
export function reorderCharactersInSeries(
  harem: Harem,
  seriesId: string,
  orderedCharacterIds: string[],
): Harem {
  const series = harem.series.map((series) => {
    if (series.id !== seriesId) {
      return series
    }

    const knownIds = new Set(series.characters.map((character) => character.id))
    const requestedKnown = orderedCharacterIds.filter((id) => knownIds.has(id))
    const requestedSet = new Set(requestedKnown)

    const missing = series.characters.filter((character) => !requestedSet.has(character.id)).map((character) => character.id)

    const finalSequence = [...requestedKnown, ...missing]
    const charactersById = new Map(series.characters.map((character) => [character.id, character]))

    return { ...series, characters: finalSequence.map((id) => charactersById.get(id)!) }
  })

  return { ...harem, series }
}

/**
 * Valor total (suma de kakera) del harem; un personaje sin kakera
 * cargado todavía cuenta como 0, nunca rompe el cálculo (User Story 3 de
 * 002). Nunca se confía en la línea "Total value" del mensaje pegado
 * (ya descartada como ruido desde la feature anterior).
 */
export function sumKakera(harem: Harem): number {
  return harem.series.reduce(
    (total, series) => total + series.characters.reduce((seriesTotal, character) => seriesTotal + (character.kakera ?? 0), 0),
    0,
  )
}

export type KakeraSortDirection = 'asc' | 'desc'

function seriesKakeraValue(series: Series): number {
  return series.characters.reduce((total, character) => total + (character.kakera ?? 0), 0)
}

/**
 * Devuelve una vista temporal del harem ordenada por valor de kakera
 * (User Story 1/2 de 010): dentro de cada serie, sus personajes por su
 * propio `kakera` (`?? 0`, mismo criterio que `sumKakera`); entre
 * series, por la suma de kakera de sus personajes. Nunca muta `harem` ni
 * ninguna `Series`/`Character` de entrada (devuelve arrays nuevos en
 * ambos niveles) y nunca se persiste: quien la invoca decide si la usa
 * para renderizar en lugar del `Harem` real (ver Principio II — el
 * comando `$sm` de 009 sigue leyendo el `Harem` sin ordenar).
 * `Array.prototype.sort` es estable, así que los empates conservan el
 * orden relativo original sin necesitar un comparador de desempate
 * (FR-014).
 */
export function sortHaremByKakera(harem: Harem, direction: KakeraSortDirection): Harem {
  const factor = direction === 'desc' ? -1 : 1

  const series = harem.series
    .map((series) => ({
      ...series,
      characters: [...series.characters].sort((a, b) => factor * ((a.kakera ?? 0) - (b.kakera ?? 0))),
    }))
    .sort((a, b) => factor * (seriesKakeraValue(a) - seriesKakeraValue(b)))

  return { ...harem, series }
}

// Descompone diacríticos (NFD) y remueve las marcas combinantes resultantes
// (acentos) antes de comparar — a diferencia de `normalizeUsername`
// (`domain/profile/username.ts`, pensado para igualdad exacta de un
// username sin acentos habitualmente), acá los nombres de personajes/series
// sí llevan tildes con frecuencia y la búsqueda debe ignorarlas (FR-007 de
// 011).
const DIACRITIC_MARKS = /[̀-ͯ]/g

function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(DIACRITIC_MARKS, '').trim().toLocaleLowerCase()
}

/**
 * Devuelve una vista temporal del harem filtrada por `query` (User Story 1
 * de 011): una serie cuyo título coincide entra completa, con **la misma
 * referencia** de objeto `Series` (no se reconstruye) para no invalidar la
 * memoización de `SeriesGroup` en series que no cambian de contenido entre
 * una tecla y la siguiente (Principio III); si el título no coincide, se
 * conservan solo los personajes cuyo nombre coincide, en un objeto `Series`
 * nuevo. La coincidencia es por subcadena, insensible a mayúsculas/
 * minúsculas y a acentos (`normalizeSearchText`, FR-007). Con `query` vacío
 * o solo espacios, devuelve `harem` sin filtrar (misma referencia, FR-011)
 * — nunca muta la entrada ni persiste su resultado (lo decide quien la
 * invoca, ver `HaremView`).
 */
export function filterHaremByQuery(harem: Harem, query: string): Harem {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return harem
  }

  const series = harem.series.reduce<Series[]>((matched, series) => {
    if (normalizeSearchText(series.name).includes(normalizedQuery)) {
      matched.push(series)
      return matched
    }

    const characters = series.characters.filter((character) => normalizeSearchText(character.name).includes(normalizedQuery))
    if (characters.length > 0) {
      matched.push({ ...series, characters })
    }
    return matched
  }, [])

  return { ...harem, series }
}
