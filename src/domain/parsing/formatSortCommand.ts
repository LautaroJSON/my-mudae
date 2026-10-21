import type { Harem } from '../harem/Harem'

const SORT_COMMAND_PREFIX = '$sm '
// Sin espacios alrededor: Mudae acepta `A$B`, y cada carácter cuenta
// contra el límite de largo de un mensaje de Discord.
const NAME_SEPARATOR = '$'

/** Largo máximo de un mensaje de Discord sin Nitro / con Nitro. */
export const DISCORD_MESSAGE_LIMITS = [2000, 4000] as const
export type DiscordMessageLimit = (typeof DISCORD_MESSAGE_LIMITS)[number]

/**
 * Serializa el harem a los comandos `$sm <nombre>$<nombre>$...` que
 * reconoce el bot de Mudae en Discord para reordenar el harem (ver
 * contracts/format-sort-command.md de 009). Función pura de `domain/`:
 * deriva el orden directamente de `harem.series` (la misma fuente que
 * renderiza `HaremView`/`SeriesGroup`), nunca de una copia, para cumplir
 * el Principio II (Orden = Comando) de la constitución.
 *
 * Un harem largo no entra en un solo mensaje de Discord (`maxLength`),
 * así que se parte en varios comandos sin cortar ningún nombre. `$sm`
 * sube los personajes que recibe al principio del harem, en ese orden, y
 * deja al resto debajo; por eso los comandos se devuelven **en orden de
 * envío**: primero el que lleva los últimos nombres y al final el que
 * lleva los primeros, así cada mensaje empuja su grupo arriba del que
 * se mandó antes y el resultado es el orden completo. Un único nombre
 * más largo que `maxLength` (no debería pasar) va solo en su comando,
 * aunque lo exceda, en vez de perderse.
 *
 * Devuelve `[]` cuando el harem no tiene ningún personaje, en vez de un
 * comando sin nombres.
 */
export function formatSortCommands(harem: Harem, maxLength: number): string[] {
  const names = harem.series.flatMap((series) => series.characters.map((character) => character.name))

  const commands: string[] = []
  let current = ''
  for (const name of names) {
    const candidate = current ? `${current}${NAME_SEPARATOR}${name}` : `${SORT_COMMAND_PREFIX}${name}`
    if (current && candidate.length > maxLength) {
      commands.push(current)
      current = `${SORT_COMMAND_PREFIX}${name}`
    } else {
      current = candidate
    }
  }
  if (current) {
    commands.push(current)
  }

  return commands.reverse()
}
