# Implementation Plan: Menú Flotante de Temas Visuales

**Branch**: `007-theme-settings-menu` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-theme-settings-menu/spec.md`

## Summary

Agregar un botón flotante circular (engranaje) fijo en la esquina
inferior derecha, que abre un menú de opciones encima de él; la única
opción de esta iteración, "Temas", despliega tipo acordeón tres temas
elegibles: **Default cálido** (el comportamiento actual de la app, sin
cambios — paleta cálida que ya se adapta sola a claro/oscuro según el
sistema), **Claro** (la misma paleta clara ya existente, pero fija, sin
seguir al sistema, sin cambiar tipografía) y **Legacy** (paleta oscura
nueva inspirada en "Tokyo Night" + tipografía Segoe UI, fija). La
elección se guarda en `localStorage` y se reaplica sola al volver a
abrir la app. Se extiende el mecanismo de CSS custom properties que ya
usa `GlobalStyle.tsx` (hoy solo condicionado por `prefers-color-scheme`)
para que un atributo `data-theme` en `<html>` pueda fijar u overridear
esa cascada — sin necesitar re-render de React para aplicar colores o
tipografía en ningún componente existente.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (sin cambios)

**Primary Dependencies**: React 19.2, `styled-components` 6.5,
`lucide-react` 1.44 (`Settings`, `ChevronDown`, `Check`, todos ya
disponibles) — sin dependencias nuevas.

**Storage**: `localStorage`, nueva clave `mymudae:theme` con uno de
`'default' | 'claro' | 'legacy'` — mismo mecanismo client-only que ya
usa `LocalStorageProfileRepository` para el harem, sin backend.

**Testing**: Vitest 5 + `@testing-library/react` 16 + `jsdom` (sin
cambios)

**Target Platform**: SPA client-only, desktop y mobile (touch)

**Project Type**: Aplicación web de una sola página (monolito modular
DDD ya establecido)

**Performance Goals**: sin objetivo nuevo — el mecanismo de cambio de
tema es 100% CSS (custom properties + un atributo en `<html>`), sin
recomputar ni re-renderizar ningún componente existente al cambiar de
tema.

**Constraints**:
- "Default cálido" DEBE preservar exactamente el comportamiento actual
  (paleta cálida existente, adaptada automáticamente por
  `prefers-color-scheme`) — no se reescribe esa lógica, solo se la deja
  intacta como el caso por defecto.
- El cambio de tema NO DEBE requerir que ningún componente existente
  cambie cómo lee sus colores/tipografía (`props.theme.colors.*`/
  `props.theme.typography.*`) — se extiende el mecanismo de CSS custom
  properties ya vigente, no se reemplaza por un swap de objeto de tema
  en React.
- Se previene el parpadeo de tema incorrecto al cargar la página
  (aplicar el atributo `data-theme` antes del primer render de React,
  vía un script inline mínimo en `index.html`, técnica estándar para
  este problema en SPAs sin SSR).

**Scale/Scope**: una sola preferencia global de tema, tres opciones fijas
en esta iteración; el menú de opciones queda diseñado para poder sumar
más entradas después sin tocar el componente del botón/menú en sí.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Persistencia Local Automática | No es sobre el harem, pero aplica su mismo espíritu: la preferencia de tema se persiste automáticamente en `localStorage` al elegirla, sin ningún botón "Guardar", y se restaura sola al reabrir la app. | PASS (por diseño, mismo criterio que el Principio I) |
| II. Integridad del Output | No aplica: esta feature no genera ningún comando/texto para copiar. | PASS (N/A) |
| III. Rendimiento en Listas Grandes | El mecanismo de cambio de tema es CSS puro (custom properties + atributo `data-theme`); no dispara re-render de `CharacterCard`/`HaremView` ni de ninguna lista existente. El menú en sí es una interacción de baja frecuencia, sin relación con el tamaño del harem. | PASS |
| IV. Simplicidad del Stack | Sin dependencias nuevas; persistencia 100% client-only (`localStorage`), reutilizando el mismo patrón ya usado para perfiles. | PASS |
| V. Diseño Responsive y Touch-First | El botón flotante y su menú deben ser completamente usables por touch en mobile, sin quedar ocultos ni tapar otros controles; se valida manualmente en `quickstart.md`. | PASS (a validar en Fase de implementación/QA) |
| VI. Confiabilidad del Copiado al Portapapeles | No aplica: esta feature no copia nada al portapapeles. | PASS (N/A) |
| VII. Componentes Pequeños de Responsabilidad Única | Tres componentes nuevos y chicos (`SettingsFab`, `SettingsMenu`, `ThemeMenuItem`), cada uno en su carpeta `index.tsx`+`styles.tsx`, sin `React.FC`, con interface `I<Componente>` cuando corresponde, arrow function y `export default` al final — mismo patrón que el resto de la app. `SettingsMenu` queda como contenedor genérico de opciones (sin saber nada de temas), y `ThemeMenuItem` es quien sabe todo sobre la lógica de temas — separación explícita para que agregar una opción futura al menú no toque la lógica de temas. | PASS (por diseño) |

No hay violaciones que requieran justificación → no aplica la sección
"Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/007-theme-settings-menu/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   ├── theme-css-mechanism.md
│   └── settings-menu-ui.md
└── tasks.md              # Fase 2 (/speckit-tasks — NO se crea acá)
```

### Source Code (repository root)

Mismo proyecto único ya vigente. Archivos nuevos/afectados de esta
feature marcados:

```text
index.html                              # MODIFICADO — script inline anti-parpadeo (lee localStorage, fija data-theme antes de montar React)

src/
├── shared/
│   └── theme.ts                        # MODIFICADO — agrega legacyColors/legacyFonts; typography.fontBody/fontDisplay pasan a var(--mm-font-*); actualiza el comentario que hoy dice "no hay toggle manual ni estado de React"
├── presentation/
│   ├── GlobalStyle.tsx                 # MODIFICADO — variables de fuente + cascada condicionada por [data-theme]
│   ├── useThemePreference.ts           # NUEVO — hook: lee/escribe localStorage, aplica data-theme al <html>
│   ├── App.tsx                         # MODIFICADO — monta <SettingsFab />
│   └── components/
│       ├── SettingsFab/                # NUEVO — botón flotante (engranaje) + estado abierto/cerrado del menú
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── SettingsMenu/               # NUEVO — contenedor genérico de opciones, anclado encima del FAB
│       │   ├── index.tsx
│       │   └── styles.tsx
│       └── ThemeMenuItem/              # NUEVO — opción "Temas" + acordeón de los 3 temas
│           ├── index.tsx
│           └── styles.tsx
└── ...

tests/
├── unit/presentation/
│   └── useThemePreference.test.ts      # NUEVO
└── component/presentation/
    └── SettingsFab.test.tsx             # NUEVO — cubre FAB + menú + acordeón de temas de punta a punta
```

**Structure Decision**: no se toca `domain/`, `application/` ni
`infrastructure/` — esta feature no involucra ningún dato de negocio
(harem/perfil), es enteramente una preferencia visual de
`presentation/` + `shared/theme.ts`. Se reutiliza el mecanismo de CSS
custom properties ya existente para colores, extendiéndolo (no
reemplazándolo) para cubrir también tipografía y el nuevo tema fijo.

## Complexity Tracking

*No aplica — el Constitution Check no encontró violaciones que requieran
justificación.*
