import { describe, expect, it } from 'vitest'
import { formatSortCommands } from '../../../src/domain/parsing/formatSortCommand'
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

// Con un límite holgado todo entra en un solo comando.
const single = (harem: Harem) => formatSortCommands(harem, 2000)

describe('formatSortCommands', () => {
  it('devuelve [] cuando el harem no tiene ninguna serie', () => {
    expect(single({ profileId: 'p', series: [] })).toEqual([])
  })

  it('devuelve [] cuando todas las series están vacías', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [{ id: 's1', name: 'Vacía', characters: [] }],
    }

    expect(single(harem)).toEqual([])
  })

  it('genera "$sm <nombre>" sin separador para un único personaje', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [{ id: 's1', name: 'Amagami', characters: [{ id: 'c1', name: 'Esdeath', imageUrl: 'https://x/1.png' }] }],
    }

    expect(single(harem)).toEqual(['$sm Esdeath'])
  })

  it('respeta el orden serie-por-serie y personaje-por-personaje, con el separador compacto "$"', () => {
    const harem = buildHarem()

    expect(single(harem)).toEqual(['$sm Esdeath$Falin Touden$Fleki'])
  })

  it('omite una serie sin personajes intercalada, sin dejar separadores duplicados', () => {
    const harem = buildHarem()
    harem.series.splice(1, 0, { id: 'series-vacia', name: 'Vacía', characters: [] })

    expect(single(harem)).toEqual(['$sm Esdeath$Falin Touden$Fleki'])
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

    expect(single(harem)).toEqual(['$sm Ka$h  Weirdo$Normal'])
  })

  it('refleja un nuevo orden tras reordenar series y personajes (Principio II)', () => {
    let harem = buildHarem()
    harem = reorderSeries(harem, ['series-black-clover', 'series-amagami'])
    harem = reorderCharactersInSeries(harem, 'series-amagami', ['char-2', 'char-1'])

    expect(single(harem)).toEqual(['$sm Fleki$Falin Touden$Esdeath'])
  })

  describe('división en varios mensajes', () => {
    function haremOf(names: string[]): Harem {
      return {
        profileId: 'p',
        series: [{ id: 's1', name: 'Serie', characters: names.map((name, i) => ({ id: `c${i}`, name, imageUrl: 'https://x' })) }],
      }
    }

    it('parte en comandos de hasta maxLength sin cortar nombres, en orden de envío (los últimos nombres primero)', () => {
      // "$sm AAAA$BBBB" = 13 caracteres; con límite 13 entran 2 nombres por comando.
      const commands = formatSortCommands(haremOf(['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE']), 13)

      expect(commands).toEqual(['$sm EEEE', '$sm CCCC$DDDD', '$sm AAAA$BBBB'])
      commands.forEach((command) => expect(command.length).toBeLessThanOrEqual(13))
    })

    it('el último comando que se manda lleva los primeros nombres del harem', () => {
      const commands = formatSortCommands(haremOf(['AAAA', 'BBBB', 'CCCC']), 13)
      expect(commands.at(-1)).toBe('$sm AAAA$BBBB')
    })

    it('ningún nombre se pierde ni se duplica al partir', () => {
      const names = Array.from({ length: 300 }, (_, i) => `Personaje número ${i}`)
      const commands = formatSortCommands(haremOf(names), 2000)

      expect(commands.length).toBeGreaterThan(1)
      commands.forEach((command) => expect(command.length).toBeLessThanOrEqual(2000))
      const sentOrder = [...commands].reverse().flatMap((command) => command.slice('$sm '.length).split('$'))
      expect(sentOrder).toEqual(names)
    })

    it('con el límite de Nitro (4000) entran más nombres por mensaje', () => {
      const names = Array.from({ length: 300 }, (_, i) => `Personaje número ${i}`)
      expect(formatSortCommands(haremOf(names), 4000).length).toBeLessThan(formatSortCommands(haremOf(names), 2000).length)
    })

    it('un nombre más largo que el límite va solo en su comando, sin perderse', () => {
      expect(formatSortCommands(haremOf(['A', 'NombreMuyLargo', 'B']), 8)).toEqual(['$sm B', '$sm NombreMuyLargo', '$sm A'])
    })
  })
})
