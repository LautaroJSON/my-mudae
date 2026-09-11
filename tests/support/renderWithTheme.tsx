import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../../src/shared/theme'

/**
 * Envuelve el render en `ThemeProvider` con los tokens reales de
 * `shared/theme.ts`, para tests de componentes que se montan solos (fuera
 * de `App`, que ya trae su propio `ThemeProvider`).
 */
export function renderWithTheme(ui: ReactElement): RenderResult {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}
