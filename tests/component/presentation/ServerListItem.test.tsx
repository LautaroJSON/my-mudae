import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import ServerListItem from '../../../src/presentation/components/ServerListItem'
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

function renderItem(server: Server, profiles: Profile[]) {
  renderWithTheme(
    <ProfilesProvider
      repository={new InMemoryProfileRepository(profiles)}
      serverRepository={new InMemoryServerRepository([server])}
    >
      <ServerListItem server={server} profiles={profiles} />
    </ProfilesProvider>,
  )
}

describe('ServerListItem', () => {
  it('colapsado no muestra los perfiles del servidor', () => {
    const server: Server = { id: 's1', name: 'Server A', profileIds: ['a'] }
    renderItem(server, [buildProfile('a', 's1')])

    expect(screen.getByText('Server A')).toBeInTheDocument()
    expect(screen.queryByText('a')).not.toBeInTheDocument()
  })

  it('clickear el nombre despliega y muestra únicamente los perfiles de ese servidor, en el orden de profileIds', async () => {
    const user = userEvent.setup()
    const server: Server = { id: 's1', name: 'Server A', profileIds: ['b', 'a'] }
    renderItem(server, [buildProfile('b', 's1'), buildProfile('a', 's1')])

    await user.click(screen.getByRole('button', { name: 'Server A' }))

    const list = screen.getByLabelText('Lista de perfiles')
    const buttons = list.querySelectorAll('button')
    const names = Array.from(buttons)
      .map((button) => button.textContent)
      .filter((text) => text === 'a' || text === 'b')
    expect(names).toEqual(['b', 'a'])
  })
})
