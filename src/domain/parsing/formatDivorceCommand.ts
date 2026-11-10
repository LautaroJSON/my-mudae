import { splitNamesIntoCommands } from './formatSortCommand'

const DIVORCE_COMMAND_PREFIX = '$divorce '

/**
 * Comandos `$divorce <nombre>$<nombre>$...` para divorciar de una vez a
 * los personajes marcados (014), partidos para no pasarse del largo de un
 * mensaje de Discord. A diferencia de `$sm`, el orden de envío no importa:
 * se devuelven en el mismo orden en que se marcaron. `[]` sin nombres.
 */
export function formatDivorceCommands(names: string[], maxLength: number): string[] {
  return splitNamesIntoCommands(DIVORCE_COMMAND_PREFIX, names, maxLength)
}
