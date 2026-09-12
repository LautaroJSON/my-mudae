import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterCard from '../../../src/presentation/components/CharacterCard'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Character } from '../../../src/domain/harem/Character'
import { copyTextToClipboard } from '../../../src/presentation/copyToClipboard'

vi.mock('../../../src/presentation/copyToClipboard', () => ({
  copyTextToClipboard: vi.fn(),
}))

const mockedCopyTextToClipboard = vi.mocked(copyTextToClipboard)

const CHARACTER: Character = {
  id: 'char-1',
  name: 'Haruka Morishima',
  imageUrl: 'https://mudae.net/x.png',
  kakera: 49,
  claimRank: '#1',
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('CharacterCard - copiar nombre', () => {
  it('renderiza el botón de copiar con el atributo marcador para el revelado por CSS', () => {
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    const button = screen.getByRole('button', { name: /copiar nombre de haruka morishima/i })
    expect(button).toHaveAttribute('data-copy-name-button')
  })

  it('al copiar con éxito, llama a copyTextToClipboard con el nombre exacto y muestra feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(true)
    const user = userEvent.setup()
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    await user.click(screen.getByRole('button', { name: /copiar nombre de haruka morishima/i }))

    expect(mockedCopyTextToClipboard).toHaveBeenCalledWith('Haruka Morishima')
    expect(await screen.findByRole('button', { name: /nombre copiado/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cuando el copiado automático falla, abre el diálogo de copiado manual con el nombre (no un error de entrada)', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    await user.click(screen.getByRole('button', { name: /copiar nombre de haruka morishima/i }))

    const dialog = await screen.findByRole('dialog')
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Haruka Morishima')
    expect(dialog).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nombre copiado/i })).not.toBeInTheDocument()
  })

  it('confirmar el diálogo de copiado manual muestra el mismo feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    await user.click(screen.getByRole('button', { name: /copiar nombre de haruka morishima/i }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /ya lo copié/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /nombre copiado/i })).toBeInTheDocument()
  })

  it('cerrar el diálogo de copiado manual sin confirmar no muestra ningún feedback', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    await user.click(screen.getByRole('button', { name: /copiar nombre de haruka morishima/i }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nombre copiado/i })).not.toBeInTheDocument()
  })

  it('un pointerdown sobre el botón no propaga a un listener puesto en un elemento ancestro (no interfiere con el arrastre)', () => {
    const ancestorPointerDown = vi.fn()
    renderWithTheme(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onPointerDown={ancestorPointerDown}>
        <CharacterCard character={CHARACTER} />
      </div>,
    )

    const button = screen.getByRole('button', { name: /copiar nombre de haruka morishima/i })
    fireEvent.pointerDown(button)

    expect(ancestorPointerDown).not.toHaveBeenCalled()
  })
})
