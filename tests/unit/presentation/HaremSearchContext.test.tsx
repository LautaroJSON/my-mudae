import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import HaremSearchProvider, { useHaremSearch } from '../../../src/presentation/context/HaremSearchContext'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-a',
    serverId: 'server-1',
    username: 'usuario-a',
    alias: 'usuario-a',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: { profileId: 'profile-a', series: [] },
    ...overrides,
  }
}

function wrapperWith(repository: InMemoryProfileRepository) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ProfilesProvider repository={repository}>
        <HaremSearchProvider>{children}</HaremSearchProvider>
      </ProfilesProvider>
    )
  }
}

function renderHaremSearch(repository = new InMemoryProfileRepository()) {
  return renderHook(() => useHaremSearch(), { wrapper: wrapperWith(repository) })
}

describe('HaremSearchContext', () => {
  it('arranca cerrado, con query vacío', () => {
    const { result } = renderHaremSearch()

    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
  })

  it('toggleOpen() lo abre cuando estaba cerrado, sin tocar query', () => {
    const { result } = renderHaremSearch()

    act(() => {
      result.current.toggleOpen()
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.query).toBe('')
  })

  it('setQuery() actualiza query mientras está abierto', () => {
    const { result } = renderHaremSearch()

    act(() => {
      result.current.toggleOpen()
    })
    act(() => {
      result.current.setQuery('konosuba')
    })

    expect(result.current.query).toBe('konosuba')
  })

  it('setQuery() no hace nada mientras está cerrado', () => {
    const { result } = renderHaremSearch()

    act(() => {
      result.current.setQuery('konosuba')
    })

    expect(result.current.query).toBe('')
  })

  it('toggleOpen() lo cierra y limpia query en la misma actualización (FR-009)', () => {
    const { result } = renderHaremSearch()

    act(() => {
      result.current.toggleOpen()
    })
    act(() => {
      result.current.setQuery('konosuba')
    })
    act(() => {
      result.current.toggleOpen()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
  })

  it('resetea a cerrado/query vacío al cambiar de perfil activo (FR-010)', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile({ id: 'profile-a', isActive: true }),
      buildProfile({ id: 'profile-b', isActive: false, username: 'usuario-b', alias: 'usuario-b' }),
    ])

    function useTestState() {
      return { search: useHaremSearch(), profiles: useProfiles() }
    }

    const { result } = renderHook(() => useTestState(), { wrapper: wrapperWith(repository) })

    act(() => {
      result.current.search.toggleOpen()
    })
    act(() => {
      result.current.search.setQuery('konosuba')
    })
    expect(result.current.search.isOpen).toBe(true)
    expect(result.current.search.query).toBe('konosuba')

    act(() => {
      result.current.profiles.activateProfile('profile-b')
    })

    expect(result.current.search.isOpen).toBe(false)
    expect(result.current.search.query).toBe('')
  })
})
