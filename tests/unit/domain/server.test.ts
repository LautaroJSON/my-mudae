import { describe, expect, it } from 'vitest'
import {
  addProfileToServer,
  pickNextActiveProfileId,
  removeProfileFromServer,
  removeServer,
  reorderProfilesInServer,
  reorderServers,
  type Server,
} from '../../../src/domain/server/Server'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildServer(id: string, profileIds: string[]): Server {
  return { id, name: id, profileIds }
}

function buildProfile(id: string): Profile {
  return {
    id,
    serverId: 'irrelevant',
    username: id,
    alias: id,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: id, series: [] },
  }
}

describe('addProfileToServer', () => {
  it('agrega el profileId al final del servidor indicado, sin afectar otros servidores', () => {
    const servers = [buildServer('s1', ['a']), buildServer('s2', ['x'])]

    const next = addProfileToServer(servers, 's1', 'b')

    expect(next.find((s) => s.id === 's1')?.profileIds).toEqual(['a', 'b'])
    expect(next.find((s) => s.id === 's2')?.profileIds).toEqual(['x'])
  })

  it('no duplica un id ya presente', () => {
    const servers = [buildServer('s1', ['a'])]

    const next = addProfileToServer(servers, 's1', 'a')

    expect(next[0].profileIds).toEqual(['a'])
  })

  it('serverId inexistente no lanza y no cambia nada', () => {
    const servers = [buildServer('s1', ['a'])]

    const next = addProfileToServer(servers, 'no-existe', 'b')

    expect(next).toEqual(servers)
  })
})

describe('removeProfileFromServer', () => {
  it('quita el profileId del servidor indicado sin afectar otros servidores', () => {
    const servers = [buildServer('s1', ['a', 'b']), buildServer('s2', ['x'])]

    const next = removeProfileFromServer(servers, 's1', 'a')

    expect(next.find((s) => s.id === 's1')?.profileIds).toEqual(['b'])
    expect(next.find((s) => s.id === 's2')?.profileIds).toEqual(['x'])
  })

  it('el servidor persiste aunque quede con profileIds vacío (FR-014)', () => {
    const servers = [buildServer('s1', ['a'])]

    const next = removeProfileFromServer(servers, 's1', 'a')

    expect(next).toEqual([buildServer('s1', [])])
  })

  it('serverId/profileId inexistentes no lanzan', () => {
    const servers = [buildServer('s1', ['a'])]

    expect(removeProfileFromServer(servers, 'no-existe', 'a')).toEqual(servers)
    expect(removeProfileFromServer(servers, 's1', 'no-existe')).toEqual(servers)
  })
})

describe('removeServer', () => {
  it('elimina el servidor indicado sin tocar Profile[] (la función ni siquiera lo recibe)', () => {
    const servers = [buildServer('s1', ['a']), buildServer('s2', ['b'])]

    const next = removeServer(servers, 's1')

    expect(next).toEqual([buildServer('s2', ['b'])])
  })

  it('serverId inexistente no lanza', () => {
    const servers = [buildServer('s1', ['a'])]

    expect(removeServer(servers, 'no-existe')).toEqual(servers)
  })
})

describe('reorderServers', () => {
  it('reordena según orderedIds', () => {
    const servers = [buildServer('a', []), buildServer('b', []), buildServer('c', [])]

    const next = reorderServers(servers, ['c', 'a', 'b'])

    expect(next.map((s) => s.id)).toEqual(['c', 'a', 'b'])
  })

  it('ignora ids desconocidos y deja al final, en orden relativo anterior, los ausentes', () => {
    const servers = [buildServer('a', []), buildServer('b', []), buildServer('c', [])]

    const next = reorderServers(servers, ['c', 'no-existe'])

    expect(next.map((s) => s.id)).toEqual(['c', 'a', 'b'])
  })
})

describe('reorderProfilesInServer', () => {
  it('reordena profileIds únicamente del servidor indicado', () => {
    const servers = [buildServer('s1', ['a', 'b', 'c']), buildServer('s2', ['x', 'y'])]

    const next = reorderProfilesInServer(servers, 's1', ['c', 'a', 'b'])

    expect(next.find((s) => s.id === 's1')?.profileIds).toEqual(['c', 'a', 'b'])
    expect(next.find((s) => s.id === 's2')?.profileIds).toEqual(['x', 'y'])
  })

  it('ids desconocidos se ignoran, ausentes quedan al final en orden relativo anterior', () => {
    const servers = [buildServer('s1', ['a', 'b', 'c'])]

    const next = reorderProfilesInServer(servers, 's1', ['c', 'no-existe'])

    expect(next[0].profileIds).toEqual(['c', 'a', 'b'])
  })

  it('serverId inexistente no cambia nada', () => {
    const servers = [buildServer('s1', ['a', 'b'])]

    expect(reorderProfilesInServer(servers, 'no-existe', ['b', 'a'])).toEqual(servers)
  })
})

describe('pickNextActiveProfileId', () => {
  it('devuelve el primer perfil restante del primer servidor que todavía tenga alguno', () => {
    const servers = [buildServer('s1', []), buildServer('s2', ['b', 'c'])]
    const profiles = [buildProfile('b'), buildProfile('c')]

    expect(pickNextActiveProfileId(servers, profiles)).toBe('b')
  })

  it('devuelve undefined si ningún servidor tiene ningún perfil restante', () => {
    const servers = [buildServer('s1', []), buildServer('s2', [])]

    expect(pickNextActiveProfileId(servers, [])).toBeUndefined()
  })

  it('servers/profiles vacíos devuelven undefined', () => {
    expect(pickNextActiveProfileId([], [])).toBeUndefined()
  })
})
