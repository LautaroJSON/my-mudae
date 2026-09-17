import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider, { useHaremSort } from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota (mismo criterio que HaremView.dragdrop.test.tsx/SeriesGroup.dragdrop.test.tsx):
// un gesto de arrastre real no se puede simular de forma confiable en
// jsdom. Acá se valida el efecto estructural de `dragDisabled` que
// expone @dnd-kit (`aria-disabled`/`disabled` en la manija y en cada
// tarjeta), en vez de intentar disparar un drag real.

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png', kakera: 5 },
          { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png', kakera: 20 },
        ],
      },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [{ id: 'char-3', name: 'Noelle Silva', imageUrl: 'https://x/3.png', kakera: 50 }],
      },
      {
        id: 'series-3',
        name: 'Chainsaw Man',
        characters: [
          { id: 'char-4', name: 'Power', imageUrl: 'https://x/4.png' },
          { id: 'char-5', name: 'Makima', imageUrl: 'https://x/5.png', kakera: 10 },
        ],
      },
    ],
  }
}

function ToggleSortButton() {
  const { toggleActive } = useHaremSort()
  return (
    <button type="button" onClick={() => toggleActive()}>
      toggle-sort
    </button>
  )
}

function renderHaremView(harem: Harem) {
  const profile: Profile = {
    id: harem.profileId,
    serverId: 'server-1',
    username: harem.profileId,
    alias: harem.profileId,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSearchProvider>
          <ToggleSortButton />
          <HaremView harem={harem} />
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
}

function regionOrder() {
  return screen.getAllByRole('region').map((region) => region.getAttribute('aria-label'))
}

describe('HaremView - ordenamiento temporal por kakera (010)', () => {
  it('con el ordenamiento inactivo, renderiza el orden manual persistido', () => {
    renderHaremView(buildHarem())

    expect(regionOrder()).toEqual(['Amagami', 'Black Clover', 'Chainsaw Man'])
  })

  it('al activarlo, ordena series por suma de kakera y personajes por su propio valor (descendente por defecto)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await user.click(screen.getByRole('button', { name: 'toggle-sort' }))

    // Sumas: series-1=25, series-2=50, series-3=10 (char-4 sin kakera cuenta como 0)
    expect(regionOrder()).toEqual(['Black Clover', 'Amagami', 'Chainsaw Man'])
    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(amagami.textContent).toMatch(/Ai Nanasaki.*Haruka Morishima/s)
    const chainsawMan = screen.getByRole('region', { name: 'Chainsaw Man' })
    expect(chainsawMan.textContent).toMatch(/Makima.*Power/s)
  })

  it('al desactivarlo, restaura exactamente el orden manual original', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await user.click(screen.getByRole('button', { name: 'toggle-sort' }))
    await user.click(screen.getByRole('button', { name: 'toggle-sort' }))

    expect(regionOrder()).toEqual(['Amagami', 'Black Clover', 'Chainsaw Man'])
    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(amagami.textContent).toMatch(/Haruka Morishima.*Ai Nanasaki/s)
  })

  it('con el ordenamiento activo, el drag-and-drop de series y personajes queda deshabilitado (FR-015)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await user.click(screen.getByRole('button', { name: 'toggle-sort' }))

    const handle = screen.getByRole('button', { name: /reordenar serie amagami/i })
    expect(handle).toBeDisabled()

    const amagami = screen.getByRole('region', { name: 'Amagami' })
    const card = within(amagami).getByText('Ai Nanasaki').closest('[aria-disabled]') as HTMLElement
    expect(card).toHaveAttribute('aria-disabled', 'true')
  })

  it('con el ordenamiento inactivo, el drag-and-drop sigue habilitado', () => {
    renderHaremView(buildHarem())

    const handle = screen.getByRole('button', { name: /reordenar serie amagami/i })
    expect(handle).not.toBeDisabled()
  })
})
