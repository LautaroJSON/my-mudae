import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import CopyCommandButton from '../../../src/presentation/components/CopyCommandButton'
import { renderWithTheme } from '../../support/renderWithTheme'
import { copyTextToClipboard } from '../../../src/presentation/copyToClipboard'
import { theme } from '../../../src/shared/theme'

vi.mock('../../../src/presentation/copyToClipboard', () => ({
  copyTextToClipboard: vi.fn(),
}))

const mockedCopyTextToClipboard = vi.mocked(copyTextToClipboard)

afterEach(() => {
  vi.clearAllMocks()
})

describe('CopyCommandButton', () => {
  it('nace deshabilitado cuando text es null', () => {
    renderWithTheme(<CopyCommandButton text={null} />)

    expect(screen.getByRole('button', { name: /copiar comando/i })).toBeDisabled()
  })

  it('está habilitado cuando text es un comando válido', () => {
    renderWithTheme(<CopyCommandButton text="$sm Esdeath" />)

    expect(screen.getByRole('button', { name: /copiar comando/i })).toBeEnabled()
  })

  it('al copiar con éxito, llama a copyTextToClipboard con el texto exacto y muestra feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(true)
    const user = userEvent.setup()
    renderWithTheme(<CopyCommandButton text="$sm Esdeath $ Falin Touden" />)

    await user.click(screen.getByRole('button', { name: /copiar comando/i }))

    expect(mockedCopyTextToClipboard).toHaveBeenCalledWith('$sm Esdeath $ Falin Touden')
    expect(await screen.findByRole('button', { name: /copiado/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cuando el copiado automático falla, abre el diálogo de copiado manual con el mismo texto', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CopyCommandButton text="$sm Esdeath" />)

    await user.click(screen.getByRole('button', { name: /copiar comando/i }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/no se pudo copiar automáticamente/i)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('$sm Esdeath')
    expect(screen.queryByRole('button', { name: /^copiado/i })).not.toBeInTheDocument()
  })

  it('confirmar el diálogo de copiado manual muestra el mismo feedback de éxito', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CopyCommandButton text="$sm Esdeath" />)

    await user.click(screen.getByRole('button', { name: /copiar comando/i }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /ya lo copié/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /copiado/i })).toBeInTheDocument()
  })

  it('cerrar el diálogo de copiado manual sin confirmar no muestra ningún feedback', async () => {
    mockedCopyTextToClipboard.mockResolvedValueOnce(false)
    const user = userEvent.setup()
    renderWithTheme(<CopyCommandButton text="$sm Esdeath" />)

    await user.click(screen.getByRole('button', { name: /copiar comando/i }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^copiado/i })).not.toBeInTheDocument()
  })

  it('copiar, cambiar el text por prop, y volver a copiar usa el nuevo texto', async () => {
    mockedCopyTextToClipboard.mockResolvedValue(true)
    const user = userEvent.setup()
    const { rerender } = renderWithTheme(<CopyCommandButton text="$sm Esdeath" />)

    await user.click(screen.getByRole('button', { name: /copiar comando/i }))
    expect(mockedCopyTextToClipboard).toHaveBeenLastCalledWith('$sm Esdeath')

    rerender(
      <ThemeProvider theme={theme}>
        <CopyCommandButton text="$sm Falin Touden" />
      </ThemeProvider>,
    )
    await user.click(screen.getByRole('button'))

    expect(mockedCopyTextToClipboard).toHaveBeenLastCalledWith('$sm Falin Touden')
  })
})
