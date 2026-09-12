import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HaremSortButton from '../../../src/presentation/components/HaremSortButton'
import HeaderActions from '../../../src/presentation/components/HeaderActions'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-1',
        name: 'Amagami',
        characters: [
          { id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://x/1.png', kakera: 5 },
          { id: 'char-2', name: 'Ai Nanasaki', imageUrl: 'https://x/2.png', kakera: 20 },
        ],
      },
    ],
  }
}

function buildProfile(harem: Harem): Profile {
  return {
    id: harem.profileId,
    serverId: 'server-1',
    username: harem.profileId,
    alias: harem.profileId,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
}

describe('HeaderActions - visibilidad de HaremSortButton', () => {
  it('sin perfil activo, no se renderiza el botón de ordenar', () => {
    renderWithTheme(
      <ProfilesProvider repository={new InMemoryProfileRepository()}>
        <HaremSortProvider>
          <HeaderActions />
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    expect(screen.queryByRole('button', { name: /ordenar harem/i })).not.toBeInTheDocument()
  })

  it('con perfil activo, el botón de ordenar está visible', () => {
    const harem = buildHarem()
    renderWithTheme(
      <ProfilesProvider repository={new InMemoryProfileRepository([buildProfile(harem)])}>
        <HaremSortProvider>
          <HeaderActions />
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    expect(screen.getByRole('button', { name: /ordenar harem/i })).toBeInTheDocument()
  })
})

function renderHaremSortButton(harem: Harem) {
  const repository = new InMemoryProfileRepository([buildProfile(harem)])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSortButton />
        <HaremView harem={harem} />
      </HaremSortProvider>
    </ProfilesProvider>,
  )
}

describe('HaremSortButton + HaremSortPanel + KakeraSortOption (interruptor)', () => {
  it('nace cerrado, sin panel visible', () => {
    renderHaremSortButton(buildHarem())

    expect(screen.queryByText('Ordenamiento')).not.toBeInTheDocument()
  })

  it('al tocar el botón, aparece el panel con la opción "Ordenamiento"', async () => {
    const user = userEvent.setup()
    renderHaremSortButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))

    expect(screen.getByRole('button', { name: /ordenamiento/i })).toBeInTheDocument()
  })

  it('al tocar "Ordenamiento", se despliega "Valor de Kakera"; al tocarlo de nuevo, se colapsa', async () => {
    const user = userEvent.setup()
    renderHaremSortButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.click(screen.getByRole('button', { name: /ordenamiento/i }))

    expect(screen.getByRole('button', { name: /valor de kakera/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ordenamiento/i }))

    expect(screen.queryByRole('button', { name: /valor de kakera/i })).not.toBeInTheDocument()
  })

  it('tocar "Valor de Kakera" lo activa (aria-pressed) y reordena el harem debajo, descendente', async () => {
    const user = userEvent.setup()
    renderHaremSortButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.click(screen.getByRole('button', { name: /ordenamiento/i }))
    const toggle = screen.getByRole('button', { name: /valor de kakera/i })

    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(within(amagami).getByText('Ai Nanasaki').compareDocumentPosition(within(amagami).getByText('Haruka Morishima'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('tocar "Valor de Kakera" de nuevo lo desactiva y restaura el orden manual', async () => {
    const user = userEvent.setup()
    renderHaremSortButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.click(screen.getByRole('button', { name: /ordenamiento/i }))
    const toggle = screen.getByRole('button', { name: /valor de kakera/i })

    await user.click(toggle)
    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(within(amagami).getByText('Haruka Morishima').compareDocumentPosition(within(amagami).getByText('Ai Nanasaki'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('cerrar con Escape oculta el panel', async () => {
    const user = userEvent.setup()
    renderHaremSortButton(buildHarem())

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.keyboard('{Escape}')

    expect(screen.queryByText('Ordenamiento')).not.toBeInTheDocument()
  })

  it('click afuera del panel lo cierra', async () => {
    const user = userEvent.setup()
    const harem = buildHarem()
    const repository = new InMemoryProfileRepository([buildProfile(harem)])
    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <HaremSortProvider>
          <div>
            <p>Contenido afuera</p>
            <HaremSortButton />
          </div>
        </HaremSortProvider>
      </ProfilesProvider>,
    )

    await user.click(screen.getByRole('button', { name: /ordenar harem/i }))
    await user.click(screen.getByText('Contenido afuera'))

    expect(screen.queryByText('Ordenamiento')).not.toBeInTheDocument()
  })
})
