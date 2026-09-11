import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileCard from '../../../src/presentation/components/ProfileCard'
import type { Profile } from '../../../src/domain/profile/Profile'
import { renderWithTheme } from '../../support/renderWithTheme'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: { profileId: 'rodoifin', series: [] },
    ...overrides,
  }
}

describe('ProfileCard - renombrado', () => {
  it('permite editar el nombre y confirma el cambio con Enter (FR-009)', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    renderWithTheme(
      <ProfileCard profile={buildProfile()} onActivate={vi.fn()} onDelete={vi.fn()} onRename={onRename} onOpenInNewTab={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /editar nombre de rodoifin/i }))
    const input = screen.getByRole('textbox', { name: /nombre del perfil/i })
    await user.clear(input)
    await user.type(input, 'Mi cuenta principal{Enter}')

    expect(onRename).toHaveBeenCalledWith('rodoifin', 'Mi cuenta principal')
  })

  it('cancela la edición con Escape sin llamar a onRename', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    renderWithTheme(
      <ProfileCard profile={buildProfile()} onActivate={vi.fn()} onDelete={vi.fn()} onRename={onRename} onOpenInNewTab={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /editar nombre de rodoifin/i }))
    const input = screen.getByRole('textbox', { name: /nombre del perfil/i })
    await user.type(input, ' cambiado{Escape}')

    expect(onRename).not.toHaveBeenCalled()
    expect(screen.getByText('rodoifin')).toBeInTheDocument()
  })

  it('pide confirmación antes de eliminar y solo llama a onDelete al confirmar (FR-011)', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderWithTheme(
      <ProfileCard profile={buildProfile()} onActivate={vi.fn()} onDelete={onDelete} onRename={vi.fn()} onOpenInNewTab={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /eliminar perfil rodoifin/i }))
    expect(onDelete).not.toHaveBeenCalled()

    expect(screen.getByRole('alertdialog')).toHaveTextContent(/rodoifin/i)
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    expect(onDelete).toHaveBeenCalledWith('rodoifin')
  })

  it('cancelar el diálogo de confirmación no elimina el perfil', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderWithTheme(
      <ProfileCard profile={buildProfile()} onActivate={vi.fn()} onDelete={onDelete} onRename={vi.fn()} onOpenInNewTab={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /eliminar perfil rodoifin/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
