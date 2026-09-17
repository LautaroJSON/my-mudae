import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider, { useHaremSearch } from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota (mismo criterio que HaremView.kakeraSort.test.tsx de 010): esta
// historia (US1 de 011) se verifica manipulando `HaremSearchContext`
// directamente vía este botón de prueba, sin pasar por `HaremSearchButton`
// (que se construye recién en US2, T010) — un gesto de arrastre real
// tampoco se puede simular de forma confiable en jsdom, así que se valida
// el efecto estructural de `dragDisabled` en su lugar.

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-konosuba',
        name: 'Konosuba',
        characters: [
          { id: 'char-aqua', name: 'Aqua', imageUrl: 'https://x/aqua.png' },
          { id: 'char-megumin', name: 'Megumin', imageUrl: 'https://x/megumin.png' },
        ],
      },
      {
        id: 'series-dragon-ball',
        name: 'Dragon Ball',
        characters: [
          { id: 'char-goku', name: 'Goku', imageUrl: 'https://x/goku.png' },
          { id: 'char-vegeta', name: 'Vegeta', imageUrl: 'https://x/vegeta.png' },
        ],
      },
      {
        id: 'series-demon-slayer',
        name: 'Demon Slayer',
        characters: [{ id: 'char-nezuko', name: 'Nézuko', imageUrl: 'https://x/nezuko.png' }],
      },
    ],
  }
}

function SearchTestControls() {
  const { toggleOpen, setQuery } = useHaremSearch()
  return (
    <>
      <button type="button" onClick={() => toggleOpen()}>
        toggle-open
      </button>
      <input aria-label="test-query" onChange={(event) => setQuery(event.target.value)} />
    </>
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
          <SearchTestControls />
          <HaremView harem={harem} />
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
}

function regionOrder() {
  return screen.queryAllByRole('region').map((region) => region.getAttribute('aria-label'))
}

async function openAndType(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole('button', { name: 'toggle-open' }))
  if (text) {
    await user.type(screen.getByLabelText('test-query'), text)
  }
}

describe('HaremView - buscador de personajes y series (011)', () => {
  it('coincidencia por título de serie: muestra la serie completa, ninguna otra (FR-005)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await openAndType(user, 'Konosuba')

    expect(regionOrder()).toEqual(['Konosuba'])
    const konosuba = screen.getByRole('region', { name: 'Konosuba' })
    expect(within(konosuba).getByText('Aqua')).toBeInTheDocument()
    expect(within(konosuba).getByText('Megumin')).toBeInTheDocument()
  })

  it('coincidencia por nombre de personaje: muestra solo ese personaje bajo su serie (FR-006)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await openAndType(user, 'Goku')

    expect(regionOrder()).toEqual(['Dragon Ball'])
    const dragonBall = screen.getByRole('region', { name: 'Dragon Ball' })
    expect(within(dragonBall).getByText('Goku')).toBeInTheDocument()
    expect(within(dragonBall).queryByText('Vegeta')).not.toBeInTheDocument()
  })

  it('sin coincidencias, muestra un mensaje de "sin resultados" en vez de la grilla vacía (FR-008)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await openAndType(user, 'zzzznoexiste')

    expect(regionOrder()).toEqual([])
    expect(screen.getByText(/sin resultados|no se encontraron/i)).toBeInTheDocument()
  })

  it('con el input vacío, muestra el harem completo (FR-011)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await user.click(screen.getByRole('button', { name: 'toggle-open' }))

    expect(regionOrder()).toEqual(['Konosuba', 'Dragon Ball', 'Demon Slayer'])
  })

  it('con una búsqueda activa, el drag-and-drop de series y personajes queda deshabilitado (FR-012)', async () => {
    const user = userEvent.setup()
    renderHaremView(buildHarem())

    await openAndType(user, 'Goku')

    const handle = screen.getByRole('button', { name: /reordenar serie dragon ball/i })
    expect(handle).toBeDisabled()

    const dragonBall = screen.getByRole('region', { name: 'Dragon Ball' })
    const card = within(dragonBall).getByText('Goku').closest('[aria-disabled]') as HTMLElement
    expect(card).toHaveAttribute('aria-disabled', 'true')
  })
})
