import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import CharacterName from '../../../src/presentation/components/CharacterName'
import { renderWithTheme } from '../../support/renderWithTheme'

function mockElementWidths(scrollWidth: number, clientWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    value: scrollWidth,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: clientWidth,
  })
}

describe('CharacterName', () => {
  it('renderiza el nombre completo como texto plano, en un único nodo sin saltos de línea', () => {
    renderWithTheme(<CharacterName name="Haruka Morishima" />)

    expect(screen.getByText('Haruka Morishima')).toBeInTheDocument()
  })

  it('cuando el nombre no desborda (scrollWidth === clientWidth), no se marca como desbordado', () => {
    mockElementWidths(100, 100)
    const { container } = renderWithTheme(<CharacterName name="Asta" />)

    const text = container.querySelector('span')
    expect(text).toHaveAttribute('data-overflowing', 'false')
  })

  it('cuando el nombre desborda su contenedor, se marca como desbordado y expone la distancia a recorrer', () => {
    mockElementWidths(180, 100)
    const { container } = renderWithTheme(<CharacterName name="Un Nombre Bastante Largo De Personaje" />)

    const text = container.querySelector('span')
    expect(text).toHaveAttribute('data-overflowing', 'true')
    expect(text?.style.getPropertyValue('--mm-marquee-distance')).toBe('80px')
  })
})
