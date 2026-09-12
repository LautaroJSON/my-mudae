import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ProfilesModal from '../../../src/presentation/components/ProfilesModal'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'
import type { Server } from '../../../src/domain/server/Server'

const VALID_HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'existente',
    serverId: 'server-1',
    username: 'existente',
    alias: 'existente',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: 'existente', series: [] },
    ...overrides,
  }
}

function renderModal(profiles: Profile[] = [], servers: Server[] = []) {
  const onClose = vi.fn()
  const profileRepository = new InMemoryProfileRepository(profiles)
  const serverRepository = new InMemoryServerRepository(
    servers.length > 0 || profiles.length === 0
      ? servers
      : [{ id: 'server-1', name: 'Server 1', profileIds: profiles.map((p) => p.id) }],
  )
  renderWithTheme(
    <ProfilesProvider repository={profileRepository} serverRepository={serverRepository}>
      <ProfilesModal onClose={onClose} />
    </ProfilesProvider>,
  )
  return { profileRepository, serverRepository, onClose }
}

async function pasteAndConfirmServer(user: ReturnType<typeof userEvent.setup>, serverName = 'Mi servidor') {
  await user.click(screen.getByRole('textbox'))
  await user.paste(VALID_HAREM)
  await user.type(screen.getByLabelText('Servidor nuevo'), serverName)
  await user.click(screen.getByRole('button', { name: /^confirmar$/i }))
}

describe('ProfilesModal', () => {
  it('sin perfiles, muestra directamente el título "Agregar perfil" y la zona de pegado, sin la lista ni flecha de volver', () => {
    renderModal()

    expect(screen.getByRole('heading', { name: /agregar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByLabelText('Lista de servidores')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /volver a la lista de perfiles/i })).not.toBeInTheDocument()
  })

  it('pegar un harem válido y confirmar el servidor crea el perfil y pide cerrar el modal', async () => {
    const user = userEvent.setup()
    const { profileRepository, onClose } = renderModal()

    await pasteAndConfirmServer(user)

    expect(profileRepository.getAll()).toHaveLength(1)
    expect(profileRepository.getAll()[0].alias).toBe('rodoifin')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('con perfiles existentes, muestra el título "Perfiles", la lista agrupada por servidor y un botón "nuevo perfil" en vez de la zona de pegado', () => {
    renderModal([buildProfile()])

    expect(screen.getByRole('heading', { name: /^perfiles$/i })).toBeInTheDocument()
    expect(screen.getByText('Server 1')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nuevo perfil/i })).toBeInTheDocument()
  })

  it('presionar "nuevo perfil" cambia el título a "Agregar perfil", oculta la lista, y muestra una flecha para volver', async () => {
    const user = userEvent.setup()
    const { profileRepository, onClose } = renderModal([buildProfile()])

    await user.click(screen.getByRole('button', { name: /nuevo perfil/i }))

    expect(screen.getByRole('heading', { name: /agregar perfil/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Lista de servidores')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nuevo perfil/i })).not.toBeInTheDocument()
    const backButton = screen.getByRole('button', { name: /volver a la lista de perfiles/i })
    expect(backButton).toBeInTheDocument()

    await pasteAndConfirmServer(user)

    expect(profileRepository.getAll()).toHaveLength(2)
    const newProfile = profileRepository.getAll().find((profile) => profile.alias === 'rodoifin')
    expect(newProfile?.isActive).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('la flecha de "volver" regresa a la lista sin crear ningún perfil ni pedir el cierre del modal', async () => {
    const user = userEvent.setup()
    const { profileRepository, onClose } = renderModal([buildProfile()])

    await user.click(screen.getByRole('button', { name: /nuevo perfil/i }))
    await user.click(screen.getByRole('button', { name: /volver a la lista de perfiles/i }))

    expect(screen.getByRole('heading', { name: /^perfiles$/i })).toBeInTheDocument()
    expect(screen.getByText('Server 1')).toBeInTheDocument()
    expect(profileRepository.getAll()).toHaveLength(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('seleccionar un perfil distinto en la lista lo activa (FR-006)', async () => {
    const user = userEvent.setup()
    const server: Server = { id: 'server-1', name: 'Server 1', profileIds: ['a', 'b'] }
    const { profileRepository } = renderModal(
      [
        buildProfile({ id: 'a', serverId: 'server-1', username: 'a', alias: 'a', isActive: true }),
        buildProfile({ id: 'b', serverId: 'server-1', username: 'b', alias: 'b', isActive: false }),
      ],
      [server],
    )

    await user.click(screen.getByText('Server 1'))
    await user.click(screen.getByRole('button', { name: 'b' }))

    const profiles = profileRepository.getAll()
    expect(profiles.find((p) => p.id === 'a')?.isActive).toBe(false)
    expect(profiles.find((p) => p.id === 'b')?.isActive).toBe(true)
  })

  it('el diálogo de confirmación de borrado de perfil funciona anidado dentro del modal (User Story 6 de 002)', async () => {
    const user = userEvent.setup()
    const { profileRepository } = renderModal([buildProfile()])

    await user.click(screen.getByText('Server 1'))
    await user.click(screen.getByRole('button', { name: /eliminar perfil existente/i }))

    const confirmDialog = screen.getByRole('alertdialog', { name: /eliminar perfil existente/i })
    expect(confirmDialog).toHaveTextContent(/existente/i)
    expect(screen.getByRole('dialog', { name: /perfiles/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(profileRepository.getAll()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /eliminar perfil existente/i }))
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))
    expect(profileRepository.getAll()).toHaveLength(0)
  })
})
