import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilesProvider from '../../../src/presentation/context/ProfilesContext'
import PasteHaremScreen from '../../../src/presentation/components/PasteHaremScreen'
import { InMemoryProfileRepository } from '../../support/InMemoryProfileRepository'
import { renderWithTheme } from '../../support/renderWithTheme'

const VALID_HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

function renderScreen(repository = new InMemoryProfileRepository()) {
  renderWithTheme(
    <ProfilesProvider repository={repository}>
      <PasteHaremScreen />
    </ProfilesProvider>,
  )
  return repository
}

describe('PasteHaremScreen', () => {
  it('muestra una invitación a pegar el harem, sin ningún botón de "crear perfil"', () => {
    renderScreen()

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /crear perfil/i })).not.toBeInTheDocument()
  })

  it('al pegar un harem válido, crea el perfil automáticamente sin ninguna acción adicional', async () => {
    const user = userEvent.setup()
    const repository = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste(VALID_HAREM)

    expect(repository.getAll()).toHaveLength(1)
    expect(repository.getAll()[0].alias).toBe('rodoifin')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('al pegar un texto inválido, muestra un error y no crea ningún perfil', async () => {
    const user = userEvent.setup()
    const repository = renderScreen()

    await user.click(screen.getByRole('textbox'))
    await user.paste('esto no es un harem de Mudae')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se reconoció el formato/i)
    expect(repository.getAll()).toEqual([])
  })
})
