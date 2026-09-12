import { describe, expect, it } from 'vitest'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      { id: 'series-1', name: 'Amagami', characters: [{ id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' }] },
      {
        id: 'series-2',
        name: 'Black Clover',
        characters: [
          { id: 'char-2', name: 'Noelle Silva', imageUrl: 'https://x/2.png' },
          { id: 'char-3', name: 'Asta', imageUrl: 'https://x/3.png' },
          { id: 'char-4', name: 'Yuno', imageUrl: 'https://x/4.png' },
        ],
      },
    ],
  }
}

function renderHaremView(harem: Harem) {
  const profile: Profile = { id: harem.profileId, serverId: 'server-1', username: harem.profileId, alias: harem.profileId, isActive: true, createdAt: '2026-01-01T00:00:00.000Z', harem }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremView harem={harem} />
    </ProfilesProvider>,
  )
}

describe('HaremView - layout en cuadrícula tipo flex-wrap (FR-002)', () => {
  it('el contenedor acomoda los grupos de serie en fila, envolviendo cuando no entran, sin estirarlos verticalmente entre sí', () => {
    const { container } = renderHaremView(buildHarem())

    const wrapper = container.firstElementChild as HTMLElement
    const styles = getComputedStyle(wrapper)

    expect(styles.display).toBe('flex')
    expect(styles.flexWrap).toBe('wrap')
    expect(styles.alignItems).toBe('flex-start')
  })

  it('cada grupo de serie se ajusta a su propio contenido (width: fit-content), sin un ancho fijo/uniforme entre series', () => {
    // jsdom no mide layout real (no puede confirmar visualmente que una
    // serie de 3 personajes queda más ancha que una de 1) — se verifica
    // en cambio que la regla CSS de `Section` usa `width: fit-content`
    // (no un valor fijo en rem/px) + `max-width: 100%` como tope
    // defensivo para mobile, que es lo que permite que cada serie mida
    // lo que su propio contenido necesita en vez de una columna pareja
    // para todas.
    renderHaremView(buildHarem())

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')
    const sectionRuleMatch = styleText.match(/\.\S+\{display:flex;flex-direction:column;gap:0\.5rem;[^}]*\}/)

    expect(sectionRuleMatch).not.toBeNull()
    expect(sectionRuleMatch?.[0]).toContain('width:fit-content')
    expect(sectionRuleMatch?.[0]).toContain('max-width:100%')
  })
})
