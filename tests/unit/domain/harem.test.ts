import { describe, expect, it } from 'vitest'
import { countCharacters, removeCharacterFromSeries, sumKakera } from '../../../src/domain/harem/Harem'
import type { Harem } from '../../../src/domain/harem/Harem'

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' },
          { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png' },
        ],
      },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [{ id: 'char-3', name: 'Noelle Silva', imageUrl: 'https://x/3.png' }],
      },
    ],
  }
}

describe('removeCharacterFromSeries', () => {
  it('elimina el personaje pero conserva la serie si quedan otros personajes', () => {
    const harem = buildHarem()

    const next = removeCharacterFromSeries(harem, 'series-1', 'char-1')

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-2'])
  })

  it('elimina la serie por completo cuando se queda sin ningún personaje (FR-022)', () => {
    const harem = buildHarem()

    const next = removeCharacterFromSeries(harem, 'series-2', 'char-3')

    expect(next.series.map((series) => series.id)).toEqual(['series-1'])
    expect(next.series.some((series) => series.id === 'series-2')).toBe(false)
  })

  it('no afecta a otras series del harem', () => {
    const harem = buildHarem()

    const next = removeCharacterFromSeries(harem, 'series-2', 'char-3')

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters).toHaveLength(2)
  })
})

describe('countCharacters', () => {
  it('cuenta los personajes de todas las series del harem (User Story 3 de 002)', () => {
    expect(countCharacters(buildHarem())).toBe(3)
  })

  it('devuelve 0 para un harem sin series', () => {
    expect(countCharacters({ profileId: 'x', series: [] })).toBe(0)
  })
})

describe('sumKakera', () => {
  it('suma el kakera de todos los personajes del harem', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png', kakera: 49 },
            { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png', kakera: 46 },
          ],
        },
      ],
    }

    expect(sumKakera(harem)).toBe(95)
  })

  it('trata un personaje sin kakera como 0, sin romperse (User Story 3 de 002)', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [{ id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' }],
        },
      ],
    }

    expect(sumKakera(harem)).toBe(0)
  })
})
