import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremSearchButton from '../../../src/presentation/components/HaremSearchButton'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-a',
    serverId: 'server-1',
    username: 'usuario-a',
    alias: 'usuario-a',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: {
      profileId: 'profile-a',
      series: [
        {
          id: 'series-1',
          name: 'Konosuba',
          characters: [{ id: 'char-1', name: 'Aqua', imageUrl: 'https://x/1.png' }],
        },
      ],
    },
    ...overrides,
  }
}

function ActivateProfileB() {
  const { activateProfile } = useProfiles()
  return (
    <button type="button" onClick={() => activateProfile('profile-b')}>
      activar-perfil-b
    </button>
  )
}

describe('HaremSearchButton - limpieza automática al cambiar de perfil (011 US3)', () => {
  it('cambiar de perfil activo cierra el buscador, limpia el texto y muestra el harem completo del nuevo perfil', async () => {
    const user = userEvent.setup()
    const profileA = buildProfile()
    const profileB = buildProfile({
      id: 'profile-b',
      isActive: false,
      username: 'usuario-b',
      alias: 'usuario-b',
      harem: {
        profileId: 'profile-b',
        series: [
          {
            id: 'series-2',
            name: 'Dragon Ball',
            characters: [{ id: 'char-2', name: 'Goku', imageUrl: 'https://x/2.png' }],
          },
        ],
      },
    })
    const repository = new InMemoryProfileRepository([profileA, profileB])

    function Scenario() {
      const { activeProfile } = useProfiles()
      return (
        <>
          <ActivateProfileB />
          <HaremSearchButton />
          {activeProfile && <HaremView key={activeProfile.id} harem={activeProfile.harem} />}
        </>
      )
    }

    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <Scenario />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))
    await user.type(screen.getByLabelText(/buscar personaje o serie/i), 'Aqua')

    expect(screen.getAllByRole('region')).toEqual([screen.getByRole('region', { name: 'Konosuba' })])

    await user.click(screen.getByRole('button', { name: 'activar-perfil-b' }))

    expect(screen.queryByLabelText(/buscar personaje o serie/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar en el harem/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('region', { name: 'Dragon Ball' })).toBeInTheDocument()
    expect(screen.getByText('Goku')).toBeInTheDocument()
  })
})
