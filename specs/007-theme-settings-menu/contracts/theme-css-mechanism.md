# Contrato: Mecanismo CSS de temas (`GlobalStyle.tsx` + `data-theme`)

**Tipo de contrato**: contrato de comportamiento CSS/DOM (no hay API
HTTP en esta app client-only) — describe qué combinación de atributo
DOM + preferencia de sistema produce qué apariencia.

## Contrato

| `data-theme` en `<html>` | `prefers-color-scheme` del sistema | Paleta aplicada | Tipografía aplicada |
|---|---|---|---|
| ausente, o `"default"` | `light` (o sin preferencia) | `lightColors` | Outfit (sin cambios) |
| ausente, o `"default"` | `dark` | `darkColors` | Outfit (sin cambios) |
| `"claro"` | `light` | `lightColors` | Outfit (sin cambios) |
| `"claro"` | `dark` | `lightColors` (**no** cambia a `darkColors`) | Outfit (sin cambios) |
| `"legacy"` | `light` | `legacyColors` (**no** cambia a `lightColors`) | Segoe UI |
| `"legacy"` | `dark` | `legacyColors` (**no** cambia a `darkColors`) | Segoe UI |

## Precondiciones

- `useThemePreference` (u, antes del primer render, el script inline de
  `index.html`) es el único responsable de fijar/remover el atributo
  `data-theme` de `document.documentElement`. Ningún componente de
  `presentation/components/` debe leer o escribir ese atributo
  directamente.
- Los 13 campos de color (`background`, `surface`, `surfaceElevated`,
  `surfaceMuted`, `border`, `textPrimary`, `textSecondary`, `accent`,
  `accentHover`, `danger`, `overlay`, `shadowSm`, `shadowLg`) y los 2
  campos de tipografía (`fontBody`, `fontDisplay`) son los únicos
  afectados por el tema — `spacing`, `radii`, `motion`, `breakpoints`,
  `layout`, `zIndex` y `typography.fontMono`/`size`/`weight`/
  `lineHeight` son iguales en los tres temas.

## Postcondiciones

- Cualquier componente que use `props.theme.colors.*` o
  `props.theme.typography.fontBody`/`fontDisplay` refleja el tema activo
  automáticamente, sin cambios propios — porque esos valores ya son
  `var(--mm-color-*)`/`var(--mm-font-*)`, y son esas variables las que
  cambian de valor según la tabla de arriba.
- Cambiar de tema NO dispara ningún re-render de React en componentes
  que no sean `SettingsFab`/`SettingsMenu`/`ThemeMenuItem` — es
  puramente una actualización de CSS resuelta por el navegador.

## Casos borde cubiertos por el contrato

- Un usuario con "Legacy" elegido, en un sistema operativo con modo
  claro activado → sigue viendo la paleta oscura de "Legacy" (la fila
  correspondiente de la tabla no depende de `prefers-color-scheme`).
- Un usuario con "Default cálido" (o sin ninguna preferencia guardada
  todavía) que cambia el modo claro/oscuro de su sistema **mientras usa
  la app** → la app reacciona igual que hoy (la regla `@media` sigue
  activa para ese caso).
- `localStorage` bloqueado/no disponible (navegación privada estricta) →
  `useThemePreference` no lanza, se comporta como si no hubiera ninguna
  preferencia guardada (`'default'`), preservando el comportamiento
  actual de la app tal cual.

## Testing de este contrato

- No se testea la cascada CSS en sí en `jsdom` (mismo criterio ya
  documentado en features anteriores: `prefers-color-scheme`/media
  queries no son verificables de forma confiable ahí) — se testea el
  contrato de más alto nivel que sí es observable: que
  `useThemePreference` fija/remueve correctamente el atributo
  `data-theme` según el valor elegido (ver
  `contracts/settings-menu-ui.md`), y se valida visualmente en
  `quickstart.md` con DevTools (emulando `prefers-color-scheme` y
  alternando los tres temas).
