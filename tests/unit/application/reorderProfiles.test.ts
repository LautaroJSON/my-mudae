import { describe, expect, it } from 'vitest'
import { reorderProfiles } from '../../../src/application/useCases/reorderProfiles'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, order: number, isActive = false): Profile {
  return {
    id,
    alias: id,
    isActive,
    createdAt: '2026-01-01T00:00:00.000Z',
    order,
    harem: { profileId: id, series: [] },
  }
}

describe('reorderProfiles', () => {
  it('persiste el nuevo orden denso según la secuencia de ids recibida', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', 0),
      buildProfile('b', 1),
      buildProfile('c', 2),
    ])

    reorderProfiles(repository, ['c', 'a', 'b'])

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'c')?.order).toBe(0)
    expect(profiles.find((p) => p.id === 'a')?.order).toBe(1)
    expect(profiles.find((p) => p.id === 'b')?.order).toBe(2)
  })

  it('no cambia isActive de ningún perfil', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', 0, true),
      buildProfile('b', 1, false),
    ])

    reorderProfiles(repository, ['b', 'a'])

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'a')?.isActive).toBe(true)
    expect(profiles.find((p) => p.id === 'b')?.isActive).toBe(false)
  })

  it('ignora ids que no corresponden a ningún perfil existente', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', 0), buildProfile('b', 1)])

    reorderProfiles(repository, ['b', 'fantasma', 'a'])

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'b')?.order).toBe(0)
    expect(profiles.find((p) => p.id === 'a')?.order).toBe(1)
  })

  it('deja al final, en su orden relativo anterior, los perfiles que faltan en la secuencia recibida', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', 0),
      buildProfile('b', 1),
      buildProfile('c', 2),
    ])

    reorderProfiles(repository, ['c'])

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'c')?.order).toBe(0)
    expect(profiles.find((p) => p.id === 'a')?.order).toBe(1)
    expect(profiles.find((p) => p.id === 'b')?.order).toBe(2)
  })
})
