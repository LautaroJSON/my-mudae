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
