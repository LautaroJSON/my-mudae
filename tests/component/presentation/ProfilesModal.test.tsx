import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ProfilesModal from '../../../src/presentation/components/ProfilesModal'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

const VALID_HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'existente',
    alias: 'existente',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: { profileId: 'existente', series: [] },
    ...overrides,
  }
}

function renderModal(repository = new InMemoryProfileRepository()) {
  const onClose = vi.fn()
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <ProfilesModal onClose={onClose} />
    </ProfilesProvider>,
  )
  return { repository, onClose }
}

describe('ProfilesModal', () => {
  it('sin perfiles, muestra directamente el título "Agregar perfil" y la zona de pegado, sin la lista ni flecha de volver', () => {
    renderModal()

    expect(screen.getByRole('heading', { name: /agregar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByLabelText('Lista de perfiles')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /volver a la lista de perfiles/i })).not.toBeInTheDocument()
  })

  it('pegar un harem válido crea el perfil y pide cerrar el modal (no se queda mostrando la lista)', async () => {
    const user = userEvent.setup()
    const { repository, onClose } = renderModal()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)

    expect(repository.getAll()).toHaveLength(1)
    expect(repository.getAll()[0].id).toBe('rodoifin')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('con perfiles existentes, muestra el título "Perfiles", la lista y un botón "nuevo perfil" en vez de la zona de pegado', () => {
    renderModal(new InMemoryProfileRepository([buildProfile()]))

    expect(screen.getByRole('heading', { name: /^perfiles$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'existente' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nuevo perfil/i })).toBeInTheDocument()
  })

  it('presionar "nuevo perfil" cambia el título a "Agregar perfil", oculta la lista, y muestra una flecha para volver', async () => {
    const user = userEvent.setup()
    const { repository, onClose } = renderModal(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /nuevo perfil/i }))

    expect(screen.getByRole('heading', { name: /agregar perfil/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Lista de perfiles')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nuevo perfil/i })).not.toBeInTheDocument()
    const backButton = screen.getByRole('button', { name: /volver a la lista de perfiles/i })
    expect(backButton).toBeInTheDocument()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)

    expect(repository.getAll()).toHaveLength(2)
    const newProfile = repository.getAll().find((profile) => profile.id === 'rodoifin')
    expect(newProfile?.isActive).toBe(true)
    // Al crearse con éxito, se pide cerrar el modal entero (lo decide
    // quien lo montó — Header — no ProfilesModal quedándose en la lista).
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('la flecha de "volver" regresa a la lista sin crear ningún perfil ni pedir el cierre del modal', async () => {
    const user = userEvent.setup()
    const { repository, onClose } = renderModal(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /nuevo perfil/i }))
    await user.click(screen.getByRole('button', { name: /volver a la lista de perfiles/i }))

    expect(screen.getByRole('heading', { name: /^perfiles$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'existente' })).toBeInTheDocument()
    expect(repository.getAll()).toHaveLength(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('seleccionar un perfil distinto en la lista lo activa (FR-006)', async () => {
    const user = userEvent.setup()
    const { repository } = renderModal(
      new InMemoryProfileRepository([
        buildProfile({ id: 'a', alias: 'a', isActive: true, order: 0 }),
        buildProfile({ id: 'b', alias: 'b', isActive: false, order: 1 }),
      ]),
    )

    await user.click(screen.getByRole('button', { name: 'b' }))

    const profiles = repository.getAll()
    expect(profiles.find((p) => p.id === 'a')?.isActive).toBe(false)
    expect(profiles.find((p) => p.id === 'b')?.isActive).toBe(true)
  })

  it('el diálogo de confirmación de borrado funciona anidado dentro del modal (User Story 6 de 002)', async () => {
    const user = userEvent.setup()
    const { repository } = renderModal(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /eliminar perfil existente/i }))

    const confirmDialog = screen.getByRole('alertdialog', { name: /eliminar perfil existente/i })
    expect(confirmDialog).toHaveTextContent(/existente/i)
    // El modal de perfiles (el otro "dialog") sigue presente detrás.
    expect(screen.getByRole('dialog', { name: /perfiles/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(repository.getAll()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /eliminar perfil existente/i }))
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))
    expect(repository.getAll()).toHaveLength(0)
  })
})
