import { describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import HaremView from '../../../src/presentation/components/HaremView'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 'series-x',
        name: 'Amagami',
        characters: ['Haruka', 'Ai', 'Rihoko'].map((name) => ({ id: name, name, imageUrl: `https://x/${name}.png` })),
      },
      { id: 'series-y', name: 'Black Clover', characters: [{ id: 'Noelle', name: 'Noelle', imageUrl: 'https://x/z.png' }] },
    ],
  }
}

const ActiveHarem = () => {
  const { activeProfile } = useProfiles()
  return activeProfile ? <HaremView harem={activeProfile.harem} /> : null
}

function renderHarem() {
  const profile: Profile = {
    id: 'profile-1',
    serverId: 'server-1',
    username: 'profile-1',
    alias: 'profile-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: buildHarem(),
  }
  const repository = new InMemoryProfileRepository([profile])
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSearchProvider>
          <ActiveHarem />
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
  return repository
}

const storedCount = (repository: InMemoryProfileRepository) => repository.getAll()[0].harem.series[0].visibleCount

describe('SeriesGroup - largo ajustable del bloque (013)', () => {
  it('no muestra la manija en un bloque de un solo personaje', () => {
    renderHarem()
    const single = screen.getByRole('region', { name: 'Black Clover' })
    expect(within(single).queryByRole('separator')).toBeNull()
  })

  it('con el teclado achica de a un personaje, con mínimo 1, y Fin lo restablece', () => {
    const repository = renderHarem()
    const handle = screen.getByRole('separator', { name: 'Ajustar largo de Amagami' })
    expect(handle.getAttribute('aria-valuenow')).toBe('3')

    fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    expect(storedCount(repository)).toBe(2)
    expect(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }).getAttribute('aria-valuenow')).toBe('2')

    fireEvent.keyDown(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }), { key: 'Home' })
    expect(storedCount(repository)).toBe(1)
    fireEvent.keyDown(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }), { key: 'ArrowLeft' })
    expect(storedCount(repository)).toBe(1)

    fireEvent.keyDown(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }), { key: 'End' })
    expect(storedCount(repository)).toBeUndefined()
  })

  it('doble clic vuelve al ancho completo', () => {
    const repository = renderHarem()
    fireEvent.keyDown(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }), { key: 'Home' })
    expect(storedCount(repository)).toBe(1)

    fireEvent.doubleClick(screen.getByRole('separator', { name: 'Ajustar largo de Amagami' }))
    expect(storedCount(repository)).toBeUndefined()
  })
})
