import { describe, expect, it } from 'vitest'
import { activateProfile } from '../../../src/application/useCases/activateProfile'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, isActive: boolean): Profile {
  return {
    id,
    serverId: 'server-1',
    username: id,
    alias: id,
    isActive,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: id, series: [] },
  }
}

describe('activateProfile', () => {
  it('activa el perfil indicado y desactiva cualquier otro (FR-012, FR-013)', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', true),
      buildProfile('b', false),
      buildProfile('c', false),
    ])

    activateProfile(repository, 'b')

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'a')?.isActive).toBe(false)
    expect(profiles.find((p) => p.id === 'b')?.isActive).toBe(true)
    expect(profiles.find((p) => p.id === 'c')?.isActive).toBe(false)
    expect(profiles.filter((p) => p.isActive)).toHaveLength(1)
  })
})
