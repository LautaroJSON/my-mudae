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
