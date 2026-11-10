import { describe, expect, it } from 'vitest'
import { removeCharacters, type Harem } from '../../../src/domain/harem/Harem'
import { formatDivorceCommands } from '../../../src/domain/parsing/formatDivorceCommand'

const character = (name: string) => ({ id: name, name, imageUrl: `https://x/${name}.png` })

function buildHarem(): Harem {
  return {
    profileId: 'p',
    series: [
      { id: 's1', name: 'Amagami', visibleCount: 2, characters: ['Haruka', 'Ai', 'Rihoko', 'Kaoru'].map(character) },
      { id: 's1b', name: 'Amagami', detached: true, characters: [character('Sae')] },
      { id: 's2', name: 'Black Clover', characters: [character('Noelle')] },
    ],
  }
}

describe('formatDivorceCommands (014)', () => {
  it('arma un solo $divorce con los nombres separados por $', () => {
    expect(formatDivorceCommands(['Rem', 'Ram'], 2000)).toEqual(['$divorce Rem$Ram'])
  })

  it('devuelve [] sin nombres', () => {
    expect(formatDivorceCommands([], 2000)).toEqual([])
  })

  it('parte en varios mensajes sin cortar nombres, en el orden de marcado', () => {
    expect(formatDivorceCommands(['Aaaa', 'Bbbb', 'Cccc'], 18)).toEqual(['$divorce Aaaa$Bbbb', '$divorce Cccc'])
  })
})

describe('removeCharacters (014)', () => {
  it('quita a los personajes indicados de cualquier bloque', () => {
    const next = removeCharacters(buildHarem(), ['Ai', 'Noelle'])
    expect(next.series.map((series) => series.characters.map((c) => c.name))).toEqual([
      ['Haruka', 'Rihoko', 'Kaoru'],
      ['Sae'],
    ])
  })

  it('elimina bloques vacíos y promueve un principal si el principal desaparece', () => {
    const next = removeCharacters(buildHarem(), ['Haruka', 'Ai', 'Rihoko', 'Kaoru'])
    expect(next.series[0]).toMatchObject({ id: 's1b', name: 'Amagami' })
    expect(next.series[0].detached).toBeUndefined()
  })

  it('borra visibleCount cuando ya alcanza a todos los que quedan', () => {
    expect(removeCharacters(buildHarem(), ['Ai']).series[0].visibleCount).toBe(2)
    expect('visibleCount' in removeCharacters(buildHarem(), ['Ai', 'Rihoko']).series[0]).toBe(false)
  })

  it('devuelve el mismo harem si ningún id coincide', () => {
    const harem = buildHarem()
    expect(removeCharacters(harem, ['nadie'])).toBe(harem)
  })
})
