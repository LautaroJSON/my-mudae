# Implementation Plan: Header con Modal de Perfiles

**Branch**: `002-header-profile-modal` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-header-profile-modal/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Reemplazar el selector de perfiles inline (visible en la página
principal desde `001-multi-profile-harems`) por un header fijo con el
alias del perfil activo, que abre un modal con la lista completa de
perfiles: crear (pegar harem), activar, renombrar (alias), eliminar,
reordenar por drag-and-drop, y abrir en pestaña nueva vía `?id=`. Incluye
una reestructuración del modelo `Profile` (separar `id` inmutable —
derivado del nombre original del harem— de `alias` editable, más un
`order` manual), una migración transparente de los perfiles ya creados, y
un cambio de comportamiento importante: volver a pegar un harem cuyo
nombre coincide con un perfil existente ya NO crea un duplicado, sino que
sincroniza su harem (agrega/actualiza/elimina personajes por claim rank).
El stack, la arquitectura por capas y la convención de tokens/componentes
siguen siendo los fijados por la constitución (v1.3.0); esta feature suma
una única dependencia nueva justificada: `@dnd-kit` para el
drag-and-drop.

## Technical Context

**Language/Version**: TypeScript ~6.0 sobre React 19.2, Vite 8.3 (sin cambios respecto a `001`).

**Primary Dependencies**: las ya fijadas por la constitución (`react`, `react-dom`, `styled-components`, `lucide-react`) más **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`** (nueva, justificada en `research.md`: única librería de drag-and-drop evaluada que cumple mouse+touch según Restricciones Técnicas). Sin librería de ruteo — el parámetro `id` de la URL se maneja con `URLSearchParams` nativo (ver `research.md`). Testing: mismo stack que `001` (Vitest + React Testing Library + user-event).

**Storage**: `localStorage` vía el mismo `ProfileRepository`/`LocalStorageProfileRepository` de `001`, con una migración transparente de la forma persistida (ver `data-model.md`).

**Testing**: Vitest + React Testing Library, incluyendo simulación de drag-and-drop con `@dnd-kit` (eventos de teclado/puntero que expone su API de testing) y de `window.location.search` para los tests del parámetro `id`.

**Target Platform**: Web (SPA), sin cambios respecto a `001` — debe seguir funcionando offline una vez cargada.

**Project Type**: Mismo proyecto único client-only de `001`, misma arquitectura DDD por capas + `shared/`.

**Performance Goals**: cambiar de perfil (por header/modal o por `?id=`) y ver su harem en <3s (SC-001, SC-005); reordenar por drag-and-drop debe sentirse inmediato (sin jank) con la cantidad de perfiles esperada (decenas, no cientos — a diferencia del harem de personajes, que sí puede llegar a 200+ y no es tocado por esta feature).

**Constraints**: `id` de perfil único e inmutable en todo momento, incluso tras migrar perfiles previos (SC-006); la sincronización de harem (FR-015b) nunca debe duplicar un personaje ya presente (identificado por claim rank); el drag-and-drop debe funcionar con mouse y touch (Principio V); todo estilo nuevo sale de `theme.ts`/`DESIGN.md` (Restricciones Técnicas); dos pestañas pueden mostrar perfiles distintos a la vez sin pisarse (FR-018).

**Scale/Scope**: mismo volumen que `001` (harems de 200+ personajes por perfil); la lista de perfiles en sí misma se espera de tamaño moderado (una cuenta de Discord por perfil).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Restricción | Aplica a esta feature | Estado |
|---|---|---|
| I. Persistencia de Datos Local Automática | Sí — orden de arrastre, sincronización de harem, migración | **PASS**: `reorderProfiles`, la sincronización y la migración persisten vía el mismo `ProfileRepository.save()` tras cada cambio. |
| II. Integridad del Output (Orden = Comando) | No — sigue sin existir un generador de comando en el alcance de esta feature | **N/A**, igual que en `001`. |
| III. Rendimiento en Listas Grandes (200+) | Parcialmente — el harem de personajes (200+) no se toca en esta feature; la lista de perfiles en sí es de escala mucho menor | **PASS**: `@dnd-kit` solo re-renderiza los ítems afectados durante el arrastre; `ProfileCard` sigue memoizable igual que antes. No se introduce ningún cambio al renderizado de `CharacterCard`/`HaremView`. |
| IV. Simplicidad del Stack (Client-Only) | Sí | **PASS con una dependencia nueva justificada**: `@dnd-kit` (ver Complexity Tracking). Sin backend, sin librería de ruteo, sin librería de modal externa (se reutiliza/generaliza el patrón ya existente). |
| V. Diseño Responsive y Touch-First | Sí — header, modal y drag-and-drop | **PASS**: `@dnd-kit` soporta touch nativamente (`TouchSensor`); el modal y el header se validan en viewport móvil (`quickstart.md`, Escenario 7). |
| VI. Confiabilidad del Copiado al Portapapeles | No | **N/A**, igual que en `001`. |
| VII. Componentes Pequeños de Responsabilidad Única (+ convención) | Sí — `Header`, `Modal`, `ProfilesModal`, `ProfileList` son componentes nuevos; `ProfileCard` se extiende | **PASS**: cada uno en su propia carpeta `index.tsx`/`styles.tsx`, sin `React.FC`, interface `I<Nombre>`, `export default` al final — mismo patrón que `001`. |
| Restricciones Técnicas (stack fijo, capas DDD + `shared/`, tokens únicos, `domain/` aislado) | Sí | **PASS**: la lógica de migración/sincronización vive en `domain/` como funciones puras (sin React/styled-components/localStorage); todo estilo nuevo (`Header`, `Modal`, drag handle, efecto de foco de la fila activa) sale de `theme.ts`, incluyendo el nuevo nivel `zIndex.nestedDialog` (ver `data-model.md`). |

Única violación a justificar: la dependencia nueva `@dnd-kit` — ver Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-header-profile-modal/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/             # Phase 1 output
│   ├── sync-harem.md
│   ├── migrate-legacy-profiles.md
│   ├── url-profile-param.md
│   ├── profiles-context.md
│   └── header-modal-ui.md
└── tasks.md               # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── profile/
│   │   ├── Profile.ts                 # + campo `order`, `id`/`alias` (edita el archivo existente)
│   │   └── migrateLegacyProfiles.ts   # nuevo
│   ├── harem/
│   │   ├── Harem.ts                   # + countCharacters, sumKakera (edita el existente)
│   │   └── syncHarem.ts               # nuevo
│   └── parsing/parseHaremMessage.ts   # sin cambios
│
├── application/
│   ├── ports/ProfileRepository.ts     # sin cambios de forma
│   └── useCases/
│       ├── createProfileFromPaste.ts  # editado: rama crear-o-sincronizar
│       ├── activateProfile.ts         # sin cambios de forma
│       ├── deleteProfile.ts           # sin cambios de forma
│       ├── renameProfile.ts           # editado: opera sobre `alias`
│       └── reorderProfiles.ts         # nuevo
│
├── infrastructure/
│   └── storage/
│       └── LocalStorageProfileRepository.ts  # editado: aplica migrateLegacyProfiles en getAll()
│
├── presentation/
│   ├── urlParams.ts                   # nuevo: getProfileIdFromUrl / buildProfileUrl
│   ├── App.tsx                        # editado: monta Header, ya no renderiza la lista inline
│   ├── GlobalStyle.tsx                # sin cambios (o ajuste menor si hiciera falta)
│   ├── context/
│   │   └── ProfilesContext.tsx        # editado: +reorderProfiles, +urlProfileStatus, orden por `order`
│   └── components/
│       ├── Header/                    # nuevo
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── Modal/                     # nuevo (genérico, reutilizable)
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── ProfilesModal/             # nuevo
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── ProfileList/               # nuevo (reemplaza a ProfileSwitcher; envuelve DndContext)
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── ProfileCard/               # editado: + characterCount/totalKakera/onOpenInNewTab/drag handle
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── ConfirmDeleteProfileDialog/  # editado: se apoya en Modal, usa zIndex.nestedDialog
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── PasteHaremScreen/          # sin cambios de fondo (se reutiliza dentro de ProfilesModal)
│       ├── HaremView/, SeriesGroup/, CharacterCard/  # sin cambios
│       └── ProfileSwitcher/           # se elimina (reemplazado por ProfileList + ProfilesModal)
│
└── shared/
    └── theme.ts                       # editado: + zIndex.modal / zIndex.nestedDialog, renumera dropdown/toast

tests/
├── unit/
│   ├── domain/
│   │   ├── migrateLegacyProfiles.test.ts   # nuevo
│   │   ├── syncHarem.test.ts               # nuevo
│   │   └── harem.test.ts                   # + tests de countCharacters/sumKakera
│   └── application/
│       ├── createProfileFromPaste.test.ts  # + casos de sincronización
│       └── reorderProfiles.test.ts         # nuevo
├── infrastructure/
│   └── LocalStorageProfileRepository.test.ts  # + test de migración transparente
└── component/presentation/
    ├── Header.test.tsx                     # nuevo
    ├── ProfilesModal.test.tsx              # nuevo (incluye drag-and-drop)
    └── UrlProfileParam.test.tsx            # nuevo
```

**Structure Decision**: se mantiene el mismo monolito modular DDD de
`001` (`domain/application/infrastructure/presentation` + `shared/`).
Ningún archivo de `domain/`/`application/` nuevo depende de React,
`styled-components`, `localStorage` ni de `window` — `urlParams.ts`
(que sí toca `window.location`) vive en `presentation/`, no en
`domain/`, precisamente para mantener ese aislamiento. `ProfileSwitcher`
se da de baja porque su responsabilidad pasa a `ProfileList` (dentro del
modal) — no queda una carpeta de componente sin usar.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Nueva dependencia: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | El reordenamiento de la lista de perfiles por drag-and-drop (FR-008) es un requisito explícito, y la constitución exige que cualquier librería de drag-and-drop adoptada soporte mouse y touch (Restricciones Técnicas) | Implementar drag-and-drop a mano sobre la API nativa HTML5 no soporta touch sin polyfills adicionales, violando ese requisito directamente; hacerlo a mano con eventos de puntero desde cero reimplementaría (peor y sin mantenimiento) lo que una librería madura ya resuelve de forma accesible |
