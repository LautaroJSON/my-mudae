import { describe, expect, it } from 'vitest'
import { updateActiveProfileHarem } from '../../../src/application/useCases/updateActiveProfileHarem'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://mudae.net/a.png', kakera: 49, claimRank: '#1' },
            { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://mudae.net/b.png', kakera: 46, claimRank: '#2' },
          ],
        },
      ],
    },
    ...overrides,
  }
}

const UPDATED_HAREM = `rodoifin's harem

Amagami - 2/11
#1 - Haruka Morishima 99 ka - https://mudae.net/a.png
#3 - Nuevo Personaje 10 ka - https://mudae.net/c.png`

const OTHER_USER_HAREM = `otrousuario's harem

Amagami - 1/11
#5 - Alguien Mas 20 ka - https://mudae.net/x.png`

describe('updateActiveProfileHarem', () => {
  it('sobrescribe el harem del perfil activo cuando el nombre pegado coincide, sin tocar otros perfiles', () => {
    const activo = buildProfile()
    const otro = buildProfile({ id: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])

    const result = updateActiveProfileHarem(repository, 'rodoifin', UPDATED_HAREM)

    expect(result).toEqual({ ok: true })

    const [updatedActivo, untouchedOtro] = repository.getAll()
    expect(updatedActivo.harem.series[0].characters.map((c) => c.name)).toEqual(['Haruka Morishima', 'Nuevo Personaje'])
    expect(updatedActivo.harem.series[0].characters.find((c) => c.claimRank === '#1')?.kakera).toBe(99)
    expect(updatedActivo.harem.series[0].characters.some((c) => c.claimRank === '#2')).toBe(false)
    expect(updatedActivo.isActive).toBe(true)
    expect(updatedActivo.alias).toBe('rodoifin')
    expect(untouchedOtro).toEqual(otro)
  })

  it('bloquea la actualización cuando el nombre pegado coincide con OTRO perfil existente, sin modificar ningún perfil', () => {
    const activo = buildProfile()
    const otro = buildProfile({ id: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])

    const result = updateActiveProfileHarem(repository, 'rodoifin', OTHER_USER_HAREM)

    expect(result).toEqual({ ok: false, reason: 'PROFILE_MISMATCH', pastedProfileName: 'otrousuario' })
    expect(repository.getAll()).toEqual([activo, otro])
  })

  it('bloquea la actualización cuando el nombre pegado no coincide con ningún perfil existente', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, 'rodoifin', OTHER_USER_HAREM)

    expect(result).toEqual({ ok: false, reason: 'PROFILE_MISMATCH', pastedProfileName: 'otrousuario' })
    expect(repository.getAll()).toEqual([activo])
  })

  it('rechaza un texto no reconocible sin modificar ningún perfil', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, 'rodoifin', 'esto no es un harem de Mudae')

    expect(result).toEqual({ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' })
    expect(repository.getAll()).toEqual([activo])
  })

  it('devuelve NO_ACTIVE_PROFILE cuando el id indicado no corresponde a ningún perfil', () => {
    const repository = new InMemoryProfileRepository([])

    const result = updateActiveProfileHarem(repository, 'rodoifin', UPDATED_HAREM)

    expect(result).toEqual({ ok: false, reason: 'NO_ACTIVE_PROFILE' })
    expect(repository.getAll()).toEqual([])
  })
})
