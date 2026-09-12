import { describe, expect, it } from 'vitest'
import { formatSortCommand } from '../../../src/domain/parsing/formatSortCommand'
import { reorderCharactersInSeries, reorderSeries } from '../../../src/domain/harem/Harem'
import type { Harem } from '../../../src/domain/harem/Harem'

function buildHarem(): Harem {
  return {
    profileId: 'rodoifin',
    series: [
      {
        id: 'series-amagami',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Esdeath', imageUrl: 'https://mudae.net/x/1.png' },
          { id: 'char-2', name: 'Falin Touden', imageUrl: 'https://mudae.net/x/2.png' },
        ],
      },
      {
        id: 'series-black-clover',
        name: 'Black Clover',
        characters: [
          { id: 'char-3', name: 'Fleki', imageUrl: 'https://mudae.net/x/3.png' },
        ],
      },
    ],
  }
}

describe('formatSortCommand', () => {
  it('devuelve null cuando el harem no tiene ninguna serie', () => {
    expect(formatSortCommand({ profileId: 'p', series: [] })).toBeNull()
  })

  it('devuelve null cuando todas las series están vacías', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [{ id: 's1', name: 'Vacía', characters: [] }],
    }

    expect(formatSortCommand(harem)).toBeNull()
  })

  it('genera "$sm <nombre>" sin separador para un único personaje', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [{ id: 's1', name: 'Amagami', characters: [{ id: 'c1', name: 'Esdeath', imageUrl: 'https://x/1.png' }] }],
    }

    expect(formatSortCommand(harem)).toBe('$sm Esdeath')
  })

  it('respeta el orden serie-por-serie y personaje-por-personaje', () => {
    const harem = buildHarem()

    expect(formatSortCommand(harem)).toBe('$sm Esdeath $ Falin Touden $ Fleki')
  })

  it('omite una serie sin personajes intercalada, sin dejar separadores duplicados', () => {
    const harem = buildHarem()
    harem.series.splice(1, 0, { id: 'series-vacia', name: 'Vacía', characters: [] })

    expect(formatSortCommand(harem)).toBe('$sm Esdeath $ Falin Touden $ Fleki')
  })

  it('preserva un nombre con "$" y espacios extra tal cual, sin escaparlo ni recortarlo', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        {
          id: 's1',
          name: 'Serie',
          characters: [
            { id: 'c1', name: 'Ka$h  Weirdo', imageUrl: 'https://x/1.png' },
            { id: 'c2', name: 'Normal', imageUrl: 'https://x/2.png' },
          ],
        },
      ],
    }

    expect(formatSortCommand(harem)).toBe('$sm Ka$h  Weirdo $ Normal')
  })

  it('refleja un nuevo orden tras reordenar series y personajes (Principio II)', () => {
    let harem = buildHarem()
    harem = reorderSeries(harem, ['series-black-clover', 'series-amagami'])
    harem = reorderCharactersInSeries(harem, 'series-amagami', ['char-2', 'char-1'])

    expect(formatSortCommand(harem)).toBe('$sm Fleki $ Falin Touden $ Esdeath')
  })
})
