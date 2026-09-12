import { describe, expect, it } from 'vitest'
import { reorderCharactersInSeries } from '../../../src/application/useCases/reorderCharactersInSeries'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, characterIds: string[]): Profile {
  return {
    id,
    serverId: 'server-1',
    username: id,
    alias: id,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: {
      profileId: id,
      series: [
        {
          id: `${id}-series`,
          name: 'Serie',
          characters: characterIds.map((charId) => ({ id: charId, name: charId, imageUrl: 'https://x.png' })),
        },
      ],
    },
  }
}

describe('reorderCharactersInSeries (caso de uso)', () => {
  it('persiste el nuevo orden de personajes de la serie indicada, en el perfil indicado', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', ['char-1', 'char-2', 'char-3'])])

    reorderCharactersInSeries(repository, 'a', 'a-series', ['char-3', 'char-1', 'char-2'])

    const profile = repository.getAll().find((p) => p.id === 'a')
    expect(profile?.harem.series[0]?.characters.map((c) => c.id)).toEqual(['char-3', 'char-1', 'char-2'])
  })

  it('no afecta el harem de ningún otro perfil', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', ['char-1', 'char-2']),
      buildProfile('b', ['char-3', 'char-4']),
    ])

    reorderCharactersInSeries(repository, 'a', 'a-series', ['char-2', 'char-1'])

    const profileB = repository.getAll().find((p) => p.id === 'b')
    expect(profileB?.harem.series[0]?.characters.map((c) => c.id)).toEqual(['char-3', 'char-4'])
  })

  it('no hace nada si el profileId no corresponde a ningún perfil', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', ['char-1', 'char-2'])])

    reorderCharactersInSeries(repository, 'fantasma', 'a-series', ['char-2', 'char-1'])

    const profile = repository.getAll().find((p) => p.id === 'a')
    expect(profile?.harem.series[0]?.characters.map((c) => c.id)).toEqual(['char-1', 'char-2'])
  })
})
