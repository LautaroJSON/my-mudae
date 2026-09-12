import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import Header from '../../../src/presentation/components/Header'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    serverId: 'server-1',
    username: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: 'rodoifin', series: [] },
    ...overrides,
  }
}

function renderHeader(repository = new InMemoryProfileRepository()) {
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <Header />
    </ProfilesProvider>,
  )
}

describe('Header', () => {
  it('muestra el título "MyMudae"', () => {
    renderHeader()

    expect(screen.getByText('MyMudae')).toBeInTheDocument()
  })

  it('sin perfil activo, invita a crear uno en vez de mostrar un nombre', () => {
    renderHeader()

    expect(screen.getByRole('button', { name: /abrir perfiles/i })).toHaveTextContent(/crear perfil/i)
  })

  it('con perfil activo, muestra su alias', () => {
    renderHeader(new InMemoryProfileRepository([buildProfile()]))

    expect(screen.getByRole('button', { name: /abrir perfiles/i })).toHaveTextContent('rodoifin')
  })

  it('al presionar el control de perfil, abre el modal de perfiles', async () => {
    const user = userEvent.setup()
    renderHeader()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /abrir perfiles/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('muestra el icono "Compartir harem" junto al control de perfil', () => {
    renderHeader(new InMemoryProfileRepository([buildProfile()]))

    expect(screen.getByRole('button', { name: /compartir harem/i })).toBeInTheDocument()
  })

  it('sin perfil activo, el icono "Compartir harem" aparece deshabilitado', () => {
    renderHeader()

    expect(screen.getByRole('button', { name: /compartir harem/i })).toBeDisabled()
  })

  it('con perfil activo, incluso con harem vacío, el icono "Actualizar harem" está habilitado', () => {
    renderHeader(new InMemoryProfileRepository([buildProfile()]))

    expect(screen.getByRole('button', { name: /actualizar harem/i })).toBeEnabled()
  })

  it('sin perfil activo, el icono "Actualizar harem" aparece deshabilitado', () => {
    renderHeader()

    expect(screen.getByRole('button', { name: /actualizar harem/i })).toBeDisabled()
  })
})
