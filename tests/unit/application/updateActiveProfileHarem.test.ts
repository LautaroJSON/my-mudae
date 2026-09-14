import { describe, expect, it } from 'vitest'
import { updateActiveProfileHarem } from '../../../src/application/useCases/updateActiveProfileHarem'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-rodoifin-s1',
    serverId: 's1',
    username: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
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
    const otro = buildProfile({ id: 'profile-otrousuario-s1', serverId: 's1', username: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])

    const result = updateActiveProfileHarem(repository, activo.id, UPDATED_HAREM)

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
    const otro = buildProfile({ id: 'profile-otrousuario-s1', serverId: 's1', username: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])

    const result = updateActiveProfileHarem(repository, activo.id, OTHER_USER_HAREM)

    expect(result).toEqual({
      ok: false,
      reason: 'PROFILE_MISMATCH',
      pastedProfileName: 'otrousuario',
      profileUsername: 'rodoifin',
    })
    expect(repository.getAll()).toEqual([activo, otro])
  })

  it('bloquea la actualización cuando el nombre pegado no coincide con ningún perfil existente', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, activo.id, OTHER_USER_HAREM)

    expect(result).toEqual({
      ok: false,
      reason: 'PROFILE_MISMATCH',
      pastedProfileName: 'otrousuario',
      profileUsername: 'rodoifin',
    })
    expect(repository.getAll()).toEqual([activo])
  })

  it('rechaza un texto no reconocible sin modificar ningún perfil', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, activo.id, 'esto no es un harem de Mudae')

    expect(result).toEqual({ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' })
    expect(repository.getAll()).toEqual([activo])
  })

  it('devuelve NO_ACTIVE_PROFILE cuando el id indicado no corresponde a ningún perfil', () => {
    const repository = new InMemoryProfileRepository([])

    const result = updateActiveProfileHarem(repository, 'no-existe', UPDATED_HAREM)

    expect(result).toEqual({ ok: false, reason: 'NO_ACTIVE_PROFILE' })
    expect(repository.getAll()).toEqual([])
  })

  it('acepta el pegado cuando el nombre solo difiere en casing', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, activo.id, UPDATED_HAREM.replace("rodoifin's", "RODOIFIN's"))

    expect(result).toEqual({ ok: true })
    expect(repository.getAll()[0].harem.series[0].characters.map((c) => c.name)).toEqual([
      'Haruka Morishima',
      'Nuevo Personaje',
    ])
    // El casing pegado no reescribe el username guardado.
    expect(repository.getAll()[0].username).toBe('rodoifin')
  })

  it('acepta el pegado cuando el nombre trae caracteres invisibles del copiado de Discord', () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(
      repository,
      activo.id,
      UPDATED_HAREM.replace("rodoifin's", "rodo\u200Bifin\u00AD's"),
    )

    expect(result).toEqual({ ok: true })
    expect(repository.getAll()[0].username).toBe('rodoifin')
  })

  it('con force ignora la discordancia, adopta el nombre pegado como username y deja el alias intacto', () => {
    const activo = buildProfile({ username: 'nombre-viejo', alias: 'mi perfil' })
    const otro = buildProfile({ id: 'profile-otrousuario-s1', username: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])

    const result = updateActiveProfileHarem(repository, activo.id, UPDATED_HAREM, { force: true })

    expect(result).toEqual({ ok: true })

    const [actualizado, intacto] = repository.getAll()
    expect(actualizado.username).toBe('rodoifin')
    expect(actualizado.alias).toBe('mi perfil')
    expect(actualizado.harem.series[0].characters.map((c) => c.name)).toEqual([
      'Haruka Morishima',
      'Nuevo Personaje',
    ])
    expect(intacto).toEqual(otro)
  })

  it('sin force, un nombre distinto sigue bloqueando sin persistir nada', () => {
    const activo = buildProfile({ username: 'nombre-viejo', alias: 'rodoifin' })
    const repository = new InMemoryProfileRepository([activo])

    const result = updateActiveProfileHarem(repository, activo.id, UPDATED_HAREM)

    expect(result).toEqual({
      ok: false,
      reason: 'PROFILE_MISMATCH',
      pastedProfileName: 'rodoifin',
      profileUsername: 'nombre-viejo',
    })
    expect(repository.getAll()).toEqual([activo])
  })

  it('dos perfiles con el mismo username en servidores distintos: actualizar el activo sincroniza el correcto sin afectar al otro servidor', () => {
    const activoEnS1 = buildProfile({ id: 'profile-rodoifin-s1', serverId: 's1', username: 'rodoifin', isActive: true })
    const inactivoEnS2 = buildProfile({ id: 'profile-rodoifin-s2', serverId: 's2', username: 'rodoifin', isActive: false })
    const repository = new InMemoryProfileRepository([activoEnS1, inactivoEnS2])

    const result = updateActiveProfileHarem(repository, activoEnS1.id, UPDATED_HAREM)

    expect(result).toEqual({ ok: true })
    const [updated, untouched] = repository.getAll()
    expect(updated.id).toBe('profile-rodoifin-s1')
    expect(updated.harem.series[0].characters.map((c) => c.name)).toEqual(['Haruka Morishima', 'Nuevo Personaje'])
    expect(untouched).toEqual(inactivoEnS2)
  })
})
