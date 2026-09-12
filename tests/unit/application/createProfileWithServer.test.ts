import { describe, expect, it } from 'vitest'
import { createProfileWithServer } from '../../../src/application/useCases/createProfileWithServer'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import type { ParsedSeries } from '../../../src/domain/parsing/parseHaremMessage'

const SERIES: ParsedSeries[] = [
  {
    name: 'Amagami',
    characters: [{ name: 'Haruka Morishima', imageUrl: 'https://mudae.net/a.png', kakera: 49, claimRank: '#1' }],
  },
]

describe('createProfileWithServer', () => {
  it('new-server: crea el servidor y el perfil, el servidor queda con profileIds: [nuevoId]', () => {
    const profileRepository = new InMemoryProfileRepository([])
    const serverRepository = new InMemoryServerRepository([])

    const result = createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'new-server',
      name: 'Mi server',
    })

    expect(result).toEqual({ ok: true, mode: 'created' })
    const servers = serverRepository.getAll()
    expect(servers).toHaveLength(1)
    expect(servers[0].name).toBe('Mi server')
    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(1)
    expect(servers[0].profileIds).toEqual([profiles[0].id])
    expect(profiles[0].serverId).toBe(servers[0].id)
    expect(profiles[0].username).toBe('rodoifin')
    expect(profiles[0].alias).toBe('rodoifin')
    expect(profiles[0].isActive).toBe(true)
  })

  it('existing-server: el perfil nuevo se agrega a profileIds de ESE servidor, sin crear un servidor adicional', () => {
    const serverRepository = new InMemoryServerRepository([{ id: 's1', name: 'Server A', profileIds: [] }])
    const profileRepository = new InMemoryProfileRepository([])

    const result = createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 's1',
    })

    expect(result).toEqual({ ok: true, mode: 'created' })
    const servers = serverRepository.getAll()
    expect(servers).toHaveLength(1)
    const profiles = profileRepository.getAll()
    expect(servers[0].profileIds).toEqual([profiles[0].id])
  })

  it('repetir alta con mismo serverId+username sincroniza, sin duplicar perfil ni membresía', () => {
    const serverRepository = new InMemoryServerRepository([{ id: 's1', name: 'Server A', profileIds: [] }])
    const profileRepository = new InMemoryProfileRepository([])

    createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 's1',
    })
    const firstProfileId = profileRepository.getAll()[0].id

    const result = createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 's1',
    })

    expect(result).toEqual({ ok: true, mode: 'synced' })
    expect(profileRepository.getAll()).toHaveLength(1)
    expect(profileRepository.getAll()[0].id).toBe(firstProfileId)
    expect(serverRepository.getAll()[0].profileIds).toEqual([firstProfileId])
  })

  it('mismo username eligiendo un servidor DISTINTO al que ya lo tiene crea un perfil nuevo e independiente', () => {
    const serverRepository = new InMemoryServerRepository([
      { id: 's1', name: 'Server A', profileIds: [] },
      { id: 's2', name: 'Server B', profileIds: [] },
    ])
    const profileRepository = new InMemoryProfileRepository([])

    createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 's1',
    })
    const profileInS1 = profileRepository.getAll()[0]

    const result = createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 's2',
    })

    expect(result).toEqual({ ok: true, mode: 'created' })
    const profiles = profileRepository.getAll()
    expect(profiles).toHaveLength(2)
    const profileInS2 = profiles.find((p) => p.id !== profileInS1.id)!
    expect(profileInS2.serverId).toBe('s2')
    expect(profileInS2.username).toBe('rodoifin')
    const persistedProfileInS1 = profiles.find((p) => p.id === profileInS1.id)
    expect(persistedProfileInS1).toEqual({ ...profileInS1, isActive: false })
  })

  it('existing-server con serverId inexistente devuelve SERVER_NOT_FOUND, sin persistir nada', () => {
    const serverRepository = new InMemoryServerRepository([])
    const profileRepository = new InMemoryProfileRepository([])

    const result = createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'existing-server',
      serverId: 'no-existe',
    })

    expect(result).toEqual({ ok: false, reason: 'SERVER_NOT_FOUND' })
    expect(profileRepository.getAll()).toEqual([])
    expect(serverRepository.getAll()).toEqual([])
  })

  it('escribir servidor nuevo con nombre que coincide con uno ya existente crea un servidor distinto', () => {
    const serverRepository = new InMemoryServerRepository([{ id: 's1', name: 'Mi server', profileIds: [] }])
    const profileRepository = new InMemoryProfileRepository([])

    createProfileWithServer(profileRepository, serverRepository, 'rodoifin', SERIES, {
      kind: 'new-server',
      name: 'Mi server',
    })

    const servers = serverRepository.getAll()
    expect(servers).toHaveLength(2)
    expect(servers[0].id).not.toBe(servers[1].id)
  })
})
