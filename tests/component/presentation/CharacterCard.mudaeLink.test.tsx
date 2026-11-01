import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import CharacterCard from '../../../src/presentation/components/CharacterCard'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Character } from '../../../src/domain/harem/Character'

const CHARACTER: Character = {
  id: 'char-1',
  name: 'Haruka Morishima',
  imageUrl: 'https://mudae.net/x.png',
  kakera: 49,
  claimRank: '#1',
}

describe('CharacterCard - enlace a mudae.net', () => {
  it('enlaza al perfil del personaje en mudae.net, en una pestaña nueva', () => {
    renderWithTheme(<CharacterCard character={CHARACTER} />)

    const link = screen.getByRole('link', { name: /ver haruka morishima en mudae\.net/i })
    expect(link).toHaveAttribute('href', 'https://mudae.net/character/Haruka%20Morishima')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('data-mudae-profile-link')
  })

  it('al pasar el mouse muestra un tooltip que sigue al cursor, y lo oculta al salir', () => {
    renderWithTheme(<CharacterCard character={CHARACTER} />)
    const link = screen.getByRole('link', { name: /ver haruka morishima en mudae\.net/i })

    fireEvent.pointerEnter(link, { pointerType: 'mouse', clientX: 10, clientY: 20 })
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Ver en Mudae.net')
    expect(tooltip.style.top).toBe('32px')

    fireEvent.pointerMove(link, { pointerType: 'mouse', clientX: 10, clientY: 50 })
    expect(tooltip.style.top).toBe('62px')

    fireEvent.pointerLeave(link)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
