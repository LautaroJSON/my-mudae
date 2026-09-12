import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../src/presentation/App'

const HAREM_A = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

const HAREM_B = `otroUsuario's harem

Black Clover - 1/124
#182 - Noelle Silva 479 ka - https://mudae.net/uploads/8359937/KepDTJs~L1GuaoM.png`

async function openProfilesModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /abrir perfiles/i }))
}

async function closeModal(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard('{Escape}')
}

async function pasteHarem(user: ReturnType<typeof userEvent.setup>, text: string, serverName: string) {
  const textarea = screen.getByRole('textbox')
  await user.click(textarea)
  await user.paste(text)
  await user.type(screen.getByLabelText('Servidor nuevo'), serverName)
  await user.click(screen.getByRole('button', { name: /^confirmar$/i }))
}

describe('Flujo integrado de perfiles (header + modal)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('pegar el primer harem crea y activa el perfil (asociado a un servidor); pegar un segundo lo reemplaza como activo; cambiar de activo; eliminar el activo reactiva el otro; eliminar el último vuelve a la pantalla de pegado', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 0 perfiles → header invita a crear uno
    expect(screen.getByRole('button', { name: /abrir perfiles/i })).toHaveTextContent(/crear perfil/i)

    // Abrir el modal y pegar el primer harem, indicando un servidor nuevo
    // — pegar+confirmar con éxito cierra el modal solo
    await openProfilesModal(user)
    await pasteHarem(user, HAREM_A, 'Server A')

    expect(within(screen.getByRole('button', { name: /abrir perfiles/i })).getByText('rodoifin')).toBeInTheDocument()
    expect(screen.getByText('Haruka Morishima')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Agregar un segundo perfil desde "nuevo perfil" dentro del modal,
    // reutilizando el mismo servidor ya creado (radio button)
    await openProfilesModal(user)
    await user.click(screen.getByRole('button', { name: /nuevo perfil/i }))
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.paste(HAREM_B)
    await user.click(screen.getByRole('radio', { name: 'Server A' }))
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('button', { name: /abrir perfiles/i })).getByText('otroUsuario'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Noelle Silva')).toBeInTheDocument()
    expect(screen.queryByText('Haruka Morishima')).not.toBeInTheDocument()

    // Volver a activar rodoifin manualmente desde la lista del modal,
    // agrupada por servidor
    await openProfilesModal(user)
    await user.click(screen.getByText('Server A'))
    const list = screen.getByLabelText('Lista de perfiles')
    await user.click(within(list).getByRole('button', { name: 'rodoifin' }))
    await closeModal(user)

    expect(await screen.findByText('Haruka Morishima')).toBeInTheDocument()
    expect(screen.queryByText('Noelle Silva')).not.toBeInTheDocument()

    // Eliminar el perfil activo (rodoifin) reactiva el otro (otroUsuario);
    // la eliminación pide confirmación primero (irreversible)
    await openProfilesModal(user)
    await user.click(screen.getByText('Server A'))
    await user.click(screen.getByRole('button', { name: 'Eliminar perfil rodoifin' }))
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))
    await closeModal(user)

    expect(await screen.findByText('Noelle Silva')).toBeInTheDocument()

    // Eliminar el único perfil restante vuelve a mostrar la zona de
    // pegado, ahora dentro del modal (ya no hay perfiles)
    await openProfilesModal(user)
    await user.click(screen.getByText('Server A'))
    await user.click(screen.getByRole('button', { name: /eliminar perfil otrousuario/i }))
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    expect(await screen.findByRole('heading', { name: /agregar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
