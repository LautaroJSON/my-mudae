import { describe, expect, it } from 'vitest'
import SeriesGroup from '../../../src/presentation/components/SeriesGroup'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Series } from '../../../src/domain/harem/Series'
import type { Profile } from '../../../src/domain/profile/Profile'

const LONG_NAME = 'A Very Long Series Name That Should Truncate Instead Of Widening The Panel'

function buildSeries(name = 'Amagami'): Series {
  return {
    id: 'series-1',
    name,
    characters: [{ id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png' }],
  }
}

function renderSeriesGroup(series: Series) {
  const profile: Profile = {
    id: 'profile-1',
    serverId: 'server-1',
    username: 'profile-1',
    alias: 'profile-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: 'profile-1', series: [series] },
  }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <SeriesGroup series={series} />
    </ProfilesProvider>,
  )
}

describe('SeriesGroup - apariencia del panel de serie', () => {
  it('el panel de la serie tiene fondo y borde', () => {
    renderSeriesGroup(buildSeries())

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styleText).toContain('background:var(--mm-color-surface-muted)')
    expect(styleText).toContain('border:1px solid var(--mm-color-border)')
  })

  it('el nombre de la serie se trunca (ellipsis) en vez de ensanchar el panel', () => {
    renderSeriesGroup(buildSeries())

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styleText).toContain('overflow:hidden;white-space:nowrap;text-overflow:ellipsis;')
  })

  it('el nombre completo de la serie está disponible como tooltip nativo (hover)', () => {
    const { getByTitle } = renderSeriesGroup(buildSeries(LONG_NAME))

    const heading = getByTitle(LONG_NAME)
    expect(heading.tagName).toBe('H2')
    expect(heading.textContent).toBe(LONG_NAME)
  })

  it('el encabezado no aporta ancho al panel (contain: inline-size), así un nombre largo nunca lo ensancha', () => {
    // El ancho del panel lo definen solo sus tarjetas. Reemplaza a la
    // medición por JS (ResizeObserver + max-width inline) que dejaba el
    // título ensanchar la serie si la medición daba 0, y con 2+
    // personajes medía el ancho ya inflado por el título. jsdom no tiene
    // layout: el ancho real se valida en un navegador.
    renderSeriesGroup(buildSeries(LONG_NAME))

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styleText).toContain('contain:inline-size')
  })
})
