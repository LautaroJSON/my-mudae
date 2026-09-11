# Implementation Plan: Perfiles Múltiples con Harem Propio

**Branch**: `001-multi-profile-harems` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-multi-profile-harems/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Permitir crear múltiples perfiles (cada uno con su propio harem)
exclusivamente pegando el mensaje privado que Mudae le manda al usuario
con su harem; el sistema parsea ese texto para extraer el nombre del
perfil, las series y los personajes (nombre e imagen obligatorios,
kakeras y claim rank opcionales), permite alternar cuál perfil está
activo/visible, y elimina en cascada el harem completo al eliminar un
perfil. El enfoque técnico hereda íntegramente el stack y las
convenciones ya fijadas en la constitución (v1.2.0): React + TypeScript +
Vite, arquitectura DDD por capas (`domain/application/infrastructure/
presentation`) con `domain/` aislado de React/`styled-components`/
`localStorage`, `styled-components` + `lucide-react` + Context API en la
capa de presentación, y persistencia 100% client-side en `localStorage`
sin backend.

## Technical Context

**Language/Version**: TypeScript ~6.0 sobre React 19.2, scaffolding con Vite 8.3 (plantilla oficial `react-ts`) — versiones reales tomadas al hacer el scaffolding, ver `research.md`.

**Primary Dependencies**: `react`, `react-dom`, `styled-components`, `lucide-react` (todas fijadas por la constitución); `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` para testing, `oxlint` para linting (decisiones de esta feature, ver `research.md`). Ninguna librería de manejo de estado externa ni de drag-and-drop: esta feature no reordena nada, solo crea/activa/renombra/elimina perfiles.

**Storage**: `localStorage` del navegador, encapsulado detrás de un `ProfileRepository` en `infrastructure/` (ver `contracts/profile-repository.md`). Sin backend ni almacenamiento remoto.

**Testing**: Vitest (unit tests de `domain/` y `application/`) + React Testing Library (tests de componentes de `presentation/`). Verificación de viewport móvil manual vía `quickstart.md` (Escenario 5), sin framework de e2e.

**Target Platform**: Web (SPA), navegadores modernos de escritorio y móvil; debe funcionar offline una vez cargada (sin llamadas de red en el flujo de esta feature).

**Project Type**: Web frontend de un solo proyecto (client-only, sin backend) — "Option 1" adaptada a la arquitectura DDD por capas de la constitución.

**Performance Goals**: crear un perfil pegando el harem y ver su vista poblada en <5s (SC-001); cambiar de perfil activo y ver su harem en <3s (SC-004); renderizar un harem de 200+ personajes agrupados por serie sin jank perceptible (Principio III de la constitución), aunque esta feature no incluya reordenamiento.

**Constraints**: `domain/` no debe depender de React, `styled-components` ni `localStorage` (Restricciones Técnicas de la constitución); pegar un harem es la única vía de creación de perfiles (FR-003); toda mutación de estado se persiste automáticamente sin guardado manual (FR-023, Principio I); toda pantalla debe ser usable en viewport móvil (Principio V).

**Scale/Scope**: cantidad de perfiles sin límite explícito (Assumptions de `spec.md`); harems de hasta 200+ personajes por perfil, agrupados en un número variable de series.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Restricción | Aplica a esta feature | Estado |
|---|---|---|
| I. Persistencia de Datos Local Automática | Sí — FR-023 | **PASS**: `ProfileRepository.save()` se invoca desde `application/` tras cada mutación (crear, renombrar, eliminar, activar); ver `contracts/profile-repository.md`. |
| II. Integridad del Output (Orden = Comando) | No — esta feature no genera ningún comando/output para copiar | **N/A** para 001; se retoma cuando exista la feature del generador de comando. |
| III. Rendimiento en Listas Grandes (200+) | Sí — la `HaremView` puede listar 200+ personajes | **PASS**: componentes de `presentation/` (`CharacterCard`, `SeriesGroup`) se diseñan memoizados por props; sin reordenamiento en esta feature, el riesgo de re-render completo es menor que en la futura feature de drag-and-drop, pero se valida igual contra un harem grande. |
| IV. Simplicidad del Stack (Client-Only) | Sí | **PASS**: sin backend, sin autenticación, sin librería de estado externa (Context API alcanza, ver `research.md`). |
| V. Diseño Responsive y Touch-First | Sí — pantalla de pegado, selector de perfiles, vista de harem | **PASS**: verificación manual en viewport móvil incluida en `quickstart.md` (Escenario 5); no aplica la parte táctil de drag-and-drop porque esta feature no reordena nada. |
| VI. Confiabilidad del Copiado al Portapapeles | No — esta feature no copia nada al portapapeles | **N/A** para 001; se retoma junto con el generador de comando. |
| VII. Componentes Pequeños de Responsabilidad Única (+ convención de carpeta/tipado) | Sí — todo componente nuevo de `presentation/components/` | **PASS**: cada componente en su propia carpeta con `index.tsx`/`styles.tsx`, props tipadas con interface `I<Nombre>`, arrow function, `export default` al final; ver Project Structure. |
| Restricciones Técnicas (stack fijo, capas DDD, `domain/` aislado) | Sí | **PASS**: ver Project Structure; `domain/parsing/parseHaremMessage.ts` y las entidades son funciones/tipos puros sin imports de React/`styled-components`/`localStorage`. |

Sin violaciones que requieran justificación — Complexity Tracking queda vacío.

## Project Structure

### Documentation (this feature)

```text
specs/001-multi-profile-harems/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   ├── parse-harem-message.md
│   ├── profile-repository.md
│   └── profiles-context.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── profile/
│   │   └── Profile.ts              # tipo Profile + invariantes (activar/desactivar, etc.)
│   ├── harem/
│   │   ├── Harem.ts                # tipo Harem
│   │   ├── Series.ts               # tipo Series + regla "se elimina si queda vacía"
│   │   └── Character.ts            # tipo Character
│   └── parsing/
│       └── parseHaremMessage.ts    # función pura, ver contracts/parse-harem-message.md
│
├── application/
│   ├── ports/
│   │   └── ProfileRepository.ts    # interfaz, ver contracts/profile-repository.md
│   └── useCases/
│       ├── createProfileFromPaste.ts
│       ├── renameProfile.ts
│       ├── deleteProfile.ts
│       └── activateProfile.ts
│
├── infrastructure/
│   └── storage/
│       └── LocalStorageProfileRepository.ts   # implementa ProfileRepository sobre localStorage
│
├── presentation/
│   ├── components/
│   │   ├── PasteHaremScreen/
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── ProfileSwitcher/
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── ProfileCard/
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── HaremView/
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── SeriesGroup/
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   └── CharacterCard/
│   │       ├── index.tsx
│   │       └── styles.tsx
│   ├── context/
│   │   └── ProfilesContext.tsx     # ver contracts/profiles-context.md
│   └── App.tsx
│
└── main.tsx

tests/
├── unit/
│   ├── domain/
│   │   ├── parseHaremMessage.test.ts
│   │   └── harem.test.ts           # invariante "serie se autoelimina al quedar vacía"
│   └── application/
│       └── useCases.test.ts        # con InMemoryProfileRepository
├── infrastructure/
│   └── LocalStorageProfileRepository.test.ts
└── component/
    └── presentation/
        ├── PasteHaremScreen.test.tsx
        └── ProfilesFlow.test.tsx   # flujo integrado vía ProfilesContext
```

**Structure Decision**: proyecto único (no hay backend/frontend separados,
per Principio IV) organizado como monolito modular con las cuatro capas
DDD que fija la constitución. `domain/` y `application/` son TypeScript
puro, testeables sin renderizar nada; `infrastructure/` es el único lugar
que importa la API de `localStorage`; `presentation/` es el único lugar
que importa React/`styled-components`/`lucide-react`, y cada componente
nuevo sigue la convención de carpeta + tipado del Principio VII. Esta
estructura reemplaza el Option 1/2/3 genérico del template porque el
proyecto ya tiene una arquitectura fijada a nivel de constitución, no a
nivel de feature.

## Complexity Tracking

*Sin violaciones al Constitution Check — tabla no aplica para esta feature.*
