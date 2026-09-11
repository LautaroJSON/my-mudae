import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import SeriesGroup from '../../../src/presentation/components/SeriesGroup'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Series } from '../../../src/domain/harem/Series'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota: igual que ProfileList.dragdrop.test.tsx (002), un gesto de
// arrastre real (mouse/touch/teclado) no se puede simular de forma
// confiable en jsdom, porque @dnd-kit necesita medidas de layout reales
// (getBoundingClientRect) para saber sobre qué ítem se soltó, y jsdom no
// tiene motor de layout. El cálculo del nuevo orden a partir de un
// evento de @dnd-kit ya está testeado de forma aislada en
// tests/unit/presentation/computeReorderedIds.test.ts. Acá se valida lo
// que sí es observable en jsdom: que cada personaje es su propia
// superficie de arrastre enfocable/operable por teclado (sin manija
// dedicada, a diferencia de una serie), y que el orden en pantalla
// refleja series.characters. El gesto real se valida manualmente
// (Escenario 2 de quickstart.md).

function buildSeries(): Series {
  return {
    id: 'series-1',
    name: 'Amagami',
    characters: [
      { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' },
      { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png' },
      { id: 'char-3', name: 'Rihoko Sakurai', imageUrl: 'https://x/3.png' },
    ],
  }
}

function renderSeriesGroup(series: Series) {
  const profile: Profile = {
    id: 'profile-1',
    alias: 'profile-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: { profileId: 'profile-1', series: [series] },
  }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <SeriesGroup series={series} />
    </ProfilesProvider>,
  )
}

describe('SeriesGroup - drag-and-drop de personajes', () => {
  it('cada personaje es su propia superficie de arrastre, enfocable y operable por teclado (Principio V)', () => {
    renderSeriesGroup(buildSeries())

    const region = screen.getByRole('region', { name: 'Amagami' })
    const cards = within(region).getAllByRole('button')

    expect(cards).toHaveLength(3)
    cards.forEach((card) => expect(card.tabIndex).toBe(0))
  })

  it('el orden de los personajes en pantalla refleja series.characters', () => {
    renderSeriesGroup(buildSeries())

    const region = screen.getByRole('region', { name: 'Amagami' })
    const names = within(region).getAllByText(/Morishima|Nanasaki|Sakurai/)

    expect(names.map((el) => el.textContent)).toEqual(['Haruka Morishima', 'Ai Nanasaki', 'Rihoko Sakurai'])
  })
})
