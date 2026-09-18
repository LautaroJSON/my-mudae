import { describe, expect, it } from 'vitest'
import { syncHarem } from '../../../src/domain/harem/syncHarem'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { ParsedSeries } from '../../../src/domain/parsing/parseHaremMessage'

function buildHarem(): Harem {
  return {
    profileId: 'rodoifin',
    series: [
      {
        id: 'series-amagami',
        name: 'Amagami',
        characters: [
          {
            id: 'char-haruka',
            name: 'Haruka Morishima',
            imageUrl: 'https://mudae.net/uploads/1/haruka.png',
            kakera: 49,
            claimRank: '#15,140',
          },
          {
            id: 'char-ai',
            name: 'Ai Nanasaki',
            imageUrl: 'https://mudae.net/uploads/2/ai.png',
            kakera: 46,
            claimRank: '#18,351',
          },
        ],
      },
      {
        id: 'series-blackclover',
        name: 'Black Clover',
        characters: [
          {
            id: 'char-noelle',
            name: 'Noelle Silva',
            imageUrl: 'https://mudae.net/uploads/3/noelle.png',
            kakera: 479,
            claimRank: '#182',
          },
        ],
      },
    ],
  }
}

describe('syncHarem', () => {
  it('actualiza un personaje existente (mismo claim rank) conservando su id, agrega uno nuevo, y elimina el que ya no aparece', () => {
    const current = buildHarem()
    const parsed: ParsedSeries[] = [
      {
        name: 'Amagami',
        characters: [
          // mismo claim rank que Haruka, con kakera distinto → se actualiza, mismo id
          { claimRank: '#15,140', name: 'Haruka Morishima', kakera: 60, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
          // claim rank nuevo → se agrega
          { claimRank: '#99,999', name: 'Rihoko Sakurai', kakera: 35, imageUrl: 'https://mudae.net/uploads/4/rihoko.png' },
          // Ai (#18,351) no aparece más → se elimina
        ],
      },
      // Black Clover (Noelle, #182) no aparece más → toda la serie se elimina
    ]

    const result = syncHarem(current, parsed)

    expect(result.profileId).toBe('rodoifin')
    expect(result.series).toHaveLength(1)
    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.id).toBe('series-amagami')
    expect(amagami?.characters).toHaveLength(2)

    const haruka = amagami?.characters.find((character) => character.claimRank === '#15,140')
    expect(haruka).toMatchObject({ id: 'char-haruka', kakera: 60 })

    const rihoko = amagami?.characters.find((character) => character.claimRank === '#99,999')
    expect(rihoko).toBeDefined()
    expect(rihoko?.id).not.toBe('char-haruka')

    expect(amagami?.characters.some((character) => character.claimRank === '#18,351')).toBe(false)
    expect(result.series.some((series) => series.name === 'Black Clover')).toBe(false)
  })

  it('sin ningún claim rank en común, reemplaza el 100% de los personajes', () => {
    const current = buildHarem()
    const parsed: ParsedSeries[] = [
      {
        name: 'Fairy Tail',
        characters: [{ claimRank: '#50', name: 'Erza Scarlet', kakera: 830, imageUrl: 'https://mudae.net/uploads/5/erza.png' }],
      },
    ]

    const result = syncHarem(current, parsed)

    expect(result.series).toHaveLength(1)
    expect(result.series[0].name).toBe('Fairy Tail')
    expect(result.series[0].characters).toHaveLength(1)
    expect(result.series[0].characters[0].claimRank).toBe('#50')
  })

  it('pegado idéntico al harem actual no cambia ningún id', () => {
    const current = buildHarem()
    const parsed: ParsedSeries[] = current.series.map((series) => ({
      name: series.name,
      characters: series.characters.map((character) => ({
        claimRank: character.claimRank,
        name: character.name,
        kakera: character.kakera,
        imageUrl: character.imageUrl,
      })),
    }))

    const result = syncHarem(current, parsed)

    expect(result).toEqual(current)
  })

  it('conserva el orden manual existente (series y personajes) aunque el pegado nuevo venga en otro orden', () => {
    const current = buildHarem() // orden actual: [Amagami(Haruka, Ai), Black Clover(Noelle)]
    const parsed: ParsedSeries[] = [
      // el pegado trae Black Clover primero y Amagami con Ai antes que Haruka
      {
        name: 'Black Clover',
        characters: [{ claimRank: '#182', name: 'Noelle Silva', kakera: 479, imageUrl: 'https://mudae.net/uploads/3/noelle.png' }],
      },
      {
        name: 'Amagami',
        characters: [
          { claimRank: '#18,351', name: 'Ai Nanasaki', kakera: 46, imageUrl: 'https://mudae.net/uploads/2/ai.png' },
          { claimRank: '#15,140', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
        ],
      },
    ]

    const result = syncHarem(current, parsed)

    expect(result.series.map((series) => series.name)).toEqual(['Amagami', 'Black Clover'])
    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.characters.map((character) => character.claimRank)).toEqual(['#15,140', '#18,351'])
  })

  it('agrega series y personajes nuevos al final, después de los ya existentes en su orden previo', () => {
    const current = buildHarem() // orden actual: [Amagami(Haruka, Ai), Black Clover(Noelle)]
    const parsed: ParsedSeries[] = [
      {
        name: 'Amagami',
        characters: [
          { claimRank: '#15,140', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
          // personaje nuevo, debe ir al final de Amagami (después de Haruka)
          { claimRank: '#77,000', name: 'Rihoko Sakurai', kakera: 35, imageUrl: 'https://mudae.net/uploads/4/rihoko.png' },
          { claimRank: '#18,351', name: 'Ai Nanasaki', kakera: 46, imageUrl: 'https://mudae.net/uploads/2/ai.png' },
        ],
      },
      { name: 'Black Clover', characters: [{ claimRank: '#182', name: 'Noelle Silva', kakera: 479, imageUrl: 'https://mudae.net/uploads/3/noelle.png' }] },
      // serie nueva, debe ir al final
      { name: 'Fairy Tail', characters: [{ claimRank: '#50', name: 'Erza Scarlet', kakera: 830, imageUrl: 'https://mudae.net/uploads/5/erza.png' }] },
    ]

    const result = syncHarem(current, parsed)

    expect(result.series.map((series) => series.name)).toEqual(['Amagami', 'Black Clover', 'Fairy Tail'])
    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.characters.map((character) => character.claimRank)).toEqual(['#15,140', '#18,351', '#77,000'])
  })

  it('un personaje existente no se trata como nuevo cuando cambia su claim rank (ranking global de Mudae, no un id de esa copia)', () => {
    const current = buildHarem() // orden actual: [Amagami(Haruka, Ai), Black Clover(Noelle)]
    const parsed: ParsedSeries[] = [
      {
        name: 'Amagami',
        characters: [
          // mismo personaje, pero el "#N" de Mudae se movió (le puede
          // pasar a cualquiera sin que el usuario reclame/pierda nada)
          { claimRank: '#20,000', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
          { claimRank: '#18,351', name: 'Ai Nanasaki', kakera: 46, imageUrl: 'https://mudae.net/uploads/2/ai.png' },
        ],
      },
      { name: 'Black Clover', characters: [{ claimRank: '#182', name: 'Noelle Silva', kakera: 479, imageUrl: 'https://mudae.net/uploads/3/noelle.png' }] },
    ]

    const result = syncHarem(current, parsed)

    expect(result.series.map((series) => series.name)).toEqual(['Amagami', 'Black Clover'])
    const amagami = result.series.find((series) => series.name === 'Amagami')
    // conserva el id y el orden de Haruka (sigue primera) pese al claim rank distinto
    expect(amagami?.characters.map((character) => character.id)).toEqual(['char-haruka', 'char-ai'])
    expect(amagami?.characters[0].claimRank).toBe('#20,000')
  })

  it('dos copias del mismo personaje (mismo nombre, distinto claim rank) se emparejan por orden de aparición, no colapsan a una sola', () => {
    const current: Harem = {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-amagami',
          name: 'Amagami',
          characters: [
            { id: 'char-copy-1', name: 'Haruka Morishima', imageUrl: 'https://mudae.net/uploads/1/haruka.png', kakera: 49, claimRank: '#100' },
            { id: 'char-copy-2', name: 'Haruka Morishima', imageUrl: 'https://mudae.net/uploads/1/haruka.png', kakera: 30, claimRank: '#200' },
          ],
        },
      ],
    }
    const parsed: ParsedSeries[] = [
      {
        name: 'Amagami',
        characters: [
          { claimRank: '#150', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
          { claimRank: '#250', name: 'Haruka Morishima', kakera: 30, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
        ],
      },
    ]

    const result = syncHarem(current, parsed)

    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.characters.map((character) => character.id)).toEqual(['char-copy-1', 'char-copy-2'])
  })

  it('una serie que queda sin personajes tras la sincronización no aparece en el resultado', () => {
    const current = buildHarem()
    const parsed: ParsedSeries[] = [
      {
        name: 'Amagami',
        characters: [
          { claimRank: '#15,140', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/1/haruka.png' },
          { claimRank: '#18,351', name: 'Ai Nanasaki', kakera: 46, imageUrl: 'https://mudae.net/uploads/2/ai.png' },
        ],
      },
      // Black Clover se queda sin personajes
    ]

    const result = syncHarem(current, parsed)

    expect(result.series.map((series) => series.name)).toEqual(['Amagami'])
  })
})
