import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremSearchButton from '../../../src/presentation/components/HaremSearchButton'
import HeaderActions from '../../../src/presentation/components/HeaderActions'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
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
        id: 'series-1',
        name: 'Konosuba',
        characters: [
          { id: 'char-1', name: 'Aqua', imageUrl: 'https://x/1.png' },
          { id: 'char-2', name: 'Megumin', imageUrl: 'https://x/2.png' },
        ],
      },
    ],
  }
}

function buildProfile(harem: Harem): Profile {
  return {
    id: harem.profileId,
    serverId: 'server-1',
    username: harem.profileId,
    alias: harem.profileId,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
}

describe('HeaderActions - visibilidad de HaremSearchButton', () => {
  it('sin perfil activo, no se renderiza el botón de búsqueda', () => {
    renderWithTheme(
      <ProfilesProvider repository={new InMemoryProfileRepository()}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <HeaderActions />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    expect(screen.queryByRole('button', { name: /buscar en el harem/i })).not.toBeInTheDocument()
  })

  it('con perfil activo, el botón de búsqueda está visible', () => {
    const harem = buildHarem()
    renderWithTheme(
      <ProfilesProvider repository={new InMemoryProfileRepository([buildProfile(harem)])}>
        <HaremSortProvider>
          <HaremSearchProvider>
            <HeaderActions />
          </HaremSearchProvider>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    expect(screen.getByRole('button', { name: /buscar en el harem/i })).toBeInTheDocument()
  })
})

function renderHaremSearchButton(harem: Harem) {
  const repository = new InMemoryProfileRepository([buildProfile(harem)])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSearchProvider>
          <HaremSearchButton />
          <HaremView harem={harem} />
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
}

describe('HaremSearchButton', () => {
  it('nace colapsado, sin input visible', () => {
    renderHaremSearchButton(buildHarem())

    expect(screen.queryByLabelText(/buscar personaje o serie/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar en el harem/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('al tocar el ícono, se expande hacia un input enfocado', async () => {
    const user = userEvent.setup()
    renderHaremSearchButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))

    const input = screen.getByLabelText(/buscar personaje o serie/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveFocus()
    expect(screen.getByRole('button', { name: /cerrar buscador/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('escribir en el input filtra HaremView tecla por tecla, sin necesitar Enter', async () => {
    const user = userEvent.setup()
    renderHaremSearchButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))
    await user.type(screen.getByLabelText(/buscar personaje o serie/i), 'Megumin')

    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByText('Megumin')).toBeInTheDocument()
    expect(screen.queryByText('Aqua')).not.toBeInTheDocument()
  })

  it('al cerrar con texto ingresado, el input desaparece y el harem completo vuelve a mostrarse; al reabrir, el input está vacío', async () => {
    const user = userEvent.setup()
    renderHaremSearchButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))
    await user.type(screen.getByLabelText(/buscar personaje o serie/i), 'Megumin')
    await user.click(screen.getByRole('button', { name: /cerrar buscador/i }))

    expect(screen.queryByLabelText(/buscar personaje o serie/i)).not.toBeInTheDocument()
    expect(screen.getByText('Aqua')).toBeInTheDocument()
    expect(screen.getByText('Megumin')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /buscar en el harem/i }))

    expect(screen.getByLabelText(/buscar personaje o serie/i)).toHaveValue('')
  })
})
