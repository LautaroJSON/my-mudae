import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import HaremSortProvider, { useHaremSort } from '../../../src/presentation/context/HaremSortContext'
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
        <HaremSortProvider>{children}</HaremSortProvider>
      </ProfilesProvider>
    )
  }
}

function renderHaremSort(repository = new InMemoryProfileRepository()) {
  return renderHook(() => useHaremSort(), { wrapper: wrapperWith(repository) })
}

describe('HaremSortContext', () => {
  it('arranca inactivo, en dirección descendente', () => {
    const { result } = renderHaremSort()

    expect(result.current.isActive).toBe(false)
    expect(result.current.direction).toBe('desc')
  })

  it('toggleActive() lo activa en descendente cuando estaba apagado (FR-006)', () => {
    const { result } = renderHaremSort()

    act(() => {
      result.current.toggleActive()
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.direction).toBe('desc')
  })

  it('toggleActive() lo apaga cuando estaba encendido', () => {
    const { result } = renderHaremSort()

    act(() => {
      result.current.toggleActive()
    })
    act(() => {
      result.current.toggleActive()
    })

    expect(result.current.isActive).toBe(false)
  })

  it('toggleDirection() no hace nada mientras está inactivo (FR-009)', () => {
    const { result } = renderHaremSort()

    act(() => {
      result.current.toggleDirection()
    })

    expect(result.current.direction).toBe('desc')
    expect(result.current.isActive).toBe(false)
  })

  it('toggleDirection() alterna desc/asc mientras está activo', () => {
    const { result } = renderHaremSort()

    act(() => {
      result.current.toggleActive()
    })
    act(() => {
      result.current.toggleDirection()
    })
    expect(result.current.direction).toBe('asc')

    act(() => {
      result.current.toggleDirection()
    })
    expect(result.current.direction).toBe('desc')
  })

  it('resetea a inactivo/descendente al cambiar de perfil activo (FR-011)', () => {
    const repository = new InMemoryProfileRepository([
      buildProfile({ id: 'profile-a', isActive: true }),
      buildProfile({ id: 'profile-b', isActive: false, username: 'usuario-b', alias: 'usuario-b' }),
    ])

    function useTestState() {
      return { sort: useHaremSort(), profiles: useProfiles() }
    }

    const { result } = renderHook(() => useTestState(), { wrapper: wrapperWith(repository) })

    act(() => {
      result.current.sort.toggleActive()
    })
    act(() => {
      result.current.sort.toggleDirection()
    })
    expect(result.current.sort.isActive).toBe(true)
    expect(result.current.sort.direction).toBe('asc')

    act(() => {
      result.current.profiles.activateProfile('profile-b')
    })

    expect(result.current.sort.isActive).toBe(false)
    expect(result.current.sort.direction).toBe('desc')
  })
})
