import { describe, expect, it } from 'vitest'
import { renameProfile } from '../../../src/application/useCases/renameProfile'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string): Profile {
  return {
    id,
    serverId: 'server-1',
    username: id,
    alias: 'Perfil original',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: id, series: [] },
  }
}

describe('renameProfile', () => {
  it('cambia el alias del perfil sin afectar isActive, order ni el harem (FR-009 de 001, FR-016 de 002)', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a')])

    renameProfile(repository, 'a', 'Mi cuenta principal')

    const [profile] = repository.getAll()
    expect(profile.alias).toBe('Mi cuenta principal')
    expect(profile.id).toBe('a')
    expect(profile.isActive).toBe(true)
    expect(profile.harem).toEqual({ profileId: 'a', series: [] })
  })

  it('no afecta a otros perfiles', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a'), buildProfile('b')])

    renameProfile(repository, 'a', 'Nuevo nombre')

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'b')?.alias).toBe('Perfil original')
  })
})
