import type { ReactNode } from 'react'
import { Panel } from './styles'

interface ISettingsMenu {
  children: ReactNode
}

/**
 * Contenedor genérico de opciones, anclado encima del botón flotante
 * (FR-002 de 007) — no sabe nada sobre "temas" ni ninguna opción
 * puntual. En esta iteración monta un único hijo, `ThemeMenuItem`; un
 * segundo ítem futuro se agregaría como otro hijo, sin tocar este
 * componente. El cierre por click-afuera/Escape lo maneja `SettingsFab`.
 */
const SettingsMenu = ({ children }: ISettingsMenu) => {
  return <Panel role="menu">{children}</Panel>
}

export default SettingsMenu
