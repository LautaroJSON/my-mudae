import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../../src/presentation/components/Modal'
import { renderWithTheme } from '../../support/renderWithTheme'

describe('Modal', () => {
  it('muestra un botón "Cerrar" (X) en la esquina superior derecha, que llama a onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithTheme(
      <Modal onClose={onClose} ariaLabel="Título de prueba">
        <p>Contenido</p>
      </Modal>,
    )

    const closeButton = screen.getByRole('button', { name: /cerrar/i })
    expect(closeButton).toBeInTheDocument()

    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sigue cerrando con Escape y con click afuera del diálogo, además del botón nuevo', async () => {
    const user = userEvent.setup()
    const onCloseEscape = vi.fn()
    const { unmount } = renderWithTheme(
      <Modal onClose={onCloseEscape} ariaLabel="Título de prueba">
        <p>Contenido</p>
      </Modal>,
    )
    await user.keyboard('{Escape}')
    expect(onCloseEscape).toHaveBeenCalledTimes(1)
    unmount()

    const onCloseOutside = vi.fn()
    renderWithTheme(
      <Modal onClose={onCloseOutside} ariaLabel="Título de prueba">
        <p>Contenido</p>
      </Modal>,
    )
    await user.click(screen.getByRole('dialog', { name: /título de prueba/i }).parentElement as HTMLElement)
    expect(onCloseOutside).toHaveBeenCalledTimes(1)
  })
})
