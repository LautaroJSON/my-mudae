import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KakeraSortOption from '../../../src/presentation/components/KakeraSortOption'
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

function renderWithHaremView(harem: Harem) {
  const profile: Profile = {
    id: harem.profileId,
    serverId: 'server-1',
    username: harem.profileId,
    alias: harem.profileId,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
  const repository = new InMemoryProfileRepository([profile])
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <KakeraSortOption />
        <HaremView harem={harem} />
      </HaremSortProvider>
    </ProfilesProvider>,
  )
}

describe('KakeraSortOption - control de dirección (US2)', () => {
  it('con el interruptor apagado, la flecha de dirección no dispara ningún cambio', async () => {
    const user = userEvent.setup()
    renderWithHaremView(buildHarem())

    const arrow = screen.queryByRole('button', { name: /orden (ascendente|descendente)/i })
    if (arrow) {
      await user.click(arrow)
    }

    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(
      within(amagami).getByText('Haruka Morishima').compareDocumentPosition(within(amagami).getByText('Ai Nanasaki')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('con el interruptor activo, la flecha alterna entre descendente y ascendente', async () => {
    const user = userEvent.setup()
    renderWithHaremView(buildHarem())

    await user.click(screen.getByRole('button', { name: /valor de kakera/i }))

    const amagami = screen.getByRole('region', { name: 'Amagami' })
    expect(
      within(amagami).getByText('Ai Nanasaki').compareDocumentPosition(within(amagami).getByText('Haruka Morishima')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    const arrow = screen.getByRole('button', { name: /orden descendente/i })
    await user.click(arrow)

    expect(
      within(amagami).getByText('Haruka Morishima').compareDocumentPosition(within(amagami).getByText('Ai Nanasaki')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByRole('button', { name: /orden ascendente/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /orden ascendente/i }))

    expect(
      within(amagami).getByText('Ai Nanasaki').compareDocumentPosition(within(amagami).getByText('Haruka Morishima')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})
