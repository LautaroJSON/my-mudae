import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ProfileList from '../../../src/presentation/components/ProfileList'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

// Nota: el cálculo del nuevo orden a partir de un evento de @dnd-kit se
// testea de forma aislada en tests/unit/presentation/computeReorderedIds.test.ts.
// Un gesto de arrastre real (mouse/touch/teclado) no se puede simular de
// forma confiable acá porque @dnd-kit necesita medidas de layout reales
// (getBoundingClientRect) para saber sobre qué ítem se soltó, y jsdom no
// tiene motor de layout — devuelve todo en (0,0,0,0), así que ningún
// gesto simulado produce un `over` distinto del `active`. Ese nivel de
// interacción se valida manualmente (Escenario 7 de quickstart.md de 008).
function buildProfile(id: string, serverId = 'server-1'): Profile {
  return {
    id,
    serverId,
    username: id,
    alias: id,
    isActive: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: id, series: [] },
  }
}

function renderList(profiles: Profile[], serverId = 'server-1') {
  const profileRepository = new InMemoryProfileRepository(profiles)
  const serverRepository = new InMemoryServerRepository([
    { id: serverId, name: serverId, profileIds: profiles.map((p) => p.id) },
  ])
  renderWithTheme(
    <ProfilesProvider repository={profileRepository} serverRepository={serverRepository}>
      <ProfileList profiles={profiles} serverId={serverId} />
    </ProfilesProvider>,
  )
  return { profileRepository, serverRepository }
}

describe('ProfileList - drag-and-drop', () => {
  it('cada fila tiene una manija de arrastre enfocable y accesible por teclado (Principio V)', () => {
    renderList([buildProfile('a'), buildProfile('b')])

    const handleA = screen.getByRole('button', { name: /reordenar a/i })
    const handleB = screen.getByRole('button', { name: /reordenar b/i })

    expect(handleA).toBeInTheDocument()
    expect(handleB).toBeInTheDocument()
    expect(handleA.tabIndex).toBe(0)
    expect(handleB.tabIndex).toBe(0)
  })

  it('el orden de las filas en pantalla refleja el orden de `profiles` recibido por props', () => {
    renderList([buildProfile('c'), buildProfile('a'), buildProfile('b')])

    const list = screen.getByLabelText('Lista de perfiles')
    const activateButtons = within(list).getAllByRole('button', { name: /^[abc]$/ })
    expect(activateButtons.map((button) => button.textContent)).toEqual(['c', 'a', 'b'])
  })
})
