import { describe, expect, it } from 'vitest'
import { deleteProfile } from '../../../src/application/useCases/deleteProfile'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, isActive: boolean, order = 0): Profile {
  return {
    id,
    alias: id,
    isActive,
    createdAt: '2026-01-01T00:00:00.000Z',
    order,
    harem: {
      profileId: id,
      series: [{ id: `${id}-series`, name: 'Serie', characters: [{ id: `${id}-char`, name: 'X', imageUrl: 'https://x.png' }] }],
    },
  }
}

describe('deleteProfile', () => {
  it('elimina el harem completo del perfil junto con él (FR-011)', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', true)])

    deleteProfile(repository, 'a')

    expect(repository.getAll()).toEqual([])
  })

  it('si el eliminado era el activo y quedan otros, activa automáticamente otro (FR-015)', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', true, 0), buildProfile('b', false, 1)])

    deleteProfile(repository, 'a')

    const profiles = repository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('b')
    expect(profiles[0].isActive).toBe(true)
  })

  it('si no queda ningún perfil, ninguno queda activo (FR-010)', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', true)])

    deleteProfile(repository, 'a')

    expect(repository.getAll()).toEqual([])
  })

  it('eliminar un perfil que no es el activo no afecta al perfil activo', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', true), buildProfile('b', false)])

    deleteProfile(repository, 'b')

    const profiles = repository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('a')
    expect(profiles[0].isActive).toBe(true)
  })
})
