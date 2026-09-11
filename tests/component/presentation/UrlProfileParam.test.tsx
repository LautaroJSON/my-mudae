import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import App from '../../../src/presentation/App'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(id: string, isActive: boolean, order: number): Profile {
  return {
    id,
    alias: id,
    isActive,
    createdAt: '2026-01-01T00:00:00.000Z',
    order,
    harem: { profileId: id, series: [] },
  }
}

// Componente sonda: expone el estado del contexto como texto plano para
// poder verificarlo sin acoplar el test a ningún componente de UI.
const Probe = () => {
  const { activeProfile, urlProfileStatus } = useProfiles()
  return (
    <div>
      <span data-testid="status">{urlProfileStatus}</span>
      <span data-testid="active">{activeProfile?.id ?? 'ninguno'}</span>
    </div>
  )
}

function setUrlSearch(search: string) {
  window.history.pushState({}, '', `/${search}`)
}

describe('Resolución del parámetro `id` de la URL al cargar (User Story 5 de 002)', () => {
  beforeEach(() => {
    setUrlSearch('')
  })

  afterEach(() => {
    setUrlSearch('')
  })

  it('sin `id` en la URL, usa el perfil activo persistido tal cual (urlProfileStatus: "none")', () => {
    const repository = new InMemoryProfileRepository([buildProfile('a', true, 0), buildProfile('b', false, 1)])
    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <Probe />
      </ProfilesProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('none')
    expect(screen.getByTestId('active')).toHaveTextContent('a')
  })

  it('con un `id` que coincide con un perfil, lo activa (sobrescribe el que estaba activo) y persiste el cambio', () => {
    setUrlSearch('?id=b')
    const repository = new InMemoryProfileRepository([buildProfile('a', true, 0), buildProfile('b', false, 1)])

    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <Probe />
      </ProfilesProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('activated')
    expect(screen.getByTestId('active')).toHaveTextContent('b')

    const persisted = repository.getAll()
    expect(persisted.find((p) => p.id === 'a')?.isActive).toBe(false)
    expect(persisted.find((p) => p.id === 'b')?.isActive).toBe(true)
  })

  it('con un `id` que no corresponde a ningún perfil, NO toca el activo persistido y expone "not-found"', () => {
    setUrlSearch('?id=fantasma')
    const repository = new InMemoryProfileRepository([buildProfile('a', true, 0)])

    renderWithTheme(
      <ProfilesProvider repository={repository}>
        <Probe />
      </ProfilesProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('not-found')
    // El activo persistido no se tocó (sigue siendo 'a'), aunque
    // presentation/ decida no mostrarlo por el estado "not-found".
    expect(screen.getByTestId('active')).toHaveTextContent('a')
    expect(repository.getAll().find((p) => p.id === 'a')?.isActive).toBe(true)
  })
})

describe('App - estado de "perfil no encontrado"', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setUrlSearch('')
  })

  afterEach(() => {
    setUrlSearch('')
  })

  it('con un `id` inexistente en la URL, la página principal muestra un aviso en vez del harem heredado', () => {
    setUrlSearch('?id=fantasma')
    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent(/no existe/i)
  })
})
