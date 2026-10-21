import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortCommandBar from '../../../src/presentation/components/SortCommandBar'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import { renderWithTheme } from '../../support/renderWithTheme'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { copyTextToClipboard } from '../../../src/presentation/copyToClipboard'
import { formatSortCommands } from '../../../src/domain/parsing/formatSortCommand'
import type { Harem } from '../../../src/domain/harem/Harem'
import type { Profile } from '../../../src/domain/profile/Profile'

vi.mock('../../../src/presentation/copyToClipboard', () => ({
  copyTextToClipboard: vi.fn(),
}))

const mockedCopy = vi.mocked(copyTextToClipboard)

beforeEach(() => {
  window.localStorage.clear()
  mockedCopy.mockResolvedValue(true)
})

afterEach(() => {
  vi.clearAllMocks()
})

// 300 nombres de ~20 caracteres: ~6300 caracteres, no entra en 2000.
function buildHarem(): Harem {
  return {
    profileId: 'profile-1',
    series: [
      {
        id: 's1',
        name: 'Serie',
        characters: Array.from({ length: 300 }, (_, i) => ({ id: `c${i}`, name: `Personaje número ${i}`, imageUrl: 'https://x' })),
      },
    ],
  }
}

function renderBar(harem: Harem) {
  const profile: Profile = {
    id: 'profile-1',
    serverId: 'server-1',
    username: 'profile-1',
    alias: 'profile-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem,
  }
  renderWithTheme(
    <ProfilesProvider repository={new InMemoryProfileRepository([profile])}>
      <SortCommandBar isOpen />
    </ProfilesProvider>,
  )
}

describe('SortCommandBar - comando partido en varios mensajes', () => {
  it('copia los mensajes en orden de envío, avanzando solo al siguiente', async () => {
    const harem = buildHarem()
    const expected = formatSortCommands(harem, 2000)
    expect(expected.length).toBeGreaterThan(1)
    renderBar(harem)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: `Copiar 1/${expected.length}` }))
    expect(mockedCopy).toHaveBeenLastCalledWith(expected[0])
    expect(screen.getByLabelText(`Comando de orden del harem, mensaje 2 de ${expected.length}`)).toHaveValue(expected[1])

    const parts = screen.getByRole('group', { name: 'Mensajes, en orden de envío' })
    expect(within(parts).getByRole('button', { name: 'Mensaje 1, copiado' })).toBeInTheDocument()
    expect(within(parts).getByRole('button', { name: 'Mensaje 2' })).toHaveAttribute('aria-current', 'step')
  })

  it('cada mensaje respeta el límite y el contador lo muestra', () => {
    renderBar(buildHarem())

    const field = screen.getByLabelText(/Comando de orden del harem, mensaje 1 de/) as HTMLInputElement
    expect(field.value.length).toBeLessThanOrEqual(2000)
    expect(screen.getByRole('button', { name: /^Límite 2000/ }).parentElement).toHaveTextContent(`${field.value.length} /2000`)
  })

  it('tocar el límite del contador alterna entre 2000 y 4000 (Nitro), reduce los mensajes y se recuerda', async () => {
    const harem = buildHarem()
    renderBar(harem)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /^Límite 2000 caracteres.*Cambiar a 4000$/ }))

    const count = formatSortCommands(harem, 4000).length
    expect(count).toBeLessThan(formatSortCommands(harem, 2000).length)
    expect(screen.getByRole('button', { name: `Copiar 1/${count}` })).toBeInTheDocument()
    expect(window.localStorage.getItem('mymudae:commandLimit')).toBe('4000')

    await user.click(screen.getByRole('button', { name: /^Límite 4000 caracteres.*Cambiar a 2000$/ }))
    expect(window.localStorage.getItem('mymudae:commandLimit')).toBe('2000')
  })

  it('un harem que entra en un mensaje no muestra la numeración', () => {
    renderBar({
      profileId: 'profile-1',
      series: [{ id: 's1', name: 'Serie', characters: [{ id: 'c1', name: 'Esdeath', imageUrl: 'https://x' }] }],
    })

    expect(screen.getByRole('button', { name: 'Copiar Comando' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Mensajes, en orden de envío' })).toBeNull()
  })
})
