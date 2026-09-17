import { describe, expect, it } from 'vitest'
import { formatHaremMessage } from '../../../src/domain/parsing/formatHaremMessage'
import { parseHaremMessage } from '../../../src/domain/parsing/parseHaremMessage'
import { reorderCharactersInSeries, reorderSeries } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(): Profile {
  return {
    id: 'rodoifin',
    serverId: 'server-1',
    username: 'rodoifin',
    // Distinto de `username` a propósito: hace que un test que por error
    // leyera `alias` en vez de `username` falle (ver fix de "el copiado
    // devuelve el alias en vez del username").
    alias: 'Mi Cuenta Principal',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-amagami',
          name: 'Amagami',
          characters: [
            {
              id: 'char-1',
              name: 'Haruka Morishima',
              imageUrl: 'https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png',
              kakera: 49,
              claimRank: '#15,140',
            },
            {
              id: 'char-2',
              name: 'Ai Nanasaki',
              imageUrl: 'https://mudae.net/uploads/3176609/d7FP_dc~G8tEHIS.png',
              kakera: 46,
              claimRank: '#18,351',
            },
          ],
        },
        {
          id: 'series-black-clover',
          name: 'Black Clover',
          characters: [
            {
              id: 'char-3',
              name: 'Noelle Silva',
              imageUrl: 'https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png',
              // sin kakera: FR-006 de 001
              claimRank: '#182',
            },
          ],
        },
      ],
    },
  }
}

describe('formatHaremMessage', () => {
  it('genera un texto que, pasado a parseHaremMessage, reproduce el mismo perfil/series/personajes', () => {
    const profile = buildProfile()

    const text = formatHaremMessage(profile)
    const result = parseHaremMessage(text)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.profileName).toBe(profile.username)
    expect(result.series.map((series) => series.name)).toEqual(['Amagami', 'Black Clover'])
    expect(result.series[0].characters).toEqual([
      { claimRank: '#15,140', name: 'Haruka Morishima', kakera: 49, imageUrl: 'https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png' },
      { claimRank: '#18,351', name: 'Ai Nanasaki', kakera: 46, imageUrl: 'https://mudae.net/uploads/3176609/d7FP_dc~G8tEHIS.png' },
    ])
    expect(result.series[1].characters).toEqual([
      { claimRank: '#182', name: 'Noelle Silva', kakera: undefined, imageUrl: 'https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png' },
    ])
  })

  it('usa el username en el encabezado, nunca el alias (bug: el copiado devolvía el alias)', () => {
    const profile = buildProfile()
    expect(profile.alias).not.toBe(profile.username) // guardia: el fixture debe ejercitar la diferencia

    const text = formatHaremMessage(profile)

    expect(text.split('\n')[0]).toBe(`${profile.username}'s harem`)
    expect(text).not.toContain(profile.alias)
  })

  it('omite una serie sin personajes en el texto generado', () => {
    const profile = buildProfile()
    profile.harem.series.push({ id: 'series-empty', name: 'Serie Vacía', characters: [] })

    const text = formatHaremMessage(profile)

    expect(text).not.toContain('Serie Vacía')
  })

  it('sintetiza un claim rank por posición cuando el personaje no tiene uno persistido, y sigue siendo parseable', () => {
    const profile = buildProfile()
    profile.harem.series[1].characters.push({
      id: 'char-4',
      name: 'Sin Rango',
      imageUrl: 'https://mudae.net/uploads/x/sin-rango.png',
      kakera: 10,
      // claimRank ausente a propósito
    })

    const text = formatHaremMessage(profile)
    const result = parseHaremMessage(text)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const sinRango = result.series[1].characters.find((character) => character.name === 'Sin Rango')
    expect(sinRango?.claimRank).toBe('#2')
  })

  it('refleja el orden actual del harem tras reordenar series y personajes (Principio II)', () => {
    let profile = buildProfile()
    profile = {
      ...profile,
      harem: reorderSeries(profile.harem, ['series-black-clover', 'series-amagami']),
    }
    profile = {
      ...profile,
      harem: reorderCharactersInSeries(profile.harem, 'series-amagami', ['char-2', 'char-1']),
    }

    const text = formatHaremMessage(profile)
    const result = parseHaremMessage(text)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series.map((series) => series.name)).toEqual(['Black Clover', 'Amagami'])
    const amagami = result.series.find((series) => series.name === 'Amagami')
    expect(amagami?.characters.map((character) => character.name)).toEqual(['Ai Nanasaki', 'Haruka Morishima'])
  })
})
