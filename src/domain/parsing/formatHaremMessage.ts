import type { Profile } from '../profile/Profile'
import type { Character } from '../harem/Character'

/**
 * Serializa el harem de un perfil al mismo formato de texto que
 * `parseHaremMessage` reconoce como entrada (función inversa, ver
 * contracts/format-harem-message.md). Función pura de `domain/`: no
 * depende de React/`styled-components`/`localStorage`/`navigator`.
 */

function normalizeClaimRank(character: Character, positionInSeries: number): string {
  if (character.claimRank) {
    return character.claimRank.startsWith('#') ? character.claimRank.slice(1) : character.claimRank
  }

  // Sin claimRank persistido (el tipo lo permite, aunque hoy el único
  // flujo de creación de personajes -pegado- siempre lo completa): se
  // sintetiza por posición para que la línea siga siendo parseable.
  return String(positionInSeries)
}

function formatCharacterLine(character: Character, positionInSeries: number): string {
  const rank = normalizeClaimRank(character, positionInSeries)

  if (character.kakera !== undefined) {
    return `#${rank} - ${character.name} ${character.kakera} ka - ${character.imageUrl}`
  }

  return `#${rank} - ${character.name} - ${character.imageUrl}`
}

export function formatHaremMessage(profile: Profile): string {
  const lines: string[] = [`${profile.alias}'s harem`]

  for (const series of profile.harem.series) {
    if (series.characters.length === 0) {
      continue
    }

    const count = series.characters.length
    lines.push(`${series.name} - ${count}/${count}`)

    series.characters.forEach((character, index) => {
      lines.push(formatCharacterLine(character, index + 1))
    })
  }

  return lines.join('\n')
}
