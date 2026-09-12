import { describe, expect, it } from 'vitest'
import {
  countCharacters,
  reorderCharactersInSeries,
  reorderSeries,
  removeCharacterFromSeries,
  sortHaremByKakera,
  sumKakera,
} from '../../../src/domain/harem/Harem'
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

function buildHaremWithThreeCharactersInFirstSeries(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' },
          { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png' },
          { id: 'char-3', name: 'Rihoko Sakurai', imageUrl: 'https://x/3.png' },
        ],
      },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [{ id: 'char-4', name: 'Noelle Silva', imageUrl: 'https://x/4.png' }],
      },
    ],
  }
}

describe('reorderCharactersInSeries', () => {
  it('reordena los personajes de la serie indicada según la secuencia de ids recibida', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = reorderCharactersInSeries(harem, 'series-1', ['char-3', 'char-1', 'char-2'])

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-3', 'char-1', 'char-2'])
  })

  it('no afecta a ninguna otra serie del harem (FR-005)', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = reorderCharactersInSeries(harem, 'series-1', ['char-3', 'char-1', 'char-2'])

    const blackClover = next.series.find((series) => series.id === 'series-2')
    expect(blackClover?.characters.map((c) => c.id)).toEqual(['char-4'])
  })

  it('ignora ids de personaje que no corresponden a ningún personaje de esa serie', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = reorderCharactersInSeries(harem, 'series-1', ['char-3', 'fantasma', 'char-1', 'char-2'])

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-3', 'char-1', 'char-2'])
  })

  it('deja al final, en su orden relativo anterior, los personajes que faltan en la secuencia recibida', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = reorderCharactersInSeries(harem, 'series-1', ['char-3'])

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-3', 'char-1', 'char-2'])
  })

  it('devuelve el harem sin cambios si el seriesId no corresponde a ninguna serie', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = reorderCharactersInSeries(harem, 'serie-fantasma', ['char-2', 'char-1'])

    expect(next).toEqual(harem)
  })
})

function buildHaremWithThreeSeries(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      { id: 'series-1', name: 'Amagami', characters: [{ id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' }] },
      { id: 'series-2', name: 'Black Clover', characters: [{ id: 'char-2', name: 'Noelle Silva', imageUrl: 'https://x/2.png' }] },
      { id: 'series-3', name: 'Chainsaw Man', characters: [{ id: 'char-3', name: 'Power', imageUrl: 'https://x/3.png' }] },
    ],
  }
}

describe('reorderSeries', () => {
  it('reordena harem.series según la secuencia de ids recibida', () => {
    const harem = buildHaremWithThreeSeries()

    const next = reorderSeries(harem, ['series-3', 'series-1', 'series-2'])

    expect(next.series.map((series) => series.id)).toEqual(['series-3', 'series-1', 'series-2'])
  })

  it('nunca modifica series.characters de ninguna serie (FR-007)', () => {
    const harem = buildHaremWithThreeSeries()

    const next = reorderSeries(harem, ['series-3', 'series-1', 'series-2'])

    for (const series of harem.series) {
      const reordered = next.series.find((s) => s.id === series.id)
      expect(reordered?.characters).toEqual(series.characters)
    }
  })

  it('ignora ids que no corresponden a ninguna serie existente', () => {
    const harem = buildHaremWithThreeSeries()

    const next = reorderSeries(harem, ['series-2', 'fantasma', 'series-1', 'series-3'])

    expect(next.series.map((series) => series.id)).toEqual(['series-2', 'series-1', 'series-3'])
  })

  it('deja al final, en su orden relativo anterior, las series que faltan en la secuencia recibida', () => {
    const harem = buildHaremWithThreeSeries()

    const next = reorderSeries(harem, ['series-3'])

    expect(next.series.map((series) => series.id)).toEqual(['series-3', 'series-1', 'series-2'])
  })

  it('tolera una lista vacía sin lanzar, dejando el orden anterior', () => {
    const harem = buildHaremWithThreeSeries()

    const next = reorderSeries(harem, [])

    expect(next.series.map((series) => series.id)).toEqual(['series-1', 'series-2', 'series-3'])
  })
})

describe('sortHaremByKakera', () => {
  it('ordena los personajes de una serie de forma descendente por kakera', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'A', imageUrl: 'https://x/1.png', kakera: 5 },
            { id: 'char-2', name: 'B', imageUrl: 'https://x/2.png', kakera: 20 },
            { id: 'char-3', name: 'C', imageUrl: 'https://x/3.png', kakera: 1 },
          ],
        },
      ],
    }

    const next = sortHaremByKakera(harem, 'desc')

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-2', 'char-1', 'char-3'])
  })

  it('ordena los personajes de una serie de forma ascendente por kakera', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'A', imageUrl: 'https://x/1.png', kakera: 5 },
            { id: 'char-2', name: 'B', imageUrl: 'https://x/2.png', kakera: 20 },
            { id: 'char-3', name: 'C', imageUrl: 'https://x/3.png', kakera: 1 },
          ],
        },
      ],
    }

    const next = sortHaremByKakera(harem, 'asc')

    const amagami = next.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-3', 'char-1', 'char-2'])
  })

  it('ordena las series entre sí por la suma de kakera de sus personajes', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [{ id: 'char-1', name: 'A', imageUrl: 'https://x/1.png', kakera: 10 }],
        },
        {
          id: 'series-2',
          name: 'Black Clover',
          characters: [{ id: 'char-2', name: 'B', imageUrl: 'https://x/2.png', kakera: 50 }],
        },
        {
          id: 'series-3',
          name: 'Chainsaw Man',
          characters: [{ id: 'char-3', name: 'C', imageUrl: 'https://x/3.png', kakera: 25 }],
        },
      ],
    }

    const desc = sortHaremByKakera(harem, 'desc')
    expect(desc.series.map((series) => series.id)).toEqual(['series-2', 'series-3', 'series-1'])

    const asc = sortHaremByKakera(harem, 'asc')
    expect(asc.series.map((series) => series.id)).toEqual(['series-1', 'series-3', 'series-2'])
  })

  it('mantiene el orden relativo original entre series con la misma suma de kakera, en ambas direcciones', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [{ id: 'char-1', name: 'A', imageUrl: 'https://x/1.png', kakera: 30 }],
        },
        {
          id: 'series-2',
          name: 'Black Clover',
          characters: [{ id: 'char-2', name: 'B', imageUrl: 'https://x/2.png', kakera: 30 }],
        },
      ],
    }

    expect(sortHaremByKakera(harem, 'desc').series.map((series) => series.id)).toEqual(['series-1', 'series-2'])
    expect(sortHaremByKakera(harem, 'asc').series.map((series) => series.id)).toEqual(['series-1', 'series-2'])
  })

  it('trata un personaje sin kakera como 0 (FR-013)', () => {
    const harem: Harem = {
      profileId: 'profile-1',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'A', imageUrl: 'https://x/1.png', kakera: 5 },
            { id: 'char-2', name: 'B', imageUrl: 'https://x/2.png' },
          ],
        },
      ],
    }

    const desc = sortHaremByKakera(harem, 'desc')
    const amagami = desc.series.find((series) => series.id === 'series-1')
    expect(amagami?.characters.map((c) => c.id)).toEqual(['char-1', 'char-2'])
  })

  it('no muta el harem recibido', () => {
    const harem = buildHaremWithThreeSeries()
    const snapshot = JSON.parse(JSON.stringify(harem))

    sortHaremByKakera(harem, 'desc')

    expect(harem).toEqual(snapshot)
  })

  it('conserva el mismo conjunto de ids de series y de personajes que la entrada', () => {
    const harem = buildHaremWithThreeCharactersInFirstSeries()

    const next = sortHaremByKakera(harem, 'desc')

    expect(new Set(next.series.map((series) => series.id))).toEqual(new Set(harem.series.map((series) => series.id)))
    const originalCharacterIds = harem.series.flatMap((series) => series.characters.map((c) => c.id))
    const nextCharacterIds = next.series.flatMap((series) => series.characters.map((c) => c.id))
    expect(new Set(nextCharacterIds)).toEqual(new Set(originalCharacterIds))
  })

  it('tolera un harem sin series', () => {
    const harem: Harem = { profileId: 'profile-1', series: [] }

    const next = sortHaremByKakera(harem, 'desc')

    expect(next.series).toEqual([])
  })
})
