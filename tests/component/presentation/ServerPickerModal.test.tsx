import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ServerPickerModal from '../../../src/presentation/components/ServerPickerModal'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'
import type { Server } from '../../../src/domain/server/Server'

function buildProfile(id: string, serverId: string, alias = id): Profile {
  return {
    id,
    serverId,
    username: id,
    alias,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: id, series: [] },
  }
}

function renderModal({
  servers = [] as Server[],
  profiles = [] as Profile[],
  onConfirm = vi.fn(),
  onClose = vi.fn(),
} = {}) {
  const serverRepository = new InMemoryServerRepository(servers)
  const profileRepository = new InMemoryProfileRepository(profiles)
  renderWithTheme(
    <ProfilesProvider repository={profileRepository} serverRepository={serverRepository}>
      <ServerPickerModal onConfirm={onConfirm} onClose={onClose} />
    </ProfilesProvider>,
  )
  return { serverRepository, profileRepository, onConfirm, onClose }
}

describe('ServerPickerModal', () => {
  it('sin servidores existentes, no muestra ninguna lista de radios', () => {
    renderModal()

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^confirmar$/i })).toBeDisabled()
  })

  it('el input de texto respeta un máximo de 50 caracteres', () => {
    renderModal()

    expect(screen.getByLabelText('Servidor nuevo')).toHaveAttribute('maxLength', '50')
  })

  it('con servidores existentes, muestra un radio por servidor; elegir uno deshabilita el input de texto', async () => {
    const user = userEvent.setup()
    renderModal({ servers: [{ id: 's1', name: 'Server A', profileIds: [] }] })

    const radio = screen.getByRole('radio', { name: 'Server A' })
    expect(radio).toBeInTheDocument()

    await user.click(radio)

    expect(screen.getByLabelText('Servidor nuevo')).toBeDisabled()
  })

  it('confirmar sin texto ni radio está deshabilitado; escribir texto lo habilita', async () => {
    const user = userEvent.setup()
    renderModal()

    const confirmButton = screen.getByRole('button', { name: /^confirmar$/i })
    expect(confirmButton).toBeDisabled()

    await user.type(screen.getByLabelText('Servidor nuevo'), 'Mi server')

    expect(confirmButton).toBeEnabled()
  })

  it('confirmar con texto llama a onConfirm con new-server', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal()

    await user.type(screen.getByLabelText('Servidor nuevo'), 'Mi server')
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    expect(onConfirm).toHaveBeenCalledWith({ kind: 'new-server', name: 'Mi server' })
  })

  it('confirmar con un radio elegido llama a onConfirm con existing-server', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal({ servers: [{ id: 's1', name: 'Server A', profileIds: [] }] })

    await user.click(screen.getByRole('radio', { name: 'Server A' }))
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    expect(onConfirm).toHaveBeenCalledWith({ kind: 'existing-server', serverId: 's1' })
  })

  it('eliminar un servidor vacío lo quita de inmediato, sin ningún diálogo adicional', async () => {
    const user = userEvent.setup()
    const { serverRepository } = renderModal({ servers: [{ id: 's1', name: 'Server A', profileIds: [] }] })

    await user.click(screen.getByRole('button', { name: /eliminar servidor server a/i }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(serverRepository.getAll()).toEqual([])
  })

  it('eliminar un servidor con perfiles abre la advertencia con la lista de alias correcta', async () => {
    const user = userEvent.setup()
    renderModal({
      servers: [{ id: 's1', name: 'Server A', profileIds: ['a', 'b'] }],
      profiles: [buildProfile('a', 's1'), buildProfile('b', 's1')],
    })

    await user.click(screen.getByRole('button', { name: /eliminar servidor server a/i }))

    const dialog = screen.getByRole('alertdialog', { name: /eliminar servidor server a/i })
    expect(dialog).toHaveTextContent('a')
    expect(dialog).toHaveTextContent('b')
  })

  it('cancelar la advertencia no elimina nada ni cierra el ServerPickerModal', async () => {
    const user = userEvent.setup()
    const { serverRepository } = renderModal({
      servers: [{ id: 's1', name: 'Server A', profileIds: ['a'] }],
      profiles: [buildProfile('a', 's1')],
    })

    await user.click(screen.getByRole('button', { name: /eliminar servidor server a/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /elegir servidor/i })).toBeInTheDocument()
    expect(serverRepository.getAll()).toEqual([{ id: 's1', name: 'Server A', profileIds: ['a'] }])
  })

  it('confirmar la advertencia elimina el servidor y sus perfiles', async () => {
    const user = userEvent.setup()
    const { serverRepository, profileRepository } = renderModal({
      servers: [{ id: 's1', name: 'Server A', profileIds: ['a'] }],
      profiles: [buildProfile('a', 's1')],
    })

    await user.click(screen.getByRole('button', { name: /eliminar servidor server a/i }))
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    expect(serverRepository.getAll()).toEqual([])
    expect(profileRepository.getAll()).toEqual([])
  })
})
