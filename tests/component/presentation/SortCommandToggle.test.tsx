import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortCommandToggle from '../../../src/presentation/components/SortCommandToggle'
import ProfilesProvider, { useProfiles } from '../../../src/presentation/context/ProfilesContext'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
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
          name: 'Amagami',
          characters: [
            { id: 'char-1', name: 'Esdeath', imageUrl: 'https://x/1.png' },
            { id: 'char-2', name: 'Falin Touden', imageUrl: 'https://x/2.png' },
          ],
        },
      ],
    },
    ...overrides,
  }
}

// Componente de soporte para simular, desde afuera, un reordenamiento
// mientras la barra está abierta (mismo mecanismo real que usa
// SeriesGroup/HaremView vía useProfiles(), sin depender de un gesto de
// drag & drop real, que no se puede simular de forma confiable en jsdom
// -ver SeriesGroup.dragdrop.test.tsx-).
function ReorderCharactersButton({ seriesId, orderedCharacterIds }: { seriesId: string; orderedCharacterIds: string[] }) {
  const { reorderCharactersInSeries } = useProfiles()
  return (
    <button type="button" onClick={() => reorderCharactersInSeries(seriesId, orderedCharacterIds)}>
      reordenar
    </button>
  )
}

function renderToggle(repository = new InMemoryProfileRepository(), withReorderButton = false) {
  return renderWithTheme(
    <ProfilesProvider repository={repository}>
      <SortCommandToggle />
      {withReorderButton && <ReorderCharactersButton seriesId="series-1" orderedCharacterIds={['char-2', 'char-1']} />}
    </ProfilesProvider>,
  )
}

describe('SortCommandToggle + SortCommandBar', () => {
  it('nace oculta (aria-expanded="false")', () => {
    renderToggle()

    expect(screen.getByRole('button', { name: /mostrar comando de orden/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('al tocar el ícono, muestra el comando en el orden serie-por-serie y personaje-por-personaje', async () => {
    const user = userEvent.setup()
    renderToggle(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))

    expect(screen.getByDisplayValue('$sm Esdeath $ Falin Touden')).toBeInTheDocument()
  })

  it('sin perfil activo, muestra un estado vacío y no un comando "$sm" sin nombres', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))

    expect(screen.queryByDisplayValue(/^\$sm/)).not.toBeInTheDocument()
    expect(screen.getByText(/no hay personajes para ordenar/i)).toBeInTheDocument()
  })

  it('con un harem vacío, muestra el estado vacío y CopyCommandButton queda deshabilitado', async () => {
    const user = userEvent.setup()
    renderToggle(new InMemoryProfileRepository([buildProfile({ harem: { profileId: 'rodoifin', series: [] } })]))

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))

    expect(screen.getByText(/no hay personajes para ordenar/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copiar comando/i })).toBeDisabled()
  })

  it('reordenar personajes con la barra abierta actualiza el comando sin cerrarla', async () => {
    const user = userEvent.setup()
    renderToggle(new InMemoryProfileRepository([buildProfile()]), true)

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))
    expect(screen.getByDisplayValue('$sm Esdeath $ Falin Touden')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^reordenar$/i }))

    expect(screen.getByDisplayValue('$sm Falin Touden $ Esdeath')).toBeInTheDocument()
  })

  it('vuelve a tocar el ícono para ocultar la barra (aria-expanded vuelve a false)', async () => {
    const user = userEvent.setup()
    renderToggle(new InMemoryProfileRepository([buildProfile()]))

    const toggle = screen.getByRole('button', { name: /mostrar comando de orden/i })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /ocultar comando de orden/i })).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: /ocultar comando de orden/i }))

    expect(screen.getByRole('button', { name: /mostrar comando de orden/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('cerrar con Escape oculta la barra sin cambiar el harem', async () => {
    const user = userEvent.setup()
    renderToggle(new InMemoryProfileRepository([buildProfile()]))

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: /mostrar comando de orden/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('click afuera de la barra la cierra', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <div>
        <p>Contenido afuera</p>
        <ProfilesProvider repository={new InMemoryProfileRepository([buildProfile()])}>
          <SortCommandToggle />
        </ProfilesProvider>
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))
    await user.click(screen.getByText('Contenido afuera'))

    expect(screen.getByRole('button', { name: /mostrar comando de orden/i })).toHaveAttribute('aria-expanded', 'false')
  })

  describe('animación de apertura/cierre (US2)', () => {
    it('oculta: transform trasladado fuera de vista y opacity 0', () => {
      renderToggle(new InMemoryProfileRepository([buildProfile()]))

      const panel = screen.getByLabelText('Comando de orden del harem').parentElement as HTMLElement
      const styles = getComputedStyle(panel)

      expect(styles.transform).not.toBe('none')
      expect(styles.opacity).toBe('0')
    })

    it('visible: transform sin traslado y opacity 1', async () => {
      const user = userEvent.setup()
      renderToggle(new InMemoryProfileRepository([buildProfile()]))

      await user.click(screen.getByRole('button', { name: /mostrar comando de orden/i }))

      const panel = screen.getByLabelText('Comando de orden del harem').parentElement as HTMLElement
      const styles = getComputedStyle(panel)

      expect(styles.transform).toBe('translateY(0)')
      expect(styles.opacity).toBe('1')
    })

    it('togglear varias veces seguidas rápido siempre termina en el estado del último toggle', async () => {
      const user = userEvent.setup()
      renderToggle(new InMemoryProfileRepository([buildProfile()]))

      const toggle = () => screen.getByRole('button', { name: /(mostrar|ocultar) comando de orden/i })
      await user.click(toggle())
      await user.click(toggle())
      await user.click(toggle())

      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      const panel = screen.getByLabelText('Comando de orden del harem').parentElement as HTMLElement
      expect(getComputedStyle(panel).opacity).toBe('1')
    })
  })
})
