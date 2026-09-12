# Research: Menú Flotante de Temas Visuales

**Feature**: `007-theme-settings-menu` | **Date**: 2026-09-12

El stack, la arquitectura y el sistema de tokens ya están fijados
(constitución v1.3.0). Esta sección cubre las decisiones nuevas de esta
feature, que introduce el primer mecanismo de selección de tema manual
de la app (hasta ahora, 100% automático vía `prefers-color-scheme`).

## Decisión: extender el mecanismo de CSS custom properties existente con un atributo `data-theme`, en vez de swapear el objeto `theme` de React

- **Decision**: se agrega un atributo `data-theme="default" | "claro" | "legacy"` en `<html>` (fijado por un hook nuevo, `useThemePreference`, y por un script inline anti-parpadeo en `index.html`). `GlobalStyle.tsx` gana reglas CSS que leen ese atributo para decidir qué valores usar en las mismas variables (`--mm-color-*`, `--mm-shadow-*`) que ya existen, más dos variables nuevas (`--mm-font-body`, `--mm-font-display`). El objeto `theme` que recibe `<ThemeProvider theme={theme}>` en `App.tsx` **no cambia** — sigue siendo el mismo objeto estático de siempre.
- **Rationale**: hoy, absolutamente ningún componente de la app sabe que sus colores pueden cambiar — todos leen `props.theme.colors.*`, que ya son referencias `var(--mm-color-*)` resueltas por el navegador. Extender esa misma indirección (agregar más reglas CSS que decidan el VALOR de esas variables) permite que el tema cambie en toda la app sin que ningún componente existente se entere ni se re-renderice — cero riesgo de regresión en los ~15 componentes que ya leen `theme.colors`/`theme.typography`. La alternativa (mantener distintos objetos `theme` en React y hacer `<ThemeProvider theme={temaElegido}>`) funcionaría también, pero sería un cambio de arquitectura mucho más grande sin ningún beneficio real acá.
- **Alternatives considered**: mantener 3 objetos `theme` completos (uno por tema) y elegir cuál pasarle a `ThemeProvider` según el estado de React — se descarta por ser estrictamente más trabajo (recrear la estructura completa de `colors`/`typography` tres veces en JS, en vez de en CSS) para el mismo resultado visual, y porque el comentario de cabecera de `theme.ts` ya documentaba la razón original de evitar exactamente este patrón ("no hay toggle manual ni estado de React para el tema") — aunque ese comentario queda desactualizado por esta feature (se actualiza, ver más abajo), el mecanismo CSS-first que describía sigue siendo el más simple disponible.

## Decisión: reglas CSS — cómo conviven "sigue al sistema" (default) y "fijo" (claro/legacy)

- **Decision**:
  ```css
  :root {
    /* base = lightColors (igual que hoy) */
    --mm-color-background: ${lightColors.background};
    /* ...resto de --mm-color-*/--mm-shadow-* con lightColors... */
    --mm-font-body: ${typography.fontBody};     /* stack Outfit, sin cambios */
    --mm-font-display: ${typography.fontDisplay};
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="claro"]):not([data-theme="legacy"]) {
      /* mismo bloque que hoy, con darkColors — ahora excluye "claro"/"legacy" */
    }
  }

  :root[data-theme="legacy"] {
    /* legacyColors + legacyFonts, SIN estar detrás de ningún @media:
       aplica siempre que el atributo esté puesto, sin importar el
       sistema */
  }
  ```
  - Sin atributo, o `data-theme="default"`: comportamiento idéntico al de hoy (la regla `@media (prefers-color-scheme: dark)` decide).
  - `data-theme="claro"`: la regla de modo oscuro queda explícitamente excluida por el `:not(...)`, así que el `:root` base (claro) se mantiene sin importar el sistema; tipografía no cambia (usa el mismo `--mm-font-body` base).
  - `data-theme="legacy"`: también excluido de la regla de modo oscuro (mismo `:not(...)`), y tiene su PROPIA regla incondicional que fija paleta y tipografía sin importar el sistema.
- **Rationale**: es la forma más directa de expresar "el tema `default` sigue dependiendo del sistema, los otros dos no" sin introducir ninguna lógica de JS para decidir colores — el navegador resuelve todo por cascada CSS.
- **Alternatives considered**: usar `data-theme="dark"/"light"` genérico en vez de nombres de negocio (`default`/`claro`/`legacy`) — se descarta porque el atributo necesita distinguir específicamente el tema "Legacy" (que es dark pero con paleta y tipografía propias, no la misma variante oscura de "Default cálido"), así que un esquema binario claro/oscuro no alcanza para tres temas.

## Decisión: paleta "Legacy" (inspirada en Tokyo Night)

- **Decision**: nueva constante `legacyColors` en `theme.ts`, con la misma forma que `lightColors`/`darkColors` (mismos 13 campos), poblada con tonos inspirados en la paleta pública de "Tokyo Night" (tema de VS Code de Enkia): fondo azul-negro muy oscuro, acento celeste/azul característico del tema, rosa/rojo para `danger`, texto principal lavanda claro, texto secundario azul-grisáceo apagado. Valores concretos:
  ```ts
  export const legacyColors = {
    background: "#1A1B26",
    surface: "#1F2335",
    surfaceElevated: "#292E42",
    surfaceMuted: "#24283B",
    border: "#3B4261",
    textPrimary: "#C0CAF5",
    textSecondary: "#9AA5CE",
    accent: "#7AA2F7",
    accentHover: "#89B4FA",
    danger: "#F7768E",
    overlay: "rgba(10, 10, 20, 0.6)",
    shadowSm: "0 1px 2px rgba(0, 0, 0, 0.5)",
    shadowLg: "0 20px 48px rgba(0, 0, 0, 0.6)",
  } as const
  ```
- **Rationale**: son los tonos más reconocibles y repetidos de "Tokyo Night" (el celeste `#7aa2f7` es su color de acento más icónico); mapearlos 1:1 sobre los mismos 13 roles que ya usan `lightColors`/`darkColors` evita inventar un esquema de tokens nuevo — "Legacy" es, para el resto de la app, un tercer palette con la misma forma que los otros dos, no un sistema aparte.
- **Alternatives considered**: portar la paleta completa de sintaxis de código de Tokyo Night (verde, amarillo, morado, etc.) — se descarta porque la app no tiene syntax highlighting ni necesita esos matices; solo hacen falta los 13 roles ya definidos (fondo, superficie, texto, un acento, un color de peligro).

## Decisión: tipografía "Legacy" — Segoe UI, sin tocar `fontMono`

- **Decision**: nueva constante en `theme.ts`:
  ```ts
  export const legacyFonts = {
    fontBody: "'Segoe UI', system-ui, Roboto, Arial, sans-serif",
    fontDisplay: "'Segoe UI', system-ui, Roboto, Arial, sans-serif",
  } as const
  ```
  `typography.fontBody`/`fontDisplay` (el objeto que consume `theme.colors`... digo `theme.typography`) pasan a ser `"var(--mm-font-body)"`/`"var(--mm-font-display)"` (mismo patrón que `colors`), con `--mm-font-body`/`--mm-font-display` definidas en `:root` (Outfit, valor por defecto) y overrideadas dentro de `:root[data-theme="legacy"]`. `typography.fontMono` (`'JetBrains Mono'`, usado para kakera/claim-rank) **no cambia** en ningún tema.
- **Rationale**: el pedido del usuario es específico ("fuente Segoe UI" para Legacy, "el tema claro no cambia la fuente") — no menciona la tipografía monoespaciada de los badges numéricos, que no tiene relación temática con "Tokyo Night" ni con Segoe UI; cambiarla también sería alcance no pedido.
- **Alternatives considered**: cambiar también `fontMono` a una fuente monoespaciada "estilo VS Code" (ej. Cascadia Code, que de hecho ya está en el fallback stack de `fontMono`) — se descarta por alcance: el pedido original solo habla de "fuente" en singular, refiriéndose al look general de la app (`fontBody`/`fontDisplay`), no a los badges numéricos.

## Decisión: dónde vive la preferencia — hook nuevo, no un Context

- **Decision**: `presentation/useThemePreference.ts`, un hook standalone (no un Context/Provider) que expone `[theme, setTheme]` (`theme: 'default' | 'claro' | 'legacy'`). Internamente: estado inicial leído de `localStorage` (clave `mymudae:theme`, default `'default'` si no hay nada guardado o el valor no es válido), y un `useEffect` que persiste en `localStorage` y fija `document.documentElement.dataset.theme` cada vez que cambia.
- **Rationale**: en esta iteración, un único componente (`ThemeMenuItem`) necesita leer y cambiar la preferencia — no hay ningún otro consumidor. Un hook simple alcanza y evita el costo de introducir un Context/Provider nuevo (con su propio archivo de contrato, wrapping en `App.tsx`, etc.) para un solo consumidor, siguiendo el mismo criterio YAGNI ya aplicado en `005`/`006` (no compartir infraestructura hasta que haya un segundo consumidor real).
- **Alternatives considered**: un Context `ThemeSettingsContext` (mismo patrón que `ProfilesContext`) — se descarta por ahora; si una futura opción del mismo menú necesita también leer/cambiar el tema, ese es el momento de extraerlo a un Context compartido, no antes.

## Decisión: prevención de parpadeo (FOUC) — script inline en `index.html`

- **Decision**: agregar un `<script>` inline (no un módulo, sin `type="module"`, para que se ejecute de forma síncrona antes de que se monte React) en `index.html`, antes de `<div id="root">`, que lee `localStorage.getItem('mymudae:theme')` y, si el valor es `'claro'` o `'legacy'`, fija `document.documentElement.dataset.theme` inmediatamente:
  ```html
  <script>
    (function () {
      try {
        var t = localStorage.getItem('mymudae:theme');
        if (t === 'claro' || t === 'legacy') {
          document.documentElement.setAttribute('data-theme', t);
        }
      } catch (e) {}
    })();
  </script>
  ```
- **Rationale**: sin esto, entre el primer paint de `GlobalStyle` (que renderiza el `:root` por defecto) y el `useEffect` de `useThemePreference` (que corre después del primer render de React), un usuario con "Claro" o "Legacy" ya elegidos vería un parpadeo momentáneo del tema por defecto antes de que se corrija — técnica estándar y ampliamente usada en SPAs sin SSR para este problema exacto. Se envuelve en `try/catch` porque `localStorage` puede lanzar en contextos restringidos (navegación privada estricta, políticas de cookies) — el mismo criterio defensivo que ya usa `LocalStorageProfileRepository.getAll()` (nunca lanza).
- **Alternatives considered**: no hacer nada y aceptar el parpadeo — se descarta porque es una regresión de pulido evitable con una técnica bien conocida y de bajísimo riesgo (unas pocas líneas, sin dependencias); no aplica en absoluto al tema `'default'` (que de por sí ya decide su apariencia vía `prefers-color-scheme`, sin parpadeo posible, así que el script solo actúa para los dos temas fijos).

## Decisión: componentes — `SettingsFab` (botón) / `SettingsMenu` (contenedor genérico) / `ThemeMenuItem` (lógica de temas)

- **Decision**: tres componentes, separación de responsabilidades:
  - `SettingsFab`: botón redondo fijo (`position: fixed; bottom/right`), ícono `Settings` de `lucide-react`, controla solamente si el menú está abierto o cerrado (estado local `isOpen`) y el cierre por click-afuera/Escape; cuando está abierto, renderiza `<SettingsMenu>`.
  - `SettingsMenu`: contenedor visual anclado encima del botón (popover), sin saber nada de "temas" — en esta iteración monta un único hijo, `<ThemeMenuItem />`, igual que `HeaderActions` (`004`) monta sus botones sin saber qué hacen.
  - `ThemeMenuItem`: la fila "Temas" + su acordeón de 3 opciones; usa `useThemePreference()` directamente, marca la opción activa, y llama a `setTheme(...)` al elegir una.
- **Rationale**: mismo patrón de extensibilidad ya usado por `HeaderActions`/`ShareHaremButton`/`UpdateHaremButton` (`004`/`005`): un contenedor "tonto" + ítems que saben cada uno su propia lógica, para que agregar una segunda opción al menú en el futuro sea agregar un componente hermano de `ThemeMenuItem`, sin tocar `SettingsFab`/`SettingsMenu`.
- **Alternatives considered**: un único componente `SettingsFab` que incluya el botón, el menú y la lógica de temas todo junto — se descarta por mezclar 3 responsabilidades en un componente (Principio VII) y por no dejar preparada la extensibilidad que ya pide `spec.md` en sus Assumptions.

## Decisión: z-index del FAB y su menú

- **Decision**: reutilizar `theme.zIndex.header` (5) para el botón flotante y su menú desplegado — no se agrega un token nuevo.
- **Rationale**: es el mismo nivel que ya usa el `Header` para "chrome siempre visible durante el uso normal de la página" — que, hoy, igual queda cubierto cuando se abre un `Modal` (`zIndex.overlay`/`modal` = 10). Aplicar el mismo criterio al FAB es consistente con cómo la app ya trata "siempre visible": visible durante scroll/navegación normal, cubierto por un diálogo modal explícito (que ya bloquea toda la página mientras está abierto). No hace falta que el FAB flote por encima de absolutamente todo.
- **Alternatives considered**: darle al FAB un z-index mayor que `zIndex.toast` (40) para que se vea incluso sobre cualquier diálogo — se descarta por inconsistencia con cómo ya se comporta el `Header` (mismo tipo de elemento "siempre visible"), y porque no hay ningún caso de uso real que requiera cambiar de tema mientras un modal está abierto encima.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.
