import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import DivorceSelectionProvider from '../../../src/presentation/context/DivorceSelectionContext'
import HaremSortProvider from '../../../src/presentation/context/HaremSortContext'
import HaremSearchProvider from '../../../src/presentation/context/HaremSearchContext'
import HaremView from '../../../src/presentation/components/HaremView'
import DivorceBar from '../../../src/presentation/components/DivorceBar'
import SortCommandToggle from '../../../src/presentation/components/SortCommandToggle'
import { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(): Profile {
  return {
    id: 'rodoifin',
    serverId: 'server-1',
    username: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-1',
          name: 'Re:Zero',
          characters: [
            { id: 'rem', name: 'Rem', imageUrl: 'https://x/1.png', kakera: 812 },
            { id: 'ram', name: 'Ram', imageUrl: 'https://x/2.png', kakera: 654 },
            { id: 'felt', name: 'Felt', imageUrl: 'https://x/3.png' },
          ],
        },
      ],
    },
  }
}

const ActiveHarem = () => {
  const { activeProfile } = useProfiles()
  return activeProfile ? <HaremView harem={activeProfile.harem} /> : null
}

function renderApp(repository = new InMemoryProfileRepository([buildProfile()])) {
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <HaremSortProvider>
        <HaremSearchProvider>
          <DivorceSelectionProvider>
            <SortCommandToggle />
            <DivorceBar />
            <ActiveHarem />
          </DivorceSelectionProvider>
        </HaremSearchProvider>
      </HaremSortProvider>
    </ProfilesProvider>,
  )
  return repository
}

const commandField = () => screen.getByRole('textbox', { name: 'Comando de divorcio', hidden: true }) as HTMLInputElement
const region = () => document.querySelector<HTMLElement>('[aria-label="Divorciar personajes"]')!

describe('Divorciar personajes (014)', () => {
  it('la card nace oculta y aparece al marcar con el tacho, sumando comando y kakera', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(region()).toHaveAttribute('aria-hidden', 'true')

    await user.click(screen.getByRole('button', { name: 'Divorciar a Rem' }))
    await user.click(screen.getByRole('button', { name: 'Divorciar a Felt' }))

    expect(region()).toHaveAttribute('aria-hidden', 'false')
    expect(commandField().value).toBe('$divorce Rem$Felt')
    expect(within(region()).getByText('Divorciar 2 personajes')).toBeInTheDocument()
    expect(within(region()).getByLabelText('Recibirías aproximadamente 812 de kakera')).toBeInTheDocument()
  })

  it('tocar de nuevo la tarjeta marcada la desmarca', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Divorciar a Rem' }))
    await user.click(screen.getByRole('button', { name: 'Divorciar a Ram' }))

    await user.click(screen.getByRole('img', { name: 'Rem' }))
    expect(commandField().value).toBe('$divorce Ram')
  })

  it('la ✕ de un chip y "Vaciar" sacan personajes de la selección', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Divorciar a Rem' }))
    await user.click(screen.getByRole('button', { name: 'Divorciar a Ram' }))

    await user.click(within(region()).getByRole('button', { name: 'No divorciar a Rem' }))
    expect(commandField().value).toBe('$divorce Ram')

    await user.click(within(region()).getByRole('button', { name: 'Vaciar' }))
    expect(region()).toHaveAttribute('aria-hidden', 'true')
  })

  it('"Quitar del harem" pide confirmación y después elimina a los marcados', async () => {
    const user = userEvent.setup()
    const repository = renderApp()
    await user.click(screen.getByRole('button', { name: 'Divorciar a Rem' }))

    await user.click(within(region()).getByRole('button', { name: /quitar del harem/i }))
    expect(repository.getAll()[0].harem.series[0].characters).toHaveLength(3)

    await user.click(within(region()).getByRole('button', { name: /¿seguro\? quitar 1/i }))
    expect(repository.getAll()[0].harem.series[0].characters.map((c) => c.name)).toEqual(['Ram', 'Felt'])
    expect(screen.queryByRole('button', { name: 'Divorciar a Rem' })).toBeNull()
    expect(region()).toHaveAttribute('aria-hidden', 'true')
  })

  it('abrir la barra del $sm oculta la de divorcio, y marcar otro personaje la cierra', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Divorciar a Rem' }))

    await user.click(screen.getByRole('button', { name: 'Mostrar comando de orden' }))
    expect(region()).toHaveAttribute('aria-hidden', 'true')

    await user.click(screen.getByRole('button', { name: 'Divorciar a Ram' }))
    expect(screen.getByRole('button', { name: 'Mostrar comando de orden' })).toHaveAttribute('aria-expanded', 'false')
    expect(region()).toHaveAttribute('aria-hidden', 'false')
  })
})
