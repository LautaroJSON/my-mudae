import { createGlobalStyle } from 'styled-components'
import { darkColors, lightColors, typography } from '../shared/theme'

/**
 * Define las CSS custom properties de color a partir de `shared/theme.ts`
 * (única fuente de verdad de los valores reales) y las reasigna bajo
 * `prefers-color-scheme: dark`; ningún valor nuevo se inventa acá, solo se
 * proyectan los de `lightColors`/`darkColors`. También aplica el reset
 * tipográfico global y el guardrail de `prefers-reduced-motion` (DESIGN.md
 * § Motion & Interaction).
 */
const GlobalStyle = createGlobalStyle`
  :root {
    --mm-color-background: ${lightColors.background};
    --mm-color-surface: ${lightColors.surface};
    --mm-color-surface-elevated: ${lightColors.surfaceElevated};
    --mm-color-surface-muted: ${lightColors.surfaceMuted};
    --mm-color-border: ${lightColors.border};
    --mm-color-text-primary: ${lightColors.textPrimary};
    --mm-color-text-secondary: ${lightColors.textSecondary};
    --mm-color-accent: ${lightColors.accent};
    --mm-color-accent-hover: ${lightColors.accentHover};
    --mm-color-danger: ${lightColors.danger};
    --mm-color-overlay: ${lightColors.overlay};
    --mm-shadow-sm: ${lightColors.shadowSm};
    --mm-shadow-lg: ${lightColors.shadowLg};
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --mm-color-background: ${darkColors.background};
      --mm-color-surface: ${darkColors.surface};
      --mm-color-surface-elevated: ${darkColors.surfaceElevated};
      --mm-color-surface-muted: ${darkColors.surfaceMuted};
      --mm-color-border: ${darkColors.border};
      --mm-color-text-primary: ${darkColors.textPrimary};
      --mm-color-text-secondary: ${darkColors.textSecondary};
      --mm-color-accent: ${darkColors.accent};
      --mm-color-accent-hover: ${darkColors.accentHover};
      --mm-color-danger: ${darkColors.danger};
      --mm-color-overlay: ${darkColors.overlay};
      --mm-shadow-sm: ${darkColors.shadowSm};
      --mm-shadow-lg: ${darkColors.shadowLg};
    }
  }

  body {
    font-family: ${typography.fontBody};
    color: var(--mm-color-text-primary);
    background: var(--mm-color-background);
  }

  /* Scrollbar angosto y fino en toda la app (Firefox + navegadores
     basados en WebKit/Blink): track del mismo tono que el fondo, thumb
     ("pill") con el color de acento -- mismo lenguaje visual que el
     resto de la UI, en vez de la scrollbar por defecto del sistema. Se
     aplica con el selector universal a propósito: cubre también los
     overflow internos (ej. CharacterList, Modal, ManualCopyDialog), no
     solo el scroll de la página. */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--mm-color-accent) var(--mm-color-background);
  }

  *::-webkit-scrollbar {
    width: ${(props) => props.theme.spacing.sm};
    height: ${(props) => props.theme.spacing.sm};
  }

  *::-webkit-scrollbar-track {
    background: var(--mm-color-background);
  }

  *::-webkit-scrollbar-thumb {
    background: var(--mm-color-accent);
    border-radius: ${(props) => props.theme.radii.pill};
  }

  *::-webkit-scrollbar-thumb:hover {
    background: var(--mm-color-accent-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`

export default GlobalStyle
