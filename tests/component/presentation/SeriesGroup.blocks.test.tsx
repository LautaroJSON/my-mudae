import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-x',
        name: 'Amagami',
        characters: [
          { id: 'char-a', name: 'Haruka', imageUrl: 'https://x/a.png' },
          { id: 'char-b', name: 'Ai', imageUrl: 'https://x/b.png' },
          { id: 'char-c', name: 'Rihoko', imageUrl: 'https://x/c.png' },
        ],
      },
      {
        id: 'series-y',
        name: 'Black Clover',
        characters: [{ id: 'char-z', name: 'Noelle', imageUrl: 'https://x/z.png' }],
      },
    ],
  }
}

const ActiveHarem = () => {
  const { activeProfile } = useProfiles()
  return activeProfile ? <HaremView harem={activeProfile.harem} /> : null
}

function renderHarem(harem: Harem) {
  const profile: Profile = {
    id: 'profile-1',
    serverId: 'server-1',
    username: 'profile-1',
    alias: 'profile-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
  const repository = new InMemoryProfileRepository([profile])
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSearchProvider>
          <ActiveHarem />
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
  return repository
}

async function moveTo(characterName: string, optionLabel: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: `Mover ${characterName} a otro bloque` }))
  const dialog = screen.getByRole('dialog', { name: `Mover ${characterName}` })
  await user.click(within(dialog).getByRole('button', { name: optionLabel }))
}

describe('SeriesGroup - bloques de una misma serie (012)', () => {
  it('no ofrece "Mover a…" en una serie de un solo personaje', () => {
    renderHarem(buildHarem())
    expect(screen.queryByRole('button', { name: 'Mover Noelle a otro bloque' })).toBeNull()
  })

  it('separa un personaje a un bloque nuevo con el nombre de la serie, persistido', async () => {
    const repository = renderHarem(buildHarem())

    await moveTo('Rihoko', 'Bloque nuevo')

    const detached = screen.getByRole('region', { name: 'Amagami · bloque 2' })
    expect(within(detached).getByText('Rihoko')).toBeDefined()
    expect(within(screen.getByRole('region', { name: 'Amagami' })).queryByText('Rihoko')).toBeNull()
    expect(repository.getAll()[0].harem.series.map((series) => series.name)).toEqual(['Amagami', 'Amagami', 'Black Clover'])
  })

  it('arma un bloque separado con varios personajes y lo vuelve a unir a la serie', async () => {
    renderHarem(buildHarem())

    await moveTo('Rihoko', 'Bloque nuevo')
    await moveTo('Ai', 'Amagami · bloque 2')

    const detached = screen.getByRole('region', { name: 'Amagami · bloque 2' })
    expect(within(detached).getAllByText(/Rihoko|Ai/).map((el) => el.textContent)).toEqual(['Rihoko', 'Ai'])

    await userEvent.setup().click(screen.getByRole('button', { name: 'Unir Amagami · bloque 2 a Amagami' }))

    expect(screen.queryByRole('region', { name: 'Amagami · bloque 2' })).toBeNull()
    const principal = screen.getByRole('region', { name: 'Amagami' })
    expect(within(principal).getAllByText(/Haruka|Rihoko|Ai/).map((el) => el.textContent)).toEqual([
      'Haruka',
      'Rihoko',
      'Ai',
    ])
  })

  it('"Mover a…" nunca ofrece bloques de otra serie', async () => {
    renderHarem(buildHarem())

    await userEvent.setup().click(screen.getByRole('button', { name: 'Mover Haruka a otro bloque' }))

    const dialog = screen.getByRole('dialog', { name: 'Mover Haruka' })
    expect(within(dialog).queryByRole('button', { name: /Black Clover/ })).toBeNull()
  })
})
