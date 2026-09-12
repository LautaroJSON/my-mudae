import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDeleteServerDialog from '../../../src/presentation/components/ConfirmDeleteServerDialog'
import { renderWithTheme } from '../../support/renderWithTheme'

describe('ConfirmDeleteServerDialog', () => {
  it('renderiza la cantidad de perfiles y un <ul> con los alias afectados', () => {
    renderWithTheme(
      <ConfirmDeleteServerDialog
        serverName="Server A"
        profileAliases={['rodoifin', 'otrousuario']}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('alertdialog', { name: /eliminar servidor server a/i })
    expect(dialog).toHaveTextContent('2')
    const list = dialog.querySelector('ul')
    expect(list).not.toBeNull()
    expect(list).toHaveTextContent('rodoifin')
    expect(list).toHaveTextContent('otrousuario')
  })

  it('confirmar llama a onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithTheme(
      <ConfirmDeleteServerDialog serverName="Server A" profileAliases={['a']} onConfirm={onConfirm} onCancel={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelar llama a onCancel sin ningún otro efecto', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    renderWithTheme(
      <ConfirmDeleteServerDialog serverName="Server A" profileAliases={['a']} onConfirm={onConfirm} onCancel={onCancel} />,
    )

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
