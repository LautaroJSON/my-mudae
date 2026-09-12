import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useThemePreference, type ThemeName } from '../../useThemePreference'
import { Item, Row, ThemeList, ThemeOption } from './styles'

const THEME_LABELS: Record<ThemeName, string> = {
  default: 'Default cálido',
  claro: 'Claro',
  legacy: 'Legacy',
}

const THEME_ORDER: ThemeName[] = ['default', 'claro', 'legacy']

/**
 * Opción "Temas" del menú de opciones (FR-003 a FR-010 de 007): al
 * activarse, despliega tipo acordeón las tres opciones de tema; elegir
 * una llama a `useThemePreference` (que persiste y aplica el cambio de
 * inmediato vía `data-theme`, ver contracts/theme-css-mechanism.md). No
 * cierra el menú por sí sola -- eso lo maneja `SettingsFab`.
 */
const ThemeMenuItem = () => {
  const [theme, setTheme] = useThemePreference()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Item>
      <Row type="button" aria-expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
        Temas
        {isExpanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </Row>
      {isExpanded && (
        <ThemeList>
          {THEME_ORDER.map((name) => (
            <li key={name}>
              <ThemeOption
                type="button"
                $isActive={theme === name}
                aria-current={theme === name ? 'true' : undefined}
                onClick={() => setTheme(name)}
              >
                {THEME_LABELS[name]}
                {theme === name && <Check size={16} aria-hidden="true" />}
              </ThemeOption>
            </li>
          ))}
        </ThemeList>
      )}
    </Item>
  )
}

export default ThemeMenuItem
