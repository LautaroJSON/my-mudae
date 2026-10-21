import { describe, expect, it } from 'vitest'
import { ensurePrincipalBlocks, getSeriesBlocks, mergeSeriesBlock, moveCharacterToBlock, type Harem } from '../../../src/domain/harem/Harem'
import { syncHarem } from '../../../src/domain/harem/syncHarem'
import type { Character } from '../../../src/domain/harem/Character'
import type { ParsedSeries } from '../../../src/domain/parsing/parseHaremMessage'

function character(name: string): Character {
  return { id: `char-${name}`, name, imageUrl: `https://x/${name}.png`, kakera: 10, claimRank: '#1' }
}

function parsed(name: string, characterNames: string[]): ParsedSeries {
  return {
    name,
    characters: characterNames.map((characterName) => ({
      name: characterName,
      imageUrl: `https://x/${characterName}.png`,
      kakera: 10,
      claimRank: '#1',
    })),
  }
}

function names(harem: Harem): string[][] {
  return harem.series.map((series) => series.characters.map((c) => c.name))
}

// Serie X = [A, B, C] y serie Y = [Z].
function buildHarem(): Harem {
  return {
    profileId: 'p',
    series: [
      { id: 'x', name: 'X', characters: [character('A'), character('B'), character('C')] },
      { id: 'y', name: 'Y', characters: [character('Z')] },
    ],
  }
}

describe('moveCharacterToBlock', () => {
  it('con target null crea un bloque separado nuevo de la misma serie, justo después del de origen', () => {
    const result = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)

    expect(names(result)).toEqual([['A', 'B'], ['C'], ['Z']])
    expect(result.series[1]).toMatchObject({ name: 'X', detached: true })
    expect(result.series[1].id).not.toBe('x')
    expect(result.series[0].detached).toBeUndefined()
  })

  it('mueve al final de otro bloque existente de la misma serie (bloque separado con varios personajes)', () => {
    const withD = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)
    const detachedId = withD.series[1].id

    const result = moveCharacterToBlock(withD, 'x', 'char-B', detachedId)

    expect(names(result)).toEqual([['A'], ['C', 'B'], ['Z']])
  })

  it('nunca mueve a un bloque de otra serie (FR-005)', () => {
    const harem = buildHarem()
    expect(moveCharacterToBlock(harem, 'x', 'char-C', 'y')).toBe(harem)
  })

  it('ignora ids desconocidos', () => {
    const harem = buildHarem()
    expect(moveCharacterToBlock(harem, 'nope', 'char-C', null)).toBe(harem)
    expect(moveCharacterToBlock(harem, 'x', 'nope', null)).toBe(harem)
    expect(moveCharacterToBlock(harem, 'x', 'char-C', 'nope')).toBe(harem)
  })

  it('si el principal se vacía, el bloque que queda pasa a ser el principal', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        { id: 'x', name: 'X', characters: [character('A')] },
        { id: 'x2', name: 'X', characters: [character('B')], detached: true },
      ],
    }

    const result = moveCharacterToBlock(harem, 'x', 'char-A', 'x2')

    expect(result.series).toHaveLength(1)
    expect(result.series[0]).toMatchObject({ id: 'x2', name: 'X' })
    expect(result.series[0].detached).toBeUndefined()
    expect(names(result)).toEqual([['B', 'A']])
  })
})

describe('mergeSeriesBlock', () => {
  it('pasa los personajes del bloque separado al final del principal y elimina el bloque', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        { id: 'x2', name: 'X', characters: [character('D'), character('E')], detached: true },
        { id: 'y', name: 'Y', characters: [character('Z')] },
        { id: 'x', name: 'X', characters: [character('A')] },
      ],
    }

    const result = mergeSeriesBlock(harem, 'x2')

    expect(result.series.map((series) => series.id)).toEqual(['y', 'x'])
    expect(names(result)).toEqual([['Z'], ['A', 'D', 'E']])
  })

  it('no hace nada sobre el bloque principal o un id desconocido', () => {
    const harem = buildHarem()
    expect(mergeSeriesBlock(harem, 'x')).toBe(harem)
    expect(mergeSeriesBlock(harem, 'nope')).toBe(harem)
  })
})

describe('getSeriesBlocks / ensurePrincipalBlocks', () => {
  it('devuelve todos los bloques de la misma serie en orden del harem', () => {
    const harem = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)
    const blocks = getSeriesBlocks(harem, harem.series[1].id)
    expect(blocks.map((block) => block.characters.map((c) => c.name))).toEqual([['A', 'B'], ['C']])
  })

  it('promueve solo el primer bloque separado de una serie sin principal', () => {
    const result = ensurePrincipalBlocks([
      { id: 'x2', name: 'X', characters: [character('B')], detached: true },
      { id: 'x3', name: 'X', characters: [character('C')], detached: true },
    ])
    expect(result[0].detached).toBeUndefined()
    expect(result[1].detached).toBe(true)
  })
})

describe('syncHarem con bloques separados (012)', () => {
  it('X = [A, B, C], separo C, reclamo E: E va al principal y C sigue separado', () => {
    const detached = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)
    const detachedId = detached.series[1].id

    const result = syncHarem(detached, [parsed('X', ['A', 'B', 'C', 'E']), parsed('Y', ['Z'])])

    expect(result.series.map((series) => series.id)).toEqual(['x', detachedId, 'y'])
    expect(names(result)).toEqual([['A', 'B', 'E'], ['C'], ['Z']])
    expect(result.series[1].detached).toBe(true)
  })

  it('los personajes nuevos van al principal aunque el bloque separado esté antes en el orden', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        { id: 'x2', name: 'X', characters: [character('D'), character('E')], detached: true },
        { id: 'x', name: 'X', characters: [character('A')] },
      ],
    }

    const result = syncHarem(harem, [parsed('X', ['A', 'D', 'E', 'F'])])

    expect(result.series.map((series) => series.id)).toEqual(['x2', 'x'])
    expect(names(result)).toEqual([['D', 'E'], ['A', 'F']])
  })

  it('si el principal se queda sin personajes, el bloque separado pasa a ser el principal y recibe a los nuevos', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        { id: 'x', name: 'X', characters: [character('A')] },
        { id: 'x2', name: 'X', characters: [character('C')], detached: true },
      ],
    }

    // A desaparece (divorcio) y llega E: E cae en el principal 'x' (sigue
    // existiendo en el harem actual) — después se divorcia también E.
    const afterA = syncHarem(harem, [parsed('X', ['C'])])
    expect(afterA.series).toHaveLength(1)
    expect(afterA.series[0]).toMatchObject({ id: 'x2' })
    expect(afterA.series[0].detached).toBeUndefined()

    const afterE = syncHarem(afterA, [parsed('X', ['C', 'E'])])
    expect(names(afterE)).toEqual([['C', 'E']])
  })

  it('la serie repetida en el pegado no crea ni junta bloques: manda la membresía guardada', () => {
    const detached = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)

    const result = syncHarem(detached, [parsed('X', ['C', 'A']), parsed('Y', ['Z']), parsed('X', ['B'])])

    expect(names(result)).toEqual([['A', 'B'], ['C'], ['Z']])
  })

  it('mismo nombre de personaje en series distintas: cada uno se queda en su serie', () => {
    const harem: Harem = {
      profileId: 'p',
      series: [
        { id: 'x', name: 'X', characters: [{ ...character('Saber'), id: 'saber-x' }] },
        { id: 'y', name: 'Y', characters: [{ ...character('Saber'), id: 'saber-y' }, character('Z')] },
      ],
    }

    const result = syncHarem(harem, [parsed('Y', ['Saber', 'Z']), parsed('X', ['Saber'])])

    expect(result.series.map((series) => [series.id, series.characters.map((c) => c.id)])).toEqual([
      ['x', ['saber-x']],
      ['y', ['saber-y', 'char-Z']],
    ])
  })

  it('si Mudae renombra la serie, el personaje conserva su id pero va al principal de la serie nueva', () => {
    const detached = moveCharacterToBlock(buildHarem(), 'x', 'char-C', null)

    const result = syncHarem(detached, [parsed('X', ['A', 'B']), parsed('X Renamed', ['C']), parsed('Y', ['Z'])])

    const renamed = result.series.find((series) => series.name === 'X Renamed')
    expect(renamed?.characters.map((c) => c.id)).toEqual(['char-C'])
    expect(renamed?.detached).toBeUndefined()
    expect(result.series.filter((series) => series.name === 'X')).toHaveLength(1)
  })
})
