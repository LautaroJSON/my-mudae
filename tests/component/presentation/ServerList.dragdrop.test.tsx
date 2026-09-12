import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ServerList from '../../../src/presentation/components/ServerList'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'
import type { Server } from '../../../src/domain/server/Server'

// Mismo criterio que ProfileList.dragdrop.test.tsx: un gesto de arrastre
// real no se puede simular de forma confiable en jsdom (sin motor de
// layout); acá se valida lo observable sin arrastrar: manijas accesibles
// por teclado y el orden en pantalla reflejando `servers`.
function buildProfile(id: string, serverId: string): Profile {
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

function renderList(servers: Server[], profiles: Profile[]) {
  renderWithTheme(
    <ProfilesProvider
      repository={new InMemoryProfileRepository(profiles)}
      serverRepository={new InMemoryServerRepository(servers)}
    >
      <ServerList />
    </ProfilesProvider>,
  )
}

describe('ServerList - drag-and-drop', () => {
  it('cada servidor tiene una manija de arrastre enfocable y accesible por teclado (Principio V)', () => {
    renderList(
      [
        { id: 's1', name: 'Server A', profileIds: ['a'] },
        { id: 's2', name: 'Server B', profileIds: ['b'] },
      ],
      [buildProfile('a', 's1'), buildProfile('b', 's2')],
    )

    const handleA = screen.getByRole('button', { name: /reordenar server a/i })
    const handleB = screen.getByRole('button', { name: /reordenar server b/i })

    expect(handleA).toBeInTheDocument()
    expect(handleB).toBeInTheDocument()
    expect(handleA.tabIndex).toBe(0)
    expect(handleB.tabIndex).toBe(0)
  })

  it('el orden de los servidores en pantalla refleja el orden de `servers`', () => {
    renderList(
      [
        { id: 's1', name: 'Server C', profileIds: ['c'] },
        { id: 's2', name: 'Server A', profileIds: ['a'] },
        { id: 's3', name: 'Server B', profileIds: ['b'] },
      ],
      [buildProfile('c', 's1'), buildProfile('a', 's2'), buildProfile('b', 's3')],
    )

    const list = screen.getByLabelText('Lista de servidores')
    const names = Array.from(list.querySelectorAll('button'))
      .map((button) => button.textContent)
      .filter((text): text is string => !!text && text.includes('Server'))
    expect(names).toEqual(['Server C', 'Server A', 'Server B'])
  })
})
