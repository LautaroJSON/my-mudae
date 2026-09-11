import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota: igual que ProfileList.dragdrop.test.tsx (002) y
// SeriesGroup.dragdrop.test.tsx (003), un gesto de arrastre real no se
// puede simular de forma confiable en jsdom. Acá se valida: (a) que la
// manija de cada serie es enfocable/operable por teclado; (b) que cada
// SeriesGroup monta su propio conjunto de personajes arrastrables — solo
// los de su propia serie, nunca los de otra (base estructural de FR-005,
// ver research.md). El gesto real se valida manualmente (Escenario 3 de
// quickstart.md).

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' },
          { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png' },
        ],
      },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [{ id: 'char-3', name: 'Noelle Silva', imageUrl: 'https://x/3.png' }],
      },
    ],
  }
}

function renderHaremView(harem: Harem) {
  const profile: Profile = {
    id: harem.profileId,
    alias: harem.profileId,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem,
  }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremView harem={harem} />
    </ProfilesProvider>,
  )
}

describe('HaremView - drag-and-drop de series', () => {
  it('cada serie tiene una manija de arrastre enfocable y operable por teclado (Principio V)', () => {
    renderHaremView(buildHarem())

    const handleAmagami = screen.getByRole('button', { name: /reordenar serie amagami/i })
    const handleBlackClover = screen.getByRole('button', { name: /reordenar serie black clover/i })

    expect(handleAmagami.tabIndex).toBe(0)
    expect(handleBlackClover.tabIndex).toBe(0)
  })

  it('el orden de las series en pantalla refleja harem.series', () => {
    renderHaremView(buildHarem())

    const regions = screen.getAllByRole('region')
    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual(['Amagami', 'Black Clover'])
  })

  it('cada SeriesGroup solo arrastra los personajes de su propia serie (base estructural de FR-005)', () => {
    renderHaremView(buildHarem())

    const amagami = screen.getByRole('region', { name: 'Amagami' })
    const blackClover = screen.getByRole('region', { name: 'Black Clover' })

    // +1 en cada caso por la manija de arrastre de la propia serie: Amagami
    // arrastra exactamente sus 2 personajes, Black Clover exactamente el
    // suyo — nunca los del otro (cada uno con su propio DndContext).
    expect(within(amagami).getAllByRole('button')).toHaveLength(2 + 1)
    expect(within(blackClover).getAllByRole('button')).toHaveLength(1 + 1)
  })
})
