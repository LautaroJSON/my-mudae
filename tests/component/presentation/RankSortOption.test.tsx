import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RankSortOption from '../../../src/presentation/components/RankSortOption'
import { renderWithTheme } from '../../support/renderWithTheme'

describe('RankSortOption', () => {
  it('se renderiza como una opción deshabilitada', () => {
    renderWithTheme(<RankSortOption />)

    expect(screen.getByRole('button', { name: /^rank$/i })).toBeDisabled()
  })

  it('presionarla no dispara ningún error ni cambio observable (placeholder inerte, FR-005)', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RankSortOption />)

    await expect(user.click(screen.getByRole('button', { name: /^rank$/i }))).resolves.not.toThrow()
  })
})
