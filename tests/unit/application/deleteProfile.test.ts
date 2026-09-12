import { describe, expect, it } from 'vitest'
import { deleteProfile } from '../../../src/application/useCases/deleteProfile'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import type { Profile } from '../../../src/domain/profile/Profile'
import type { Server } from '../../../src/domain/server/Server'

function buildProfile(id: string, serverId: string, isActive: boolean): Profile {
  return {
    id,
    serverId,
    username: id,
    alias: id,
    isActive,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: {
      profileId: id,
      series: [{ id: `${id}-series`, name: 'Serie', characters: [{ id: `${id}-char`, name: 'X', imageUrl: 'https://x.png' }] }],
    },
  }
}

function buildServer(id: string, profileIds: string[]): Server {
  return { id, name: id, profileIds }
}

describe('deleteProfile', () => {
  it('elimina el harem completo del perfil junto con él (FR-011) y lo quita de Server.profileIds', () => {
    const profileRepository = new InMemoryProfileRepository([buildProfile('a', 's1', true)])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a'])])

    deleteProfile(profileRepository, serverRepository, 'a')

    expect(profileRepository.getAll()).toEqual([])
    expect(serverRepository.getAll()).toEqual([buildServer('s1', [])])
  })

  it('eliminar un perfil no activo de un servidor con 2+ perfiles conserva el resto en orden, sin cambio de activo', () => {
    const profileRepository = new InMemoryProfileRepository([
      buildProfile('a', 's1', true),
      buildProfile('b', 's1', false),
    ])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a', 'b'])])

    deleteProfile(profileRepository, serverRepository, 'b')

    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('a')
    expect(profiles[0].isActive).toBe(true)
    expect(serverRepository.getAll()[0].profileIds).toEqual(['a'])
  })

  it('eliminar el activo con otro perfil en el MISMO servidor activa el siguiente de ese servidor', () => {
    const profileRepository = new InMemoryProfileRepository([
      buildProfile('a', 's1', true),
      buildProfile('b', 's1', false),
    ])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a', 'b'])])

    deleteProfile(profileRepository, serverRepository, 'a')

    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('b')
    expect(profiles[0].isActive).toBe(true)
  })

  it('eliminar el único perfil de un servidor, quedando perfiles en OTRO servidor, activa el primero del otro servidor y el servidor vaciado persiste sin perfiles', () => {
    const profileRepository = new InMemoryProfileRepository([
      buildProfile('a', 's1', true),
      buildProfile('b', 's2', false),
    ])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a']), buildServer('s2', ['b'])])

    deleteProfile(profileRepository, serverRepository, 'a')

    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('b')
    expect(profiles[0].isActive).toBe(true)
    expect(serverRepository.getAll()).toEqual([buildServer('s1', []), buildServer('s2', ['b'])])
  })

  it('si no queda ningún perfil, ninguno queda activo (FR-010)', () => {
    const profileRepository = new InMemoryProfileRepository([buildProfile('a', 's1', true)])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a'])])

    deleteProfile(profileRepository, serverRepository, 'a')

    expect(profileRepository.getAll()).toEqual([])
  })
})
