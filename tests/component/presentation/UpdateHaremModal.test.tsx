import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import UpdateHaremButton from '../../../src/presentation/components/UpdateHaremButton'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'
import type { Profile } from '../../../src/domain/profile/Profile'

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'rodoifin',
    alias: 'rodoifin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    order: 0,
    harem: {
      profileId: 'rodoifin',
      series: [
        {
          id: 'series-1',
          name: 'Amagami',
          characters: [{ id: 'char-1', name: 'Haruka Morishima', imageUrl: 'https://mudae.net/a.png', kakera: 49, claimRank: '#1' }],
        },
      ],
    },
    ...overrides,
  }
}

const UPDATED_HAREM = `rodoifin's harem

Amagami - 1/11
#1 - Haruka Morishima 99 ka - https://mudae.net/a.png`

const OTHER_USER_HAREM = `otrousuario's harem

Amagami - 1/11
#5 - Alguien Mas 20 ka - https://mudae.net/x.png`

async function openModal(repository = new InMemoryProfileRepository([buildProfile()])) {
  const user = userEvent.setup()
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <UpdateHaremButton />
    </ProfilesProvider>,
  )
  await user.click(screen.getByRole('button', { name: /actualizar harem/i }))
  return { user, repository }
}

describe('UpdateHaremModal (vía UpdateHaremButton)', () => {
  it('al pegar un texto válido con el mismo nombre de perfil, cierra el modal y muestra feedback de éxito', async () => {
    const repository = new InMemoryProfileRepository([buildProfile()])
    const { user } = await openModal(repository)

    await user.click(screen.getByRole('textbox'))
    await user.paste(UPDATED_HAREM)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText(/harem actualizado/i)).toBeInTheDocument()
    expect(repository.getAll()[0].harem.series[0].characters[0].kakera).toBe(99)
  })

  it('al pegar un texto de otro nombre de perfil, muestra una advertencia sin modificar ningún harem', async () => {
    const activo = buildProfile()
    const otro = buildProfile({ id: 'otrousuario', alias: 'otrousuario', isActive: false })
    const repository = new InMemoryProfileRepository([activo, otro])
    const { user } = await openModal(repository)

    await user.click(screen.getByRole('textbox'))
    await user.paste(OTHER_USER_HAREM)

    expect(screen.getByRole('dialog')).toHaveTextContent('otrousuario')
    expect(screen.getByRole('dialog')).toHaveTextContent(/no corresponde al perfil/i)
    expect(screen.queryByText(/harem actualizado/i)).not.toBeInTheDocument()
    expect(repository.getAll()).toEqual([activo, otro])
  })

  it('"Reintentar" vuelve a mostrar la zona de pegado tras una advertencia', async () => {
    const { user } = await openModal()

    await user.click(screen.getByRole('textbox'))
    await user.paste(OTHER_USER_HAREM)
    await user.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).not.toHaveTextContent('otrousuario')
  })

  it('al pegar un texto inválido, muestra un error inline sin cambiar a la vista de advertencia', async () => {
    const { user } = await openModal()

    await user.click(screen.getByRole('textbox'))
    await user.paste('esto no es un harem de Mudae')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se reconoció el formato/i)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('cerrar el modal sin pegar nada no muestra ningún feedback ni modifica el harem', async () => {
    const activo = buildProfile()
    const repository = new InMemoryProfileRepository([activo])
    const { user } = await openModal(repository)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(/harem actualizado/i)).not.toBeInTheDocument()
    expect(repository.getAll()).toEqual([activo])
  })
})
