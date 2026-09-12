import { describe, expect, it } from 'vitest'
import { reorderServers } from '../../../src/application/useCases/reorderServers'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'

describe('reorderServers', () => {
  it('persiste el nuevo orden de Server[] según orderedIds', () => {
    const repository = new InMemoryServerRepository([
      { id: 'a', name: 'a', profileIds: [] },
      { id: 'b', name: 'b', profileIds: [] },
      { id: 'c', name: 'c', profileIds: [] },
    ])

    reorderServers(repository, ['c', 'a', 'b'])

    expect(repository.getAll().map((s) => s.id)).toEqual(['c', 'a', 'b'])
  })

  it('ids desconocidos se ignoran, servidores ausentes quedan al final', () => {
    const repository = new InMemoryServerRepository([
      { id: 'a', name: 'a', profileIds: [] },
      { id: 'b', name: 'b', profileIds: [] },
    ])

    reorderServers(repository, ['b', 'no-existe'])

    expect(repository.getAll().map((s) => s.id)).toEqual(['b', 'a'])
  })
})
