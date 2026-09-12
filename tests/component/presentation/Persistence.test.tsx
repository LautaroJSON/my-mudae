import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../src/presentation/App'

const HAREM = `rodoifin's harem

Amagami - 1/11
#15,140 - Haruka Morishima 49 ka - https://mudae.net/uploads/8452996/kAI0tM8~ApLrugo.png`

describe('Persistencia automática (Principio I de la constitución)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('el perfil creado sigue disponible después de "refrescar" la app (desmontar y volver a montar), sin guardado manual', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await user.click(screen.getByRole('button', { name: /abrir perfiles/i }))
    await user.click(screen.getByRole('textbox'))
    await user.paste(HAREM)
    await user.type(screen.getByLabelText('Servidor nuevo'), 'Mi servidor')
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))
    expect(await screen.findByText('Haruka Morishima')).toBeInTheDocument()
    await user.keyboard('{Escape}')

    // Simula un refresh de la página: se desmonta todo el árbol de React
    // (nada queda en memoria) y se vuelve a montar desde cero, leyendo
    // únicamente lo que haya en localStorage.
    unmount()
    cleanup()
    render(<App />)

    expect(await screen.findByText('Haruka Morishima')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abrir perfiles/i })).toHaveTextContent('rodoifin')
  })
})
