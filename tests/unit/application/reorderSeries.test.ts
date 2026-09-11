import { describe, expect, it } from 'vitest'
import { reorderSeries } from '../../../src/application/useCases/reorderSeries'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, seriesIds: string[]): Profile {
  return {
    id,
    alias: id,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: {
      profileId: id,
      series: seriesIds.map((seriesId) => ({
        id: seriesId,
        name: seriesId,
        characters: [{ id: `${seriesId}-char`, name: seriesId, imageUrl: 'https://x.png' }],
      })),
    },
  }
}

describe('reorderSeries (caso de uso)', () => {
  it('persiste el nuevo orden de series del perfil indicado', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', ['series-1', 'series-2', 'series-3'])])

    reorderSeries(repository, 'a', ['series-3', 'series-1', 'series-2'])

    const profile = repository.getAll().find((p) => p.id === 'a')
    expect(profile?.harem.series.map((s) => s.id)).toEqual(['series-3', 'series-1', 'series-2'])
  })

  it('no afecta el harem de ningún otro perfil', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile('a', ['series-1', 'series-2']),
      buildProfile('b', ['series-3', 'series-4']),
    ])

    reorderSeries(repository, 'a', ['series-2', 'series-1'])

    const profileB = repository.getAll().find((p) => p.id === 'b')
    expect(profileB?.harem.series.map((s) => s.id)).toEqual(['series-3', 'series-4'])
  })

  it('no hace nada si el profileId no corresponde a ningún perfil', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', ['series-1', 'series-2'])])

    reorderSeries(repository, 'fantasma', ['series-2', 'series-1'])

    const profile = repository.getAll().find((p) => p.id === 'a')
    expect(profile?.harem.series.map((s) => s.id)).toEqual(['series-1', 'series-2'])
  })
})
