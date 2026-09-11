/**
 * Fuente única de verdad de los tokens visuales de MyMudae (junto con
 * DESIGN.md, que documenta el razonamiento detrás de estos valores). Todo
 * `styles.tsx` DEBE leer sus colores, tipografía, spacing, radios, sombras
 * y motion desde acá (`props.theme.*`) — ningún valor de color, tipografía
 * o spacing se hardcodea fuera de este archivo (Restricciones Técnicas de
 * la constitución).
 *
 * Los colores viven detrás de CSS custom properties (`--mm-color-*`,
 * `--mm-shadow-*`) definidas en `GlobalStyle.tsx` a partir de
 * `lightColors`/`darkColors` de acá mismo, con la variante oscura
 * activada automáticamente vía `@media (prefers-color-scheme: dark)` — no
 * hay toggle manual ni estado de React para el tema. El resto de los
 * tokens (tipografía, spacing, radios, motion, breakpoints, z-index) no
 * cambia entre claro/oscuro, así que viven como valores planos.
 */

// Paleta "Stone + Naranja quemado" — claro. Base neutra cálida (stone),
// un solo acento (burnt orange), sin negro puro.
export const lightColors = {
  background: "#FAF9F7",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F3EFE9",
  border: "#E7E2DC",
  textPrimary: "#1C1917",
  textSecondary: "#78716C",
  accent: "#C2540C",
  accentHover: "#A8470A",
  danger: "#B3261E",
  overlay: "rgba(28, 25, 23, 0.45)",
  shadowSm: "0 1px 2px rgba(28, 25, 23, 0.06)",
  shadowLg: "0 12px 32px rgba(28, 25, 23, 0.18)",
} as const;

// Misma paleta, variante oscura — acento y color de peligro aclarados
// para mantener contraste sobre fondo oscuro; nunca negro puro (#1C1917
// como fondo más oscuro, no #000000).
export const darkColors = {
  background: "#1C1917",
  surface: "#292524",
  surfaceElevated: "#33302E",
  surfaceMuted: "#3F3B38",
  border: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#FAFAF9",
  textSecondary: "#A8A29E",
  accent: "#E2691A",
  accentHover: "#F07F35",
  danger: "#E5484D",
  overlay: "rgba(0, 0, 0, 0.6)",
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.4)",
  shadowLg: "0 20px 48px rgba(0, 0, 0, 0.55)",
} as const;

export const typography = {
  fontDisplay: "'Outfit', system-ui, 'Segoe UI', Roboto, sans-serif",
  fontBody: "'Outfit', system-ui, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace",
  size: {
    xs: "0.75rem",
    sm: "0.8125rem",
    base: "0.9375rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.375rem",
    xxl: "1.75rem",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    base: 1.5,
  },
} as const;

export const spacing = {
  xxs: "0.25rem",
  xs: "0.375rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  xxl: "1.5rem",
  xxxl: "2rem",
} as const;

// Shape Consistency Lock (DESIGN.md): sm para elementos chicos (botones,
// badges), md como radio por defecto de tarjetas/inputs, lg para
// contenedores grandes (diálogos, pantallas), pill para elementos
// circulares/tipo cápsula.
export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  pill: "999px",
} as const;

export const motion = {
  duration: {
    fast: "150ms",
    base: "220ms",
    slow: "400ms",
  },
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Delay entre ítems de una lista que entra en cascada, en ms. */
  staggerStepMs: 40,
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

// Anchos de contenedor reutilizados por más de una pantalla (a diferencia
// de dimensiones intrínsecas de un componente puntual, como el ancho fijo
// de una CharacterCard, que se queda local a ese componente).
export const layout = {
  containerNarrow: "40rem",
  containerWide: "80rem",
  dialogWidth: "24rem",
} as const;

// Header fijo por encima del contenido normal; overlay/modal comparten
// nivel (el Dialog de un Modal ya se apila sobre su propio Overlay por
// orden del DOM); nestedDialog es para un modal que se abre encima de
// otro (ej. ConfirmDeleteProfileDialog dentro de ProfilesModal).
export const zIndex = {
  header: 5,
  overlay: 10,
  modal: 10,
  nestedDialog: 20,
  dropdown: 30,
  toast: 40,
} as const;

const colors = {
  background: "var(--mm-color-background)",
  surface: "var(--mm-color-surface)",
  surfaceElevated: "var(--mm-color-surface-elevated)",
  surfaceMuted: "var(--mm-color-surface-muted)",
  border: "var(--mm-color-border)",
  textPrimary: "var(--mm-color-text-primary)",
  textSecondary: "var(--mm-color-text-secondary)",
  accent: "var(--mm-color-accent)",
  accentHover: "var(--mm-color-accent-hover)",
  danger: "var(--mm-color-danger)",
  overlay: "var(--mm-color-overlay)",
  shadowSm: "var(--mm-shadow-sm)",
  shadowLg: "var(--mm-shadow-lg)",
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  motion,
  breakpoints,
  zIndex,
  layout,
} as const;

export type Theme = typeof theme;

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
