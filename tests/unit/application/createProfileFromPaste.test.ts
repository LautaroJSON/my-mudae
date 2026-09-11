import { describe, expect, it } from 'vitest'
import { createProfileFromPaste } from '../../../src/application/useCases/createProfileFromPaste'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

const VALID_HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

function buildExistingProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'otroUsuario',
    alias: 'otroUsuario',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: { profileId: 'otroUsuario', series: [] },
    ...overrides,
  }
}

describe('createProfileFromPaste', () => {
  it('en éxito, crea un perfil con id/alias = nombre extraído, series y personajes, y lo deja activo', () => {
    const repository = new InMemoryProfileRepository()

    const result = createProfileFromPaste(repository, VALID_HAREM)

    expect(result).toEqual({ ok: true, mode: 'created' })
    const profiles = repository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('rodoifin')
    expect(profiles[0].alias).toBe('rodoifin')
    expect(profiles[0].isActive).toBe(true)
    expect(profiles[0].order).toBe(0)
    expect(profiles[0].harem.series).toHaveLength(1)
    expect(profiles[0].harem.series[0].name).toBe('Amagami')
    expect(profiles[0].harem.series[0].characters[0]).toMatchObject({
      name: 'Haruka Morishima',
      imageUrl: 'https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png',
      kakera: 49,
      claimRank: '#15,140',
    })
  })

  it('en éxito con otro perfil ya activo, desactiva al anterior y activa el nuevo (FR-002, FR-008, FR-014 de 001)', () => {
    const existing = buildExistingProfile()
    const repository = new InMemoryProfileRepository([existing])

    const result = createProfileFromPaste(repository, VALID_HAREM)

    expect(result).toEqual({ ok: true, mode: 'created' })
    const profiles = repository.getAll()
    expect(profiles).toHaveLength(2)
    const previouslyActive = profiles.find((profile) => profile.id === existing.id)
    const newProfile = profiles.find((profile) => profile.id !== existing.id)
    expect(previouslyActive?.isActive).toBe(false)
    expect(newProfile?.isActive).toBe(true)
    expect(newProfile?.order).toBe(1)
  })

  it('en falla, no persiste ningún perfil nuevo ni modifica los existentes (FR-007 de 001)', () => {
    const existing = buildExistingProfile()
    const repository = new InMemoryProfileRepository([existing])

    const result = createProfileFromPaste(repository, 'esto no es un harem de Mudae')

    expect(result).toEqual({ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' })
    expect(repository.getAll()).toEqual([existing])
  })

  it('si el nombre extraído coincide con el id de un perfil existente, sincroniza ese perfil en vez de crear uno duplicado (US4 de 002, FR-015a)', () => {
    const repository = new InMemoryProfileRepository()
    createProfileFromPaste(repository, VALID_HAREM) // crea "rodoifin" con Haruka (#15,140, 49 ka)

    const UPDATED_HAREM = `rodoifin's harem

Amagami - 2/11
#15,140 - Haruka Morishima 60 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png
#99,999 - Rihoko Sakurai 35 ka - https://mudae.net/uploads/7154450/bpNEmZC~FErpw83.png`

    const result = createProfileFromPaste(repository, UPDATED_HAREM)

    expect(result).toEqual({ ok: true, mode: 'synced' })
    const profiles = repository.getAll()
    expect(profiles).toHaveLength(1) // no se duplicó
    expect(profiles[0].isActive).toBe(true)

    const characters = profiles[0].harem.series.flatMap((series) => series.characters)
    expect(characters).toHaveLength(2)
    expect(characters.find((c) => c.claimRank === '#15,140')?.kakera).toBe(60) // actualizado
    expect(characters.some((c) => c.claimRank === '#99,999')).toBe(true) // agregado
  })
})
