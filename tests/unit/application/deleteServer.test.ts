import { describe, expect, it } from 'vitest'
import { deleteServer } from '../../../src/application/useCases/deleteServer'
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
    harem: { profileId: id, series: [] },
  }
}

function buildServer(id: string, profileIds: string[]): Server {
  return { id, name: id, profileIds }
}

describe('deleteServer', () => {
  it('servidor de 3 perfiles (uno activo) + otro servidor con 1 perfil: eliminar el primero borra los 3 y activa el del segundo', () => {
    const profileRepository = new InMemoryProfileRepository([
      buildProfile('a', 's1', false),
      buildProfile('b', 's1', true),
      buildProfile('c', 's1', false),
      buildProfile('d', 's2', false),
    ])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a', 'b', 'c']), buildServer('s2', ['d'])])

    const result = deleteServer(profileRepository, serverRepository, 's1')

    expect(result).toEqual({ ok: true, deletedProfileCount: 3 })
    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBe('d')
    expect(profiles[0].isActive).toBe(true)
    expect(serverRepository.getAll()).toEqual([buildServer('s2', ['d'])])
  })

  it('eliminar un servidor vacío solo elimina el servidor, deletedProfileCount 0, sin cambio de activo', () => {
    const profileRepository = new InMemoryProfileRepository([buildProfile('a', 's2', true)])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', []), buildServer('s2', ['a'])])

    const result = deleteServer(profileRepository, serverRepository, 's1')

    expect(result).toEqual({ ok: true, deletedProfileCount: 0 })
    expect(profileRepository.getAll()).toEqual([buildProfile('a', 's2', true)])
    expect(serverRepository.getAll()).toEqual([buildServer('s2', ['a'])])
  })

  it('eliminar el único servidor con el único perfil activo deja ambas colecciones vacías', () => {
    const profileRepository = new InMemoryProfileRepository([buildProfile('a', 's1', true)])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a'])])

    const result = deleteServer(profileRepository, serverRepository, 's1')

    expect(result).toEqual({ ok: true, deletedProfileCount: 1 })
    expect(profileRepository.getAll()).toEqual([])
    expect(serverRepository.getAll()).toEqual([])
  })

  it('serverId inexistente no cambia nada, deletedProfileCount 0', () => {
    const profileRepository = new InMemoryProfileRepository([buildProfile('a', 's1', true)])
    const serverRepository = new InMemoryServerRepository([buildServer('s1', ['a'])])

    const result = deleteServer(profileRepository, serverRepository, 'no-existe')

    expect(result).toEqual({ ok: true, deletedProfileCount: 0 })
    expect(profileRepository.getAll()).toEqual([buildProfile('a', 's1', true)])
    expect(serverRepository.getAll()).toEqual([buildServer('s1', ['a'])])
  })
})
