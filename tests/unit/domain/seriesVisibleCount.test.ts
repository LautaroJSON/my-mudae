import { describe, expect, it } from 'vitest'
import { setSeriesVisibleCount, type Harem } from '../../../src/domain/harem/Harem'
import { syncHarem } from '../../../src/domain/harem/syncHarem'

function buildHarem(visibleCount?: number): Harem {
  return {
    profileId: 'p',
    series: [
      {
        id: 's1',
        name: 'Amagami',
        ...(visibleCount !== undefined ? { visibleCount } : {}),
        characters: ['Haruka', 'Ai', 'Rihoko', 'Kaoru'].map((name) => ({ id: name, name, imageUrl: `https://x/${name}.png` })),
      },
      { id: 's2', name: 'Black Clover', characters: [{ id: 'Noelle', name: 'Noelle', imageUrl: 'https://x/n.png' }] },
    ],
  }
}

describe('setSeriesVisibleCount (013)', () => {
  it('guarda la cantidad pedida solo en el bloque indicado', () => {
    const next = setSeriesVisibleCount(buildHarem(), 's1', 2)
    expect(next.series[0].visibleCount).toBe(2)
    expect(next.series[1].visibleCount).toBeUndefined()
  })

  it('acota a un mínimo de un personaje', () => {
    expect(setSeriesVisibleCount(buildHarem(), 's1', 0).series[0].visibleCount).toBe(1)
    expect(setSeriesVisibleCount(buildHarem(), 's1', -3).series[0].visibleCount).toBe(1)
  })

  it('borra el campo con null o con un valor que alcanza a todos los personajes', () => {
    expect('visibleCount' in setSeriesVisibleCount(buildHarem(2), 's1', null).series[0]).toBe(false)
    expect('visibleCount' in setSeriesVisibleCount(buildHarem(2), 's1', 4).series[0]).toBe(false)
    expect('visibleCount' in setSeriesVisibleCount(buildHarem(2), 's1', 99).series[0]).toBe(false)
  })

  it('devuelve el mismo harem si nada cambia o la serie no existe', () => {
    const harem = buildHarem(2)
    expect(setSeriesVisibleCount(harem, 's1', 2)).toBe(harem)
    expect(setSeriesVisibleCount(harem, 'nope', 1)).toBe(harem)
  })
})

describe('syncHarem conserva el largo elegido (013)', () => {
  it('mantiene visibleCount del bloque al re-pegar', () => {
    const parsed = [
      { name: 'Amagami', characters: ['Haruka', 'Ai', 'Rihoko', 'Kaoru', 'Sae'].map((name) => ({ name, imageUrl: `https://x/${name}.png` })) },
    ]
    const next = syncHarem(buildHarem(2), parsed)
    expect(next.series.find((series) => series.name === 'Amagami')?.visibleCount).toBe(2)
  })

  it('lo descarta si el bloque quedó con igual o menos personajes', () => {
    const parsed = [{ name: 'Amagami', characters: ['Haruka', 'Ai'].map((name) => ({ name, imageUrl: `https://x/${name}.png` })) }]
    const next = syncHarem(buildHarem(3), parsed)
    expect(next.series.find((series) => series.name === 'Amagami')?.visibleCount).toBeUndefined()
  })
})
