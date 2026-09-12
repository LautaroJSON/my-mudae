import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import CharacterCard from '../../../src/presentation/components/CharacterCard'
import { renderWithTheme } from '../../support/renderWithTheme'
import { parseHaremMessage } from '../../../src/domain/parsing/parseHaremMessage'

// Edge case reportado: un personaje con imagen "custom" de Imgur (link
// directo a la página imgur.com, no al CDN i.imgur.com) rompía el
// parseo o quedaba con una imagen que no carga en <img>. Este test
// cubre la cadena completa: pegar un harem con ese link → CharacterCard
// termina renderizando un <img> con un src cargable.
describe('CharacterCard - imagen personalizada de Imgur (edge case)', () => {
  it('un personaje con imagen imgur.com pegada en el harem se renderiza con el src normalizado a i.imgur.com', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 5 ka - https://imgur.com/z3hIPIX.png`

    const result = parseHaremMessage(message)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const parsedCharacter = result.series[0].characters[0]
    renderWithTheme(<CharacterCard character={{ id: 'char-1', ...parsedCharacter }} />)

    const image = screen.getByRole('img', { name: 'Noelle Silva' })
    expect(image).toHaveAttribute('src', 'https://i.imgur.com/z3hIPIX.png')
  })

  it('un personaje con imagen envuelta en "<...>" (embed suprimido por Discord) también se renderiza con un src cargable', () => {
    const message = `alguien's harem

Amagami - 1/11
#182 - Noelle Silva 5 ka - <https://imgur.com/z3hIPIX.png>`

    const result = parseHaremMessage(message)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.series[0].characters).toHaveLength(1)

    const parsedCharacter = result.series[0].characters[0]
    renderWithTheme(<CharacterCard character={{ id: 'char-1', ...parsedCharacter }} />)

    const image = screen.getByRole('img', { name: 'Noelle Silva' })
    expect(image).toHaveAttribute('src', 'https://i.imgur.com/z3hIPIX.png')
  })
})
