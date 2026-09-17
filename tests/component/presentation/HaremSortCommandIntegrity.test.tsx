import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremSortButton from '../../../src/presentation/components/HaremSortButton'
import HaremSearchButton from '../../../src/presentation/components/HaremSearchButton'
import SortCommandToggle from '../../../src/presentation/components/SortCommandToggle'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

// Escenario 4 de quickstart.md / Principio II: el comando $sm (009)
// NUNCA debe reflejar el ordenamiento temporal por kakera (010), solo
// el orden manual persistido. Se verifica de punta a punta: activar el
// ordenamiento (que sí reordena lo que HaremView renderiza) y confirmar
// que el comando generado por SortCommandToggle/SortCommandBar sigue
// siendo el del orden manual, antes y después.

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka', imageUrl: 'https://x/1.png', kakera: 5 },
          { id: 'char-2', name: 'Ai', imageUrl: 'https://x/2.png', kakera: 20 },
        ],
      },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [{ id: 'char-3', name: 'Noelle', imageUrl: 'https://x/3.png', kakera: 50 }],
      },
    ],
  }
}

describe('Integridad del comando $sm con el ordenamiento temporal por kakera activo (Principio II)', () => {
  it('el comando exportado sigue en el orden manual, con el ordenamiento por kakera activo o inactivo', async () => {
    const user = userEvent.setup()
    const harem = buildHarem()
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

    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <HaremSortButton />
            <SortCommandToggle />
            <HaremView harem={harem} />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))
    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.click(screen.getByRole('button', { name: /ordenamiento/i }))
    await user.click(screen.getByRole('button', { name: /valor de kakera/i }))

    // El harem renderizado ya está reordenado por kakera (Black Clover
    // primero), pero el comando sigue siendo el manual.
    expect(screen.getByRole('region', { name: 'Black Clover' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /valor de kakera/i }))

    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()
  })
})

// Escenario 7 de quickstart.md / Principio II (011): el comando $sm
// tampoco debe reflejar el filtro de búsqueda temporal — mismo gate
// crítico que el ordenamiento por kakera de arriba, ahora para 011.
describe('Integridad del comando $sm con una búsqueda activa (Principio II, 011)', () => {
  it('el comando exportado sigue enumerando todos los personajes, con la búsqueda activa o inactiva', async () => {
    const user = userEvent.setup()
    const harem = buildHarem()
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

    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <HaremSearchButton />
            <SortCommandToggle />
            <HaremView harem={harem} />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))
    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))
    await user.type(screen.getByLabelText(/buscar personaje o serie/i), 'Noelle')

    // El harem renderizado ya está filtrado (solo "Black Clover"/"Noelle"),
    // pero el comando sigue enumerando a todo el harem.
    expect(screen.queryByRole('region', { name: 'Amagami' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Black Clover' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cerrar buscador/i }))

    expect(screen.getByDisplayValue('$sm Haruka $ Ai $ Noelle')).toBeInTheDocument()
  })
})
