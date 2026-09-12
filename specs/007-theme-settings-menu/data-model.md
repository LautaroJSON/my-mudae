# Data Model: Menú Flotante de Temas Visuales

**Feature**: `007-theme-settings-menu` | **Date**: 2026-09-12

Esta feature no agrega ninguna entidad de dominio ni cambia ningún dato
de `Profile`/`Harem`/`Character`. La única "entidad" nueva es una
preferencia visual del dispositivo, persistida fuera del
`ProfileRepository` existente.

## Nuevo: `ThemeName`

```ts
type ThemeName = 'default' | 'claro' | 'legacy'
```

- `'default'`: paleta cálida ya existente (`lightColors`/`darkColors`),
  adaptada automáticamente por `prefers-color-scheme` (sin cambios de
  comportamiento).
- `'claro'`: la misma paleta clara ya existente (`lightColors`), fija —
  no se adapta a `prefers-color-scheme`. Tipografía sin cambios.
- `'legacy'`: paleta oscura nueva inspirada en "Tokyo Night"
  (`legacyColors`) + tipografía Segoe UI (`legacyFonts`), fija — no se
  adapta a `prefers-color-scheme`.

Es el único valor persistido por esta feature.

## Nuevo: `legacyColors` / `legacyFonts` (`src/shared/theme.ts`)

Misma forma que `lightColors`/`darkColors` (13 campos) y que
`typography` (solo los 2 campos que varían), respectivamente — ver
`research.md` para los valores concretos. No se agrega ningún campo
nuevo a esas formas existentes.

## Nuevo: CSS custom properties de tipografía

`--mm-font-body`, `--mm-font-display` (paralelas a las ya existentes
`--mm-color-*`/`--mm-shadow-*`). `theme.typography.fontBody`/
`fontDisplay` pasan de string literal a `"var(--mm-font-body)"`/
`"var(--mm-font-display)"`. `theme.typography.fontMono` no cambia (sigue
siendo el string literal `'JetBrains Mono', ...` — no varía por tema).

## Nuevo: `useThemePreference` (hook, `presentation/useThemePreference.ts`)

```ts
function useThemePreference(): [ThemeName, (theme: ThemeName) => void]
```

- **Estado inicial**: lee `localStorage.getItem('mymudae:theme')`; si el
  valor no está presente o no es uno de los tres `ThemeName` válidos,
  usa `'default'`. Nunca lanza (mismo criterio defensivo que
  `LocalStorageProfileRepository`).
- **Efecto al cambiar**: persiste el nuevo valor en `localStorage`
  (clave `mymudae:theme`) y fija `document.documentElement.dataset.
  theme = value` (o lo remueve si `value === 'default'`, ya que ese caso
  no necesita ningún atributo — el `:root` base + `@media` ya lo cubren
  sin él).
- **No mantiene ningún otro estado** — no sabe nada sobre el menú/UI que
  lo consume.

## Estado local de `SettingsFab`

```ts
type SettingsFabState = { isOpen: boolean }
```

No persistido — el menú siempre nace cerrado al cargar la página,
independientemente de qué tema esté activo.

## Estado local de `ThemeMenuItem`

```ts
type ThemeMenuItemState = { isThemesExpanded: boolean }
```

Controla únicamente si el acordeón de los 3 temas está desplegado
dentro del menú; no persistido (nace colapsado cada vez que se abre el
menú).
