import type { Series } from '../domain/harem/Series'

/**
 * Número visible de un bloque separado (012): se numeran a partir de 2
 * (el principal sería el 1), en el orden en que aparecen en el harem.
 * `null` para el bloque principal. `blocks` son todos los bloques de esa
 * serie (`getSeriesBlocks`).
 */
export function getBlockNumber(blocks: Series[], block: Series): number | null {
  if (!block.detached) {
    return null
  }
  return blocks.filter((candidate) => candidate.detached).findIndex((candidate) => candidate.id === block.id) + 2
}

/**
 * Nombre visible de un bloque de serie (012): el principal es el nombre
 * de la serie tal cual; un separado es "Serie · bloque N", para que dos
 * regiones de la misma serie nunca compartan nombre accesible.
 */
export function getBlockLabel(blocks: Series[], block: Series): string {
  const blockNumber = getBlockNumber(blocks, block)
  return blockNumber === null ? block.name : `${block.name} · bloque ${blockNumber}`
}
