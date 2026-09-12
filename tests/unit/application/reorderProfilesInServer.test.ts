import { describe, expect, it } from 'vitest'
import { reorderProfilesInServer } from '../../../src/application/useCases/reorderProfilesInServer'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'

describe('reorderProfilesInServer', () => {
  it('reordena profileIds de un único servidor sin afectar a otro servidor del mismo repositorio', () => {
    const repository = new InMemoryServerRepository([
      { id: 's1', name: 's1', profileIds: ['a', 'b', 'c'] },
      { id: 's2', name: 's2', profileIds: ['x', 'y'] },
    ])

    reorderProfilesInServer(repository, 's1', ['c', 'a', 'b'])

    const servers = repository.getAll()
    expect(servers.find((s) => s.id === 's1')?.profileIds).toEqual(['c', 'a', 'b'])
    expect(servers.find((s) => s.id === 's2')?.profileIds).toEqual(['x', 'y'])
  })

  it('serverId inexistente no cambia nada', () => {
    const repository = new InMemoryServerRepository([{ id: 's1', name: 's1', profileIds: ['a', 'b'] }])

    reorderProfilesInServer(repository, 'no-existe', ['b', 'a'])

    expect(repository.getAll()[0].profileIds).toEqual(['a', 'b'])
  })
})
