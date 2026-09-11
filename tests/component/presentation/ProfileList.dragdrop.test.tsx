import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ProfileList from '../../../src/presentation/components/ProfileList'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota: el cálculo del nuevo orden a partir de un evento de @dnd-kit se
// testea de forma aislada en tests/unit/presentation/computeReorderedIds.test.ts.
// Un gesto de arrastre real (mouse/touch/teclado) no se puede simular de
// forma confiable acá porque @dnd-kit necesita medidas de layout reales
// (getBoundingClientRect) para saber sobre qué ítem se soltó, y jsdom no
// tiene motor de layout — devuelve todo en (0,0,0,0), así que ningún
// gesto simulado produce un `over` distinto del `active`. Ese nivel de
// interacción se valida manualmente (Escenario 2 de quickstart.md).
function buildProfile(id: string, order: number): Profile {
  return {
    id,
    alias: id,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    order,
    harem: { profileId: id, series: [] },
  }
}

describe('ProfileList - drag-and-drop', () => {
  it('cada fila tiene una manija de arrastre enfocable y accesible por teclado (Principio V)', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', 0), buildProfile('b', 1)])
    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <ProfileList />
      </ProfilesProvider>,
    )

    const handleA = screen.getByRole('button', { name: /reordenar a/i })
    const handleB = screen.getByRole('button', { name: /reordenar b/i })

    expect(handleA).toBeInTheDocument()
    expect(handleB).toBeInTheDocument()
    expect(handleA.tabIndex).toBe(0)
    expect(handleB.tabIndex).toBe(0)
  })

  it('el orden de las filas en pantalla refleja el `order` de cada perfil', () => {
    const repository = new InMemoryProfileRepository([buildProfile('c', 2), buildProfile('a', 0), buildProfile('b', 1)])
    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <ProfileList />
      </ProfilesProvider>,
    )

    const list = screen.getByLabelText('Lista de perfiles')
    const activateButtons = within(list).getAllByRole('button', { name: /^[abc]$/ })
    expect(activateButtons.map((button) => button.textContent)).toEqual(['a', 'b', 'c'])
  })
})
