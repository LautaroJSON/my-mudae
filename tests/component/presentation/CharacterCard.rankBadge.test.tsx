import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import CharacterCard from '../../../src/presentation/components/CharacterCard'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Character } from '../../../src/domain/harem/Character'

const CHARACTER_WITH_RANK: Character = {
  id: 'char-1',
  name: 'Haruka Morishima',
  imageUrl: 'https://mudae.net/x.png',
  kakera: 49,
  claimRank: '#15,140',
}

const CHARACTER_WITHOUT_RANK: Character = {
  id: 'char-2',
  name: 'Noelle Silva',
  imageUrl: 'https://mudae.net/y.png',
}

describe('CharacterCard - rango de reclamo', () => {
  it('el rango se renderiza dentro de la insignia revelada por hover, no como texto siempre visible en el cuerpo de la tarjeta', () => {
    renderWithTheme(<CharacterCard character={CHARACTER_WITH_RANK} />)

    const badge = screen.getByText('#15,140')
    expect(badge).toHaveAttribute('data-rank-badge')
  })

  it('sin rango de reclamo, no renderiza ninguna insignia', () => {
    renderWithTheme(<CharacterCard character={CHARACTER_WITHOUT_RANK} />)

    expect(screen.queryByText(/#/)).not.toBeInTheDocument()
  })
})
