import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import PasteHaremScreen from '../../../src/presentation/components/PasteHaremScreen'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { InMemoryServerRepository } from '../../support/InMemoryServerRepository'
import { renderWithTheme } from '../../support/renderWithTheme'

const VALID_HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

function renderScreen(
  profileRepository = new InMemoryProfileRepository(),
  serverRepository = new InMemoryServerRepository(),
) {
  renderWithTheme(
    <ProfilesProvider repository={profileRepository} serverRepository={serverRepository}>
      <PasteHaremScreen />
    </ProfilesProvider>,
  )
  return { profileRepository, serverRepository }
}

describe('PasteHaremScreen', () => {
  it('muestra una invitación a pegar el harem, sin ningún botón de "crear perfil"', () => {
    renderScreen()

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /crear perfil/i })).not.toBeInTheDocument()
  })

  it('al pegar un harem con formato válido, abre el pedido de servidor sin crear nada todavía (FR-001)', async () => {
    const user = userEvent.setup()
    const { profileRepository } = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)

    expect(screen.getByRole('dialog', { name: /elegir servidor/i })).toBeInTheDocument()
    expect(profileRepository.getAll()).toEqual([])
  })

  it('confirmar el pedido de servidor con un nombre nuevo crea el perfil asociado a ese servidor', async () => {
    const user = userEvent.setup()
    const { profileRepository, serverRepository } = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)
    await user.type(screen.getByLabelText('Servidor nuevo'), 'Mi servidor')
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(profileRepository.getAll()).toHaveLength(1)
    expect(profileRepository.getAll()[0].alias).toBe('rodoifin')
    expect(serverRepository.getAll()).toHaveLength(1)
    expect(serverRepository.getAll()[0].name).toBe('Mi servidor')
  })

  it('cancelar el pedido de servidor no crea nada y permite volver a pegar', async () => {
    const user = userEvent.setup()
    const { profileRepository } = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)
    await user.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(profileRepository.getAll()).toEqual([])
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('al pegar un texto inválido, muestra un error y no abre el pedido de servidor', async () => {
    const user = userEvent.setup()
    const { profileRepository } = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste('esto no es un harem de Mudae')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se reconoció el formato/i)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(profileRepository.getAll()).toEqual([])
  })
})
