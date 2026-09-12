import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ShareHaremButton from '../../../src/presentation/components/ShareHaremButton'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'
import { copyTextToClipboard } from '../../../src/presentation/copyToClipboard'

vi.mock('../../../src/presentation/copyToClipboard', () => ({
  copyTextToClipboard: vi.fn(),
}))

const mockedCopyTextToClipboard = vi.mocked(copyTextToClipboard)

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://mudae.net/x.png', kakera: 49, claimRank: '#15,140' },
          ],
        },
      ],
    },
    ...overrides,
  }
}

function renderButton(repository = new InMemoryProfileRepository()) {
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <ShareHaremButton />
    </ProfilesProvider>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ShareHaremButton', () => {
  it('está deshabilitado sin ningún perfil activo', () => {
    renderButton()

    expect(screen.getByRole('button', { name: /compartir harem/i })).toBeDisabled()
  })

  it('está deshabilitado cuando el perfil activo tiene el harem vacío', () => {
    renderButton(new InMemoryProfileRepository([buildProfile({ harem: { profileId: 'rodoifin', series: [] } })]))

    expect(screen.getByRole('button', { name: /compartir harem/i })).toBeDisabled()
  })

  it('habilitado con un perfil activo con harem cargado', () => {
    renderButton(new InMemoryProfileRepository([buildProfile()]))

    expect(screen.getByRole('button', { name: /compartir harem/i })).toBeEnabled()
  })

  it('al copiar con éxito, llama a copyTextToClipboard con el texto en formato de pegado y muestra feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(true)
    const user = userEvent.setup()
    renderButton(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /compartir harem/i }))

    expect(mockedCopyTextToClipboard).toHaveBeenCalledWith(
      expect.stringContaining("rodoifin's harem"),
    )
    expect(await screen.findByRole('button', { name: /harem copiado/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cuando el copiado automático falla, abre el diálogo de copiado manual con el texto del harem (no un error de entrada)', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderButton(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /compartir harem/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/no se pudo copiar automáticamente/i)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain("rodoifin's harem")
    expect(screen.queryByRole('button', { name: /harem copiado/i })).not.toBeInTheDocument()
  })

  it('confirmar el diálogo de copiado manual muestra el mismo feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderButton(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /compartir harem/i }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /ya lo copié/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /harem copiado/i })).toBeInTheDocument()
  })

  it('cerrar el diálogo de copiado manual sin confirmar no muestra ningún feedback', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderButton(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /compartir harem/i }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /harem copiado/i })).not.toBeInTheDocument()
  })
})
