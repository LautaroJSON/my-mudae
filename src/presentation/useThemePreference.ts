import { useEffect, useState } from 'react'

export type ThemeName = 'default' | 'claro' | 'legacy'

const STORAGE_KEY = 'mymudae:theme'
const VALID_THEMES: readonly ThemeName[] = ['default', 'claro', 'legacy']

function readStoredTheme(): ThemeName {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && (VALID_THEMES as readonly string[]).includes(stored)) {
      return stored as ThemeName
    }
  } catch {
    // localStorage no disponible (navegación privada, políticas de cookies):
    // se comporta como si no hubiera ninguna preferencia guardada.
  }
  return 'default'
}

function applyThemeAttribute(theme: ThemeName) {
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme')
    return
  }
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Preferencia de tema visual del usuario (User Story 1 de 007): lee y
 * persiste en `localStorage`, y fija/remueve el atributo `data-theme`
 * de `<html>` que consume `GlobalStyle.tsx` (ver
 * contracts/theme-css-mechanism.md). Nunca lanza -- mismo criterio
 * defensivo que `LocalStorageProfileRepository`.
 */
export function useThemePreference(): [ThemeName, (theme: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(() => readStoredTheme())

  useEffect(() => {
    applyThemeAttribute(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Igual que la lectura: no bloquea la UI si no se puede persistir.
    }
  }, [theme])

  return [theme, setTheme]
}
