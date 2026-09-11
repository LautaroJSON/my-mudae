# Design System: MyMudae

> Este documento es la **fuente única de verdad** del sistema visual de
> MyMudae, junto con [`src/shared/theme.ts`](./src/shared/theme.ts) (que
> implementa estos mismos valores como tokens tipados de TypeScript). Todo
> componente nuevo DEBE leer sus colores, tipografía, spacing, radios,
> sombras y motion desde `theme.ts` — ningún valor de color, tipografía o
> spacing se hardcodea fuera de estos dos archivos (Restricciones Técnicas
> de la constitución del proyecto, `.specify/memory/constitution.md`).
>
> **Origen de este documento**: se generó con la estructura de la skill
> `stitch-design-taste` (la única de las skills instaladas que produce un
> `DESIGN.md`), combinada con las reglas de tipografía/color/anti-patrones
> de `design-taste-frontend` que aplican a un product UI como este (se
> dejó de lado lo específico de landing pages: heroes, CTAs de marketing,
> etc., ya que MyMudae es una herramienta de gestión de harems, no una
> landing page). Los valores concretos de abajo salieron de una sesión de
> preguntas con el usuario, no de una inferencia automática.

## 0. Brief

**Lectura del brief**: herramienta personal/product UI para jugadores de
Mudae (bot de Discord tipo gacha de personajes de anime) que quieren
organizar su harem fuera de Discord — pegan el mensaje que les manda
Mudae y la app arma perfiles con sus series y personajes. Audiencia:
comunidad gamer/anime, ya familiarizada con Discord. Vibe elegido:
**"compañera gamer/anime, cálida y directa"** — cercana, con algo de
personalidad, pero sin fricción entre pegar el harem y verlo organizado.

**Dials** (escala 1-10, ver `design-taste-frontend`/`stitch-design-taste`):

| Dial | Valor | Banda | Nota |
|---|---|---|---|
| Densidad visual | 6 | "Daily App Balanced" | Harems de 200+ personajes piden algo más compacto que "art gallery airy", pero sin sentirse un cockpit de datos. |
| Motion | 5 | "Fluid CSS" | Entradas en cascada acotadas + transición al cambiar de perfil; nada cinematográfico, siempre respeta `prefers-reduced-motion`. |
| Variance (asimetría de layout) | 4 | Borde inferior de "Offset Asymmetric" | Es una grilla funcional (tarjetas de personajes, lista de perfiles), no una landing page — la personalidad va en color/tipografía, no en layouts asimétricos. |

## 1. Visual Theme & Atmosphere

Una interfaz cálida y directa: base neutra tipo piedra/arena (nunca
blanco ni negro puros), con un único acento naranja quemado que marca
las acciones principales (crear/activar perfil) y los estados de alerta
quedan en un rojo aparte. Tarjetas simples, bordes suaves, sin
glassmorphism ni gradientes — la atmósfera la da la paleta y la
tipografía redondeada (Outfit), no efectos decorativos. Pensada para
escanear rápido harems grandes, no para "impresionar" como una landing
page.

## 2. Color Palette & Roles

Paleta **"Stone + Naranja quemado"**, con variante clara y oscura
completas (máx. 1 acento, saturación < 80%, sin "morado IA", nunca negro
puro `#000000`). El modo se activa automáticamente por
`prefers-color-scheme` — no hay toggle manual.

### Claro

| Token | Hex | Rol |
|---|---|---|
| `background` | `#FAF9F7` | Fondo de página |
| `surface` | `#FFFFFF` | Tarjetas, contenedores base |
| `surfaceElevated` | `#FFFFFF` | Diálogos/modales (se diferencia por sombra, no por color) |
| `surfaceMuted` | `#F3EFE9` | Placeholders de imagen, fondos sutiles (hover) |
| `border` | `#E7E2DC` | Bordes de tarjetas, inputs, separadores |
| `textPrimary` | `#1C1917` | Texto principal |
| `textSecondary` | `#78716C` | Texto secundario/metadatos (badges, "activo") |
| `accent` | `#C2540C` | Acciones primarias (botón "nuevo perfil", focus) |
| `accentHover` | `#A8470A` | Hover/active del acento |
| `danger` | `#B3261E` | Errores, acción de eliminar |
| `overlay` | `rgba(28, 25, 23, 0.45)` | Fondo del overlay de diálogos |

### Oscuro

| Token | Hex | Rol |
|---|---|---|
| `background` | `#1C1917` | Fondo de página |
| `surface` | `#292524` | Tarjetas, contenedores base |
| `surfaceElevated` | `#33302E` | Diálogos/modales |
| `surfaceMuted` | `#3F3B38` | Placeholders de imagen, hover |
| `border` | `rgba(255, 255, 255, 0.08)` | Bordes sutiles sobre superficies oscuras |
| `textPrimary` | `#FAFAF9` | Texto principal |
| `textSecondary` | `#A8A29E` | Texto secundario/metadatos |
| `accent` | `#E2691A` | Acento (aclarado respecto al claro para mantener contraste) |
| `accentHover` | `#F07F35` | Hover/active del acento |
| `danger` | `#E5484D` | Errores, acción de eliminar (aclarado para contraste) |
| `overlay` | `rgba(0, 0, 0, 0.6)` | Fondo del overlay de diálogos |

## 3. Typography Rules

- **Display y Body**: `Outfit` — geométrica, redondeada, se siente
  amigable sin perder claridad; se usa tanto en títulos como en texto de
  cuerpo (una sola familia, dos pesos distintos para jerarquía).
- **Mono**: `JetBrains Mono` — exclusivo para valores numéricos
  (kakera, claim rank de cada personaje), para que escaneen como datos.
- **Banned**: `Inter` (default gastado de IA) y serif genérica
  (`Times New Roman`, `Georgia`, `Garamond`) — no aplican a este product
  UI de todos modos.
- **Escala** (`theme.typography.size`): `xs` 0.75rem · `sm` 0.8125rem ·
  `base` 0.9375rem (cuerpo por defecto) · `md` 1rem · `lg` 1.125rem ·
  `xl` 1.375rem (títulos de pantalla) · `xxl` 1.75rem (reservado para
  headings de página que todavía no existen).
- **Pesos** (`theme.typography.weight`): `regular` 400 · `medium` 500 ·
  `semibold` 600 (títulos, nombre de personaje) · `bold` 700 (perfil
  activo).
- **Line-height**: `tight` 1.2 (títulos/nombres) · `base` 1.5 (texto de
  cuerpo, instrucciones).

## 4. Component Stylings

- **Botones**: sin glow, sin cursor custom. El primario ("nuevo perfil")
  usa fill de acento con texto sobre `surface`; feedback táctil de
  `translateY(1px)` en `:active`. Los secundarios (cancelar, activar un
  perfil inactivo) son texto plano sin fondo.
- **Tarjetas** (`CharacterCard`, `ProfileCard`): borde 1px + `radii.md`
  (0.5rem), sin sombra por defecto — la elevación se reserva para
  diálogos, no para tarjetas de lista (con 200+ tarjetas, sombra en cada
  una sería ruido visual).
- **Diálogos** (`ConfirmDeleteProfileDialog`): `radii.lg` (0.75rem, más
  redondeado que una tarjeta — distingue "superficie flotante" de
  "elemento de lista") + `shadowLg`, fondo `surfaceElevated`.
- **Inputs** (edición de nombre de perfil): borde `border`, fondo
  `surface`, texto `textPrimary` — nunca colores de sistema del
  navegador crudos (`canvas`/`canvastext`), para que respondan al tema
  igual que el resto.
- **Zona de pegado** (`PasteZone`, pantalla de carga de harem): NO es un
  `<textarea>`/`<input>` — es un `div` con `contenteditable` (para que el
  menú nativo "Pegar" también aparezca en mobile) que solo reacciona al
  evento `paste`; el texto pegado nunca se inserta visualmente, se
  procesa y el div queda vacío de nuevo. Borde punteado por defecto,
  sólido en `accent` al enfocar (`:focus-visible`), placeholder vía
  `:empty::before` en vez de un atributo `placeholder` real.
- **Bloque de ayuda/advice** (instrucciones "¿Cómo cargar tu harem?"):
  fondo `surfaceMuted`, `radii.md`, sin borde — mismo token que usan los
  placeholders de imagen y el hover de los ícono-botones, reservado para
  "superficie de apoyo" que no es ni tarjeta ni diálogo.
- **Estados de error**: mensaje de texto con `role="alert"` en color
  `danger`, siempre visible (nunca solo un cambio de borde).
- **Shape Consistency Lock**: `radii.sm` (0.375rem) para botones/badges
  chicos, `radii.md` (0.5rem) para tarjetas/inputs, `radii.lg` (0.75rem)
  para diálogos — una sola escala, sin radios sueltos fuera de ella.

## 5. Layout Principles

- Contenedores centrados con ancho máximo fijo
  (`theme.layout`): `containerNarrow` 40rem (pantalla de pegado),
  `containerWide` 60rem (harem, selector de perfiles), `dialogWidth`
  24rem.
- Grilla de personajes con `flex-wrap` (no grid-template fijo): a
  densidad "Balanceada", cada `CharacterCard` mide 9rem y las tarjetas
  fluyen según el ancho disponible — mobile-first por construcción, sin
  necesidad de breakpoints manuales para el grid en sí.
- `theme.breakpoints` (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px)
  quedan disponibles para layouts futuros que sí los necesiten.
- Sin scroll horizontal en ningún viewport (Principio V de la
  constitución); todo layout se prueba en mobile antes de darse por
  terminado.

## 6. Motion & Interaction

- **Motion = 5/10 ("Fluid CSS")**: transiciones cortas con
  `cubic-bezier(0.16, 1, 0.3, 1)` (`theme.motion.easing`), nunca
  `linear`.
- **Duraciones** (`theme.motion.duration`): `fast` 150ms (hover/active
  de botones e íconos), `base` 220ms (fade al cambiar de perfil activo),
  `slow` 400ms (entrada de cada `CharacterCard`).
- **Entrada en cascada**: las tarjetas de personajes aparecen con un
  fade + leve desplazamiento vertical, escalonadas por
  `theme.motion.staggerStepMs` (40ms), **acotada a los primeros 12
  ítems** por serie — con harems de 200+, una cascada sin techo haría
  que las últimas tarjetas tardaran segundos en aparecer.
- **Cambio de perfil**: `HaremView` se remonta (por `key`) al activar
  otro perfil, disparando un fade de 220ms — transición perceptible sin
  ser una animación completa de página.
- **Accesibilidad**: `@media (prefers-reduced-motion: reduce)` desactiva
  toda animación/transición globalmente (`GlobalStyle.tsx`) — no es
  opcional, es guardrail de toda la app.
- Nada de scroll-jacking, GSAP, ni micro-loops perpetuos: ese nivel de
  motion es para landing pages, no para una herramienta que se usa a
  diario con listas grandes.

## 7. Anti-Patterns (Banned)

- Sin "morado/azul neón IA" — ver paleta arriba.
- Sin negro puro (`#000000`) ni blanco puro como único fondo del modo
  oscuro.
- Sin `Inter` ni serif genérica.
- Sin glow exterior en botones ni cursores custom.
- Sin emojis en la UI (los íconos son `lucide-react`, per Restricciones
  Técnicas de la constitución).
- Sin texto de relleno tipo "Scroll to explore" — no aplica, no hay
  landing page.
- Sin nombres/marcas de ejemplo genéricos ("John Doe", "Acme") en
  ningún placeholder o dato de ejemplo del código.
- Sin colores, tipografía o spacing hardcodeados fuera de `theme.ts` /
  este documento — el propio enforcement de esta regla vive en la
  constitución del proyecto.
