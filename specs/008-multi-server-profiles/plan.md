# Implementation Plan: Servidores Múltiples por Usuario (Reestructura de Perfiles)

**Branch**: `008-multi-server-profiles` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-multi-server-profiles/spec.md`

## Summary

Se introduce `Server` como entidad nueva de nivel superior (nombre +
lista ordenada de ids de perfiles), persistida aparte de `Profile[]` en
su propia clave de `localStorage`. El alta de perfil pasa de un solo
paso ("pegar → crear") a dos: pegar (se valida el formato sin persistir
nada) → elegir/crear servidor (nuevo modal, con opción de eliminar
servidores existentes) → recién ahí se persiste el perfil, asociado a
ese servidor. La identidad de un perfil deja de ser "un nombre de
usuario globalmente único" y pasa a ser un `id` interno estable
(UUID) + un `serverId` fijo, con el nombre de usuario extraído del
pegado guardado aparte (`username`) para decidir crear-vs-sincronizar y
detectar discordancias en "actualizar harem" — permitiendo que el mismo
nombre de usuario tenga harems independientes en servidores distintos
(FR-007). La lista de perfiles pasa a ser un acordeón de dos niveles
(servidor → perfiles), ambos reordenables por arrastre.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (sin cambios)

**Primary Dependencies**: React 19.2, `styled-components` 6.5,
`lucide-react` 1.44, `@dnd-kit/core`/`sortable`/`utilities` (todas ya
instaladas) — sin dependencias nuevas.

**Storage**: `localStorage`, nueva clave `mymudae:serverList` (además de
la ya existente `mymudae:profiles`) — mismo mecanismo client-only ya
usado para perfiles, un repositorio nuevo (`ServerRepository`) que
replica exactamente el mismo contrato "leer todo/guardar todo" ya
establecido.

**Testing**: Vitest 5 + `@testing-library/react` 16 + `jsdom` (sin
cambios)

**Target Platform**: SPA client-only, desktop y mobile (touch)

**Project Type**: Aplicación web de una sola página (monolito modular
DDD ya establecido)

**Performance Goals**: sin objetivo nuevo — esta feature opera sobre la
cantidad de servidores/perfiles de un usuario (típicamente decenas, no
cientos), muy por debajo del umbral de 200+ que motiva el Principio III
para personajes; no aplica virtualización ni memoización especial más
allá de lo que ya usan `ProfileList`/`ProfileCard`.

**Constraints**:
- No hay perfiles/servidores preexistentes que migrar (confirmado por el
  usuario) — se puede reestructurar el shape de `Profile` sin ninguna
  estrategia de compatibilidad hacia atrás para datos reales. El shim de
  migración 001→002 (`migrateLegacyProfiles`) queda igualmente sin
  ningún dato real que migrar; se elimina como parte de esta limpieza
  (ver research.md).
- El formato de texto de harem, `parseHaremMessage`, `syncHarem` y todo
  lo que ya funciona sobre un `Harem`/`Character`/`Series` NO cambia.
- "Perfil activo" sigue siendo un único concepto global (Assumptions de
  `spec.md`) — no hay una noción de "perfil activo por servidor".

**Scale/Scope**: reestructura de todo el subsistema de gestión de
perfiles (`domain/profile/`, casos de uso de perfil, `ProfilesContext`,
`ProfilesModal`/`ProfileList`/`ProfileCard` y el flujo de alta); no
toca `HaremView`, `CharacterCard`, ni ninguna otra feature ya construida
sobre el harem de un perfil ya activo (004, 005 solo se ajustan en su
lógica interna de identidad, no en su UI).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Persistencia Local Automática | Tanto `Server[]` como `Profile[]` se siguen persistiendo automáticamente en cada mutación (crear, eliminar, reordenar), sin ninguna acción explícita de "guardar" — mismo mecanismo ya vigente, extendido a la nueva colección. | PASS |
| II. Integridad del Output | No aplica: esta feature no genera ningún comando/texto para copiar. | PASS (N/A) |
| III. Rendimiento en Listas Grandes | La cantidad de servidores/perfiles de un usuario está muy por debajo del umbral de 200+ personajes que motiva este principio; se reutiliza el mismo patrón de `@dnd-kit` con `DndContext` por nivel ya validado en `002`/`003`, sin necesidad de virtualización nueva. | PASS |
| IV. Simplicidad del Stack | Sin dependencias nuevas. Se agrega un segundo repositorio (`ServerRepository`) en vez de forzar `Server[]` dentro de `ProfileRepository` — mismo patrón "un repositorio por colección persistida de nivel superior" ya establecido, no una capa nueva de complejidad. | PASS |
| V. Diseño Responsive y Touch-First | El nuevo modal de servidor (input + radio buttons + eliminar) y el acordeón de dos niveles con drag-and-drop deben funcionar completamente por touch; se valida manualmente en `quickstart.md`, reutilizando los mismos patrones táctiles ya probados (`Modal`, manijas con `touch-action: none`). | PASS (a validar en Fase de implementación/QA) |
| VI. Confiabilidad del Copiado al Portapapeles | No aplica: esta feature no agrega ninguna acción de copiar al portapapeles (el pegado de harem ya existente no cambia su mecanismo). | PASS (N/A) |
| VII. Componentes Pequeños de Responsabilidad Única | Componentes nuevos chicos y de responsabilidad única (`ServerPickerModal`, `ConfirmDeleteServerDialog`, `ServerList`, `ServerListItem`), cada uno en su carpeta `index.tsx`+`styles.tsx`; `ProfileList`/`ProfileListItem`/`ProfileCard` se reutilizan tal cual, parametrizados por servidor en vez de reescribirse. | PASS (por diseño) |

No hay violaciones que requieran justificación → no aplica la sección
"Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/008-multi-server-profiles/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   ├── server-domain.md
│   ├── create-profile-with-server.md
│   ├── delete-server.md
│   └── server-list-ui.md
└── tasks.md              # Fase 2 (/speckit-tasks — NO se crea acá)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── server/
│   │   └── Server.ts                          # NUEVO — entidad + funciones puras
│   └── profile/
│       ├── Profile.ts                          # MODIFICADO — id vuelve a ser UUID; +serverId, +username; -order; removeProfile se simplifica
│       └── migrateLegacyProfiles.ts             # ELIMINADO — sin datos reales que migrar (ver research.md)
├── application/
│   ├── ports/
│   │   ├── ProfileRepository.ts                # (sin cambios de contrato)
│   │   └── ServerRepository.ts                 # NUEVO
│   └── useCases/
│       ├── createProfileFromPaste.ts            # ELIMINADO — reemplazado por createProfileWithServer
│       ├── createProfileWithServer.ts           # NUEVO
│       ├── deleteProfile.ts                     # MODIFICADO — ahora también actualiza ServerRepository
│       ├── deleteServer.ts                      # NUEVO — elimina servidor + sus perfiles (cascada)
│       ├── reorderProfiles.ts                   # ELIMINADO — reemplazado por reorderProfilesInServer
│       ├── reorderProfilesInServer.ts           # NUEVO
│       ├── reorderServers.ts                    # NUEVO
│       └── updateActiveProfileHarem.ts          # MODIFICADO — compara contra `target.username`, no contra `activeProfileId`
├── infrastructure/
│   └── storage/
│       └── LocalStorageServerRepository.ts      # NUEVO — mismo patrón defensivo que LocalStorageProfileRepository
└── presentation/
    ├── context/
    │   └── ProfilesContext.tsx                  # MODIFICADO — expone servers[], createProfileWithServer, deleteServer, reorderServers, reorderProfilesInServer
    └── components/
        ├── PasteHaremScreen/                    # MODIFICADO — solo valida formato (parseHaremMessage), abre ServerPickerModal en vez de crear directo
        ├── ServerPickerModal/                   # NUEVO — input de servidor nuevo + radio buttons de existentes + eliminar
        ├── ConfirmDeleteServerDialog/            # NUEVO — advertencia con lista de perfiles afectados (scroll, 300px, ancho completo)
        ├── ServerList/                           # NUEVO — nivel superior del acordeón, reemplaza a ProfileList dentro de ProfilesModal
        ├── ServerListItem/                       # NUEVO — fila de servidor sortable + acordeón que monta ProfileList adentro
        ├── ProfileList/                          # MODIFICADO — recibe `profiles`/`serverId` por props en vez de leer todos los perfiles del contexto
        ├── ProfileListItem/                      # (sin cambios)
        ├── ProfileCard/                          # (sin cambios)
        └── ProfilesModal/                        # MODIFICADO — monta ServerList en vez de ProfileList directamente

tests/
├── unit/domain/
│   └── server.test.ts                           # NUEVO
├── unit/application/
│   ├── createProfileWithServer.test.ts          # NUEVO
│   ├── deleteServer.test.ts                     # NUEVO
│   ├── deleteProfile.test.ts                    # MODIFICADO
│   ├── reorderServers.test.ts                   # NUEVO
│   ├── reorderProfilesInServer.test.ts          # NUEVO
│   └── updateActiveProfileHarem.test.ts         # MODIFICADO
├── infrastructure/
│   └── LocalStorageServerRepository.test.ts     # NUEVO
├── support/
│   └── InMemoryServerRepository.ts              # NUEVO — mismo patrón que InMemoryProfileRepository
└── component/presentation/
    ├── ServerPickerModal.test.tsx               # NUEVO
    ├── ServerList.dragdrop.test.tsx             # NUEVO
    └── ProfilesFlow.test.tsx                     # MODIFICADO (flujo integrado ya existente)
```

**Structure Decision**: se mantiene la arquitectura de monolito modular
DDD ya vigente. `domain/server/` es un módulo hermano de `domain/
profile/` y `domain/harem/`, con el mismo estilo de funciones puras
tolerantes (`reorderX`, `removeX`) ya establecido en `Profile.ts`/
`Harem.ts`. Se elimina deliberadamente el shim de migración 001→002
(`migrateLegacyProfiles`) al no haber ningún dato real que preservar —
ver research.md para el detalle de esa decisión.

## Complexity Tracking

*No aplica — el Constitution Check no encontró violaciones que requieran
justificación.*
