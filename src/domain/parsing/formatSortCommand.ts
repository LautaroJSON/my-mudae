import type { Harem } from '../harem/Harem'

const SORT_COMMAND_PREFIX = '$sm'
const NAME_SEPARATOR = ' $ '

/**
 * Serializa el harem al comando `$sm <nombre> $ <nombre> $ ...` que
 * reconoce el bot de Mudae en Discord para reordenar el harem por
 * claims (ver contracts/format-sort-command.md). Función pura de
 * `domain/`: deriva el orden directamente de `harem.series` (la misma
 * fuente que renderiza `HaremView`/`SeriesGroup`), nunca de una copia,
 * para cumplir el Principio II (Orden = Comando) de la constitución.
 * Devuelve `null` en vez de un comando sin nombres cuando el harem no
 * tiene ningún personaje.
 */
export function formatSortCommand(harem: Harem): string | null {
  const names = harem.series.flatMap((series) => series.characters.map((character) => character.name))

  if (names.length === 0) {
    return null
  }

  return `${SORT_COMMAND_PREFIX} ${names.join(NAME_SEPARATOR)}`
}
