import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsFab from '../../../src/presentation/components/SettingsFab'
import { renderWithTheme } from '../../support/renderWithTheme'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('SettingsFab', () => {
  it('nace cerrado, sin ningún menú visible', () => {
    renderWithTheme(<SettingsFab />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('al tocar el botón, aparece el menú con la opción "Temas"', async () => {
    const user = userEvent.setup()
    renderWithTheme(<SettingsFab />)

    await user.click(screen.getByRole('button', { name: /opciones/i }))

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^temas/i })).toBeInTheDocument()
  })

  it('al tocar "Temas", se despliegan las tres opciones; al tocarlo de nuevo, se colapsan', async () => {
    const user = userEvent.setup()
    renderWithTheme(<SettingsFab />)

    await user.click(screen.getByRole('button', { name: /opciones/i }))
    await user.click(screen.getByRole('button', { name: /^temas/i }))

    expect(screen.getByRole('button', { name: /default cálido/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^claro/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^legacy/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^temas/i }))

    expect(screen.queryByRole('button', { name: /^claro/i })).not.toBeInTheDocument()
  })

  it('elegir "Legacy" lo marca como activo y fija data-theme="legacy"', async () => {
    const user = userEvent.setup()
    renderWithTheme(<SettingsFab />)

    await user.click(screen.getByRole('button', { name: /opciones/i }))
    await user.click(screen.getByRole('button', { name: /^temas/i }))
    await user.click(screen.getByRole('button', { name: /^legacy/i }))

    expect(screen.getByRole('button', { name: /^legacy/i })).toHaveAttribute('aria-current', 'true')
    expect(document.documentElement.getAttribute('data-theme')).toBe('legacy')
  })

  it('elegir "Default cálido" remueve el atributo data-theme', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('mymudae:theme', 'legacy')
    renderWithTheme(<SettingsFab />)

    await user.click(screen.getByRole('button', { name: /opciones/i }))
    await user.click(screen.getByRole('button', { name: /^temas/i }))
    await user.click(screen.getByRole('button', { name: /default cálido/i }))

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('cerrar con Escape no cambia el tema activo', async () => {
    const user = userEvent.setup()
    renderWithTheme(<SettingsFab />)

    await user.click(screen.getByRole('button', { name: /opciones/i }))
    await user.click(screen.getByRole('button', { name: /^temas/i }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('click afuera del menú lo cierra sin cambiar el tema activo', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <div>
        <p>Contenido afuera</p>
        <SettingsFab />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /opciones/i }))
    await user.click(screen.getByText('Contenido afuera'))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
