# Implementation Plan: Comando de Orden de Harem para Discord

**Branch**: `009-discord-sort-command` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-discord-sort-command/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Generar, a partir del harem del perfil activo, un comando de texto
`$sm <nombre> $ <nombre> $ ...` que reproduce exactamente el orden
serie-por-serie y personaje-por-personaje visible en pantalla, y
exponerlo en una barra oculta (junto a un botón "Copiar Comando") que se
despliega/oculta con una animación suave de abajo hacia arriba al
presionar un ícono de flecha ubicado junto al botón flotante de
opciones ya existente (`SettingsFab`, feature 007). Enfoque: una función
pura de `domain/` (`formatSortCommand`) que deriva el texto directamente
de `Harem` (misma fuente que renderiza `HaremView`/`SeriesGroup`, per
Principio II), y tres componentes de `presentation/` de responsabilidad
única (toggle, barra, botón de copiar) que reutilizan el contrato de
copiado al portapapeles ya construido en la feature 004.

## Technical Context

**Language/Version**: TypeScript 6.0 (React 19), Vite 8 — stack fijo de la constitución.

**Primary Dependencies**: React 19, `styled-components` 6, `lucide-react` (íconos `ChevronUp`/`ChevronDown`/`Copy`/`Check`/`X`). No se agrega ninguna dependencia nueva: se reutilizan `copyTextToClipboard` (`presentation/copyToClipboard.ts`) y `ManualCopyDialog` ya construidos en la feature 004.

**Storage**: N/A para esta feature — no persiste ningún estado nuevo (el comando se deriva en el momento del `Harem` ya persistido vía `localStorage`, Principio I; el estado abierto/cerrado de la barra vive solo en memoria de componente, ver Assumptions de `spec.md`).

**Testing**: Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`), mismo setup que features 003/004/007 (`src/domain/**/*.test.ts` para la función pura, `src/presentation/components/**/*.test.tsx` para los componentes).

**Target Platform**: Web (navegador de escritorio y mobile), client-only — mismo alcance que el resto de la app (Principio IV).

**Project Type**: Web app de un solo proyecto (sin frontend/backend separados) — monolito modular DDD ya establecido por la constitución.

**Performance Goals**: Sin requerimiento nuevo de throughput; la única superficie de performance relevante (Principio III) es que `formatSortCommand` sea `O(n)` sobre la cantidad total de personajes y que la barra no re-renderice `HaremView`/las listas ordenables al abrirse/cerrarse o al recalcular el texto.

**Constraints**: Animación de apertura/cierre percibida como suave (sin saltos), usando exclusivamente los tokens de `theme.motion` ya definidos (`duration.base`, `easing`) — sin introducir una librería de animación nueva (Principio IV). Debe funcionar offline, igual que el resto de la app.

**Scale/Scope**: 3 componentes nuevos de `presentation/` + 1 función pura nueva de `domain/`; ningún cambio a `SettingsFab`/`SettingsMenu`/`ThemeMenuItem` (007) ni a `ShareHaremButton` (004), que quedan intocados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento planeado |
|-----------|------------------------|
| I. Persistencia Local Automática | No aplica cambio de persistencia: el comando se deriva en el momento del `Harem` ya persistido; el estado abierto/cerrado de la barra es efímero (no persistido), igual criterio que `SettingsFab.isOpen`. |
| II. Integridad del Output (Orden = Comando) | **Gate central de esta feature.** `formatSortCommand(harem)` recibe el mismo objeto `Harem` que renderiza `HaremView`/`SeriesGroup` (vía `activeProfile.harem` de `useProfiles()`), nunca una copia/snapshot — ver `data-model.md` y `contracts/format-sort-command.md`. Se recalcula en cada render mientras la barra está montada, así un reordenamiento con la barra abierta se refleja de inmediato (FR-009). |
| III. Rendimiento en Listas Grandes (200+) | `formatSortCommand` es un único recorrido `flatMap` sobre `harem.series` (`O(n)`) — sin re-render de `HaremView` ni de las listas `dnd-kit` (la barra y su cálculo viven en componentes hermanos, no envuelven al árbol de reordenamiento). Se valida manualmente con un harem de prueba de 200+ personajes (ver `quickstart.md`). |
| IV. Simplicidad del Stack | No se agrega backend, librería de animación ni librería de manejo de estado — animación 100% CSS vía `styled-components`/`theme.motion`, estado local con `useState`. |
| V. Diseño Responsive y Touch-First | Toggle y barra son botones/inputs nativos operables por touch; la barra permite scroll horizontal del texto en viewports angostos (edge case de `spec.md`) sin romper el layout ni tapar "Copiar Comando" — se valida en viewport móvil (`quickstart.md`). |
| VI. Confiabilidad del Copiado al Portapapeles | `CopyCommandButton` reutiliza el contrato ya probado `copyTextToClipboard` (2 niveles programáticos) + `ManualCopyDialog` como 3er nivel (selección manual), exactamente el mismo camino que `ShareHaremButton` (004) — ver `contracts/copy-command-button-ui.md`. Feedback visible de éxito/error en el propio botón, nunca copiado silencioso. |
| VII. Componentes Pequeños de Responsabilidad Única | Se dividen 3 responsabilidades en 3 componentes/carpetas nuevas: `SortCommandToggle` (ícono + estado abierto/cerrado), `SortCommandBar` (contenedor + campo de texto del comando), `CopyCommandButton` (botón de copiar + feedback) — ejemplo textual del propio Principio VII ("generador de comando, botón de copiar"). Cada uno con su `index.tsx`/`styles.tsx`, tipado `I<Nombre>`, `export default` al final. |

**Resultado (pre-Fase 0)**: PASS — ninguna violación; no se requiere `Complexity Tracking`.

**Re-chequeo post-Fase 1** (tras `research.md`/`data-model.md`/`contracts/`/`quickstart.md`): PASS sin cambios. El diseño final no introdujo memoización con snapshot propio (Principio II sigue satisfecho: `SortCommandBar` lee `activeProfile.harem` en cada render), no agregó dependencias nuevas (Principio IV), y mantuvo la separación en 3 componentes de responsabilidad única (Principio VII) — ver decisiones en `research.md` §§1-6.

## Project Structure

### Documentation (this feature)

```text
specs/009-discord-sort-command/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── format-sort-command.md
│   ├── sort-command-toggle-bar-ui.md
│   └── copy-command-button-ui.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Monolito modular DDD de un solo proyecto (React + Vite + TypeScript), ya
establecido por la constitución — sin frontend/backend separados. Esta
feature solo agrega archivos dentro de `domain/parsing/` y
`presentation/components/`; no toca `application/`, `infrastructure/`
ni ninguna capa existente.

```text
src/
├── domain/
│   ├── parsing/
│   │   ├── formatHaremMessage.ts        # existente (004), sin cambios
│   │   └── formatSortCommand.ts         # NUEVO (Fase 1)
│   └── harem/                           # existente, sin cambios (Harem/Series/Character)
├── presentation/
│   ├── App.tsx                          # monta <SortCommandToggle /> junto a <SettingsFab />
│   ├── copyToClipboard.ts               # existente (004), reutilizado sin cambios
│   ├── context/ProfilesContext.tsx      # existente, sin cambios (useProfiles/activeProfile)
│   └── components/
│       ├── SettingsFab/                 # existente (007), sin cambios
│       ├── ManualCopyDialog/            # existente (004), reutilizado sin cambios
│       ├── SortCommandToggle/           # NUEVO — ícono de flecha + estado abierto/cerrado
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── SortCommandBar/              # NUEVO — panel deslizable + campo de texto del comando
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── CopyCommandButton/           # NUEVO — botón "Copiar Comando" + feedback
│           ├── index.tsx
│           └── styles.tsx
└── shared/
    └── theme.ts                          # existente; se reutilizan motion/spacing/zIndex sin agregar tokens nuevos

tests/
├── unit/domain/formatSortCommand.test.ts             # NUEVO
└── component/presentation/
    ├── SortCommandToggle.test.tsx                     # NUEVO
    └── CopyCommandButton.test.tsx                     # NUEVO
```

Convención real de tests del proyecto (`001`-`008`): tests viven bajo
`tests/{unit,component,infrastructure}/`, no co-ubicados junto al
código fuente — `tests/unit/domain/` para funciones puras de `domain/`,
`tests/component/presentation/` para componentes de React.

**Structure Decision**: Un único proyecto (no hay separación
frontend/backend). Se siguen exactamente las capas y la convención de
carpeta/archivo por componente del Principio VII: 1 función pura nueva
en `domain/parsing/` y 3 componentes nuevos en `presentation/components/`,
cada uno en su propia carpeta con `index.tsx` + `styles.tsx`. Ningún
componente ni módulo existente (`SettingsFab`, `ShareHaremButton`,
`copyToClipboard.ts`, `ManualCopyDialog`) se modifica — solo se reutilizan
tal cual desde los componentes nuevos.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Ninguna violación — tabla omitida (Constitution Check: PASS sin excepciones).
