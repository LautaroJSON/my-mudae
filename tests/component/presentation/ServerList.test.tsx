import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ServerList from '../../../src/presentation/components/ServerList'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'
import type { Server } from '../../../src/domain/server/Server'

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

describe('ServerList', () => {
  it('sin ningún servidor con perfiles, muestra el mensaje vacío', () => {
    renderList([{ id: 's1', name: 'Server A', profileIds: [] }], [])

    expect(screen.getByText('Todavía no tenés ningún perfil.')).toBeInTheDocument()
  })

  it('solo renderiza los servidores con al menos un perfil', () => {
    renderList(
      [
        { id: 's1', name: 'Server A', profileIds: [] },
        { id: 's2', name: 'Server B', profileIds: ['a'] },
      ],
      [buildProfile('a', 's2')],
    )

    expect(screen.queryByText('Server A')).not.toBeInTheDocument()
    expect(screen.getByText('Server B')).toBeInTheDocument()
  })
})
