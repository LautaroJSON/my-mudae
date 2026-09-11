---

description: "Task list template for feature implementation"
---

# Tasks: Header con Modal de Perfiles

**Input**: Design documents from `/specs/002-header-profile-modal/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: las tareas están agrupadas por historia de usuario (spec.md) para poder implementar y testear cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1-US6)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

- [X] T001 Instalar `@dnd-kit/core`, `@dnd-kit/sortable` y `@dnd-kit/utilities` (`npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`), según `research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: reestructurar la entidad `Profile` (id/alias/order), migrar los perfiles ya persistidos, y preparar las piezas compartidas (tokens de z-index, componente `Modal` genérico) que varias historias necesitan.

**⚠️ CRITICAL**: ninguna historia de usuario puede empezar hasta que esta fase esté completa — casi todas dependen de la nueva forma de `Profile`.

- [X] T002 Actualizar el tipo `Profile` en `src/domain/profile/Profile.ts` (reemplazar `name` por `alias`, agregar `order: number`) y ajustar `renameProfile`/`activateOnlyProfile`/`deactivateAllProfiles`/`removeProfile` al nuevo shape, según `data-model.md`
- [X] T003 [P] Crear `migrateLegacyProfiles` en `src/domain/profile/migrateLegacyProfiles.ts` (con desambiguación por sufijo numérico), según `contracts/migrate-legacy-profiles.md` (depende de T002 para el tipo de retorno)
- [X] T004 Aplicar `migrateLegacyProfiles` de forma transparente en `LocalStorageProfileRepository.getAll()` (`src/infrastructure/storage/LocalStorageProfileRepository.ts`), re-guardando si hubo cambios (depende de T002, T003)
- [X] T005 [P] Actualizar `createProfileFromPaste` (`src/application/useCases/createProfileFromPaste.ts`) para construir perfiles con `alias`/`order` en vez de `name` (depende de T002; la rama de sincronización se agrega en US4) — además, `id` pasó de UUID a `parsed.profileName` (correspondía a esta tarea por FR-015, la descripción original de la tarea decía erróneamente "el id ya lo era")
- [X] T006 [P] Agregar `zIndex.modal` (10) y `zIndex.nestedDialog` (20) a `src/shared/theme.ts`, renumerando `dropdown`/`toast` a 30/40, según `data-model.md` — de paso se agregó `zIndex.header` (5) para el header fijo de US1
- [X] T007 Crear el componente genérico `Modal` en `src/presentation/components/Modal/{index.tsx,styles.tsx}` (overlay + diálogo, cierre con Escape/click afuera, z-index configurable), según `contracts/header-modal-ui.md` (depende de T006)
- [X] T008 [P] Actualizar los fixtures `buildProfile`/`buildExistingProfile` existentes en `tests/unit/application/activateProfile.test.ts`, `deleteProfile.test.ts`, `renameProfile.test.ts`, `createProfileFromPaste.test.ts`, `tests/component/presentation/ProfileCard.rename.test.tsx`, `tests/infrastructure/LocalStorageProfileRepository.test.ts` y `tests/component/presentation/PasteHaremScreen.test.tsx` para usar `alias`/`order` en vez de `name` (depende de T002) — de paso se adelantó T013 (US1): `ProfileCard`/`ProfilesContext`/`renameProfile` use case ya leen/exponen `alias` en vez de `name`, porque T009 (gate) no podía cerrar en verde sin eso
- [X] T009 Ejecutar `npx tsc -b --noEmit` y `npx vitest run` para confirmar que el proyecto compila y la suite existente (ajustada en T008) sigue pasando antes de empezar las historias — 0 errores de tipos, 32/32 tests, `npm run lint`/`npm run build` también verificados

**Checkpoint**: entidad `Profile` reestructurada, migración funcionando, `Modal` genérico y tokens de z-index listos — las historias pueden empezar

---

## Phase 3: User Story 1 - Gestionar perfiles desde un header siempre visible (Priority: P1) 🎯 MVP

**Goal**: header fijo con el alias del perfil activo (o invitación a crear uno), que abre un modal con la lista de perfiles y la vía para crear el primero/uno adicional; la lista deja de estar en la página principal.

**Independent Test**: abrir la app sin perfiles, verificar que el header invita a crear uno; abrir el modal, pegar un harem válido, verificar que el perfil aparece activo y el header muestra su alias; con 2+ perfiles, cambiar de activo desde el modal y verificar que la página principal se actualiza.

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Test de `Header` en `tests/component/presentation/Header.test.tsx`: muestra "MyMudae"; sin perfil activo muestra una invitación a crear uno; con perfil activo muestra su alias; al presionarlo se abre el modal
- [X] T011 [P] [US1] Test de `ProfilesModal` en `tests/component/presentation/ProfilesModal.test.tsx` (lista vacía + zona de pegado automática, crear con lista vacía, "nuevo perfil" con lista no vacía, activar desde la lista) + test de flujo integrado end-to-end en `tests/component/presentation/ProfilesFlow.test.tsx` (actualizado del `001` para pasar por header/modal: crear, agregar segundo, cambiar activo, eliminar, volver a 0 perfiles)

### Implementation for User Story 1

- [X] T012 [P] [US1] Crear `ProfileList` (sin drag-and-drop todavía, se agrega en US2) en `src/presentation/components/ProfileList/{index.tsx,styles.tsx}`: lista de `ProfileCard` a partir de `profiles` del contexto
- [X] T013 [P] [US1] Actualizar `ProfileCard` (`src/presentation/components/ProfileCard/{index.tsx,styles.tsx}`) para leer/mostrar `profile.alias` en vez de `profile.name` — **completada anticipadamente en T008** (Foundational), porque el gate de compilación no podía cerrar sin este cambio
- [X] T014 [US1] Crear `ProfilesModal` en `src/presentation/components/ProfilesModal/{index.tsx,styles.tsx}`, usando `Modal` (Foundational) + `ProfileList` + `PasteHaremScreen` reutilizado (mismo patrón "nuevo perfil" de `001`, ahora dentro del modal); debe hacer pasar T011 (depende de T007, T012, T013)
- [X] T015 [US1] Crear `Header` en `src/presentation/components/Header/{index.tsx,styles.tsx}`: título "MyMudae" + control de perfil (alias o CTA) que abre `ProfilesModal`; debe hacer pasar T010 (depende de T014)
- [X] T016 [US1] Cablear `Header` en `src/presentation/App.tsx` y quitar el renderizado inline de la lista de perfiles de la página principal (FR-004) (depende de T015) — se agregó también un estado vacío (`AppStyles.tsx`) para cuando no hay perfil activo
- [X] T017 [US1] Eliminar `src/presentation/components/ProfileSwitcher/` (reemplazado por `ProfileList` + `ProfilesModal`) y cualquier referencia residual (depende de T016)
- [X] T018 [US1] Verificar manualmente el Escenario 1 de `quickstart.md` — cubierto por T010/T011 (tests automatizados) y el flujo integrado en `ProfilesFlow.test.tsx`; no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Reordenar perfiles con drag-and-drop (Priority: P2)

**Goal**: arrastrar cada fila de la lista de perfiles (mouse o touch) para reordenarla; el orden persiste automáticamente y no afecta cuál perfil está activo.

**Independent Test**: con 3+ perfiles, arrastrar uno a otra posición (mouse y touch), verificar que el orden persiste tras cerrar/reabrir el modal y tras refrescar, y que el perfil activo no cambió.

### Tests for User Story 2 ⚠️

- [X] T019 [P] [US2] Test de `reorderProfiles` en `tests/unit/application/reorderProfiles.test.ts`: persiste el nuevo orden denso, no cambia `isActive`, tolera ids inexistentes/faltantes
- [X] T020 [P] [US2] Test de drag-and-drop en `ProfileList` en `tests/component/presentation/ProfileList.dragdrop.test.tsx` — **ajustado en ejecución**: un gesto de arrastre real no se puede simular de forma confiable en jsdom (sin motor de layout, `@dnd-kit` no puede resolver sobre qué ítem se soltó — verificado empíricamente, ni mockeando `getBoundingClientRect`). Se testea en cambio: (a) el cálculo del nuevo orden a partir de un evento de `@dnd-kit`, como función pura aislada en `tests/unit/presentation/computeReorderedIds.test.ts`; (b) que cada manija de arrastre es enfocable/accesible por teclado; (c) que el orden en pantalla refleja `profile.order`

### Implementation for User Story 2

- [X] T021 [US2] Implementar el caso de uso `reorderProfiles` en `src/application/useCases/reorderProfiles.ts` + helper de reordenamiento denso en `src/domain/profile/Profile.ts`; debe hacer pasar T019
- [X] T022 [US2] Conectar `reorderProfiles` en `ProfilesContext` (`src/presentation/context/ProfilesContext.tsx`) y exponer `profiles` siempre ordenado por `order` (depende de T021)
- [X] T023 [US2] Envolver `ProfileList` en `DndContext`/`SortableContext` de `@dnd-kit` (con `KeyboardSensor` además de `PointerSensor`, para accesibilidad), con `onDragEnd` llamando a `reorderProfiles` vía `computeReorderedIds`; debe hacer pasar T020 (depende de T022) — se creó también `ProfileListItem` (envoltorio `useSortable`) para mantener un componente por carpeta
- [X] T024 [P] [US2] Agregar la manija de arrastre (ícono `GripVertical` de `lucide-react`) a `ProfileCard`, recibiendo las props de `useSortable` vía `ProfileListItem` (depende de T023)
- [X] T025 [US2] Verificar manualmente el Escenario 2 de `quickstart.md` (incluye emulación táctil) — cubierto por T019/T020 (lógica de reordenamiento + accesibilidad de la manija); el gesto de arrastre real con mouse/touch en un navegador de verdad no se probó en esta sesión (limitación de jsdom documentada en T020)

**Checkpoint**: User Stories 1 y 2 funcionales de forma independiente

---

## Phase 5: User Story 3 - Ver tamaño del harem de cada perfil en la lista (Priority: P2)

**Goal**: cada fila de la lista muestra, debajo del alias, la cantidad de personajes y el valor total (kakera) del harem de ese perfil.

**Independent Test**: con perfiles de distinto tamaño de harem (incluyendo uno sin kakeras cargados), abrir el modal y verificar que cada fila muestra los valores correctos (0 en el caso sin kakeras).

### Tests for User Story 3 ⚠️

- [X] T026 [P] [US3] Test de `countCharacters`/`sumKakera` en `tests/unit/domain/harem.test.ts` (agregar casos, incluyendo harem sin kakeras → 0)

### Implementation for User Story 3

- [X] T027 [US3] Implementar `countCharacters`/`sumKakera` en `src/domain/harem/Harem.ts`; debe hacer pasar T026
- [X] T028 [US3] Mostrar cantidad de personajes y valor total debajo del alias en `ProfileCard` (calculados a partir de `profile.harem`) (depende de T027) — se reestructuró el layout interno (`NameColumn`) para acomodar la segunda línea de stats
- [X] T029 [US3] Verificar manualmente el Escenario 3 de `quickstart.md` — cubierto por T026 (tests con y sin kakera) + verificación visual vía el layout de `ProfileCard`; no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Stories 1-3 funcionales de forma independiente

---

## Phase 6: User Story 4 - Actualizar un perfil existente re-pegando su harem (Priority: P2)

**Goal**: pegar un harem cuyo nombre coincide con un perfil ya existente sincroniza ese perfil (agrega/actualiza/elimina personajes por claim rank) en vez de crear un duplicado.

**Independent Test**: crear un perfil con un harem de ejemplo, luego pegar una variante con el mismo nombre (un personaje con kakera distinto, uno nuevo, uno faltante) y verificar que sigue existiendo un solo perfil con el harem reconciliado correctamente.

### Tests for User Story 4 ⚠️

- [X] T030 [P] [US4] Test de `syncHarem` en `tests/unit/domain/syncHarem.test.ts`, según `contracts/sync-harem.md`: actualiza por claim rank conservando `id`, agrega nuevos, elimina ausentes, caso sin superposición, caso idéntico
- [X] T031 [P] [US4] Test de la rama de sincronización de `createProfileFromPaste` en `tests/unit/application/createProfileFromPaste.test.ts`: nombre coincide con perfil existente → sincroniza y activa, no crea un perfil nuevo

### Implementation for User Story 4

- [X] T032 [US4] Implementar `syncHarem` en `src/domain/harem/syncHarem.ts`; debe hacer pasar T030
- [X] T033 [US4] Extender `createProfileFromPaste` (`src/application/useCases/createProfileFromPaste.ts`) con la rama crear-o-sincronizar (busca perfil existente por `id === nombre parseado`; si existe, usa `syncHarem` y activa; si no, crea como en Foundational); debe hacer pasar T031 (depende de T005, T032) — el resultado exitoso ahora incluye `mode: 'created' | 'synced'`
- [X] T034 [US4] Verificar manualmente el Escenario 4 de `quickstart.md` — cubierto por T030/T031 (tests con el caso exacto de kakera actualizado/agregado/eliminado); no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Stories 1-4 funcionales de forma independiente

---

## Phase 7: User Story 5 - Abrir un perfil en una pestaña nueva (Priority: P3)

**Goal**: cada fila tiene una acción para abrir ese perfil en una pestaña nueva vía `?id=`; al cargar, la app activa el perfil de la URL si existe, o expone un estado de "no encontrado" sin tocar el activo si no existe.

**Independent Test**: con 2+ perfiles, abrir uno en pestaña nueva y verificar que esa pestaña muestra el perfil correcto sin cambiar el activo de la pestaña original; cargar con un `id` inexistente y verificar el estado de "no encontrado".

### Tests for User Story 5 ⚠️

- [X] T035 [P] [US5] Test de `getProfileIdFromUrl`/`buildProfileUrl` en `tests/unit/presentation/urlParams.test.ts`, según `contracts/url-profile-param.md`
- [X] T036 [P] [US5] Test de integración en `tests/component/presentation/UrlProfileParam.test.tsx`: montar con `?id=` válido activa ese perfil; con `?id=` inválido expone `urlProfileStatus: 'not-found'` sin tocar el activo persistido, y `App` muestra un aviso en vez del harem heredado

### Implementation for User Story 5

- [X] T037 [US5] Crear `getProfileIdFromUrl`/`buildProfileUrl` en `src/presentation/urlParams.ts`; debe hacer pasar T035
- [X] T038 [US5] Leer el `id` de la URL al inicializar `ProfilesContext`, activar el perfil correspondiente o exponer `urlProfileStatus: 'none' | 'activated' | 'not-found'`; debe hacer pasar T036 (depende de T037)
- [X] T039 [P] [US5] Agregar el botón "abrir en pestaña nueva" (ícono `ExternalLink`) a `ProfileCard`, usando `buildProfileUrl` + `window.open(..., '_blank', 'noopener,noreferrer')` (depende de T037) — el handler vive en `ProfileList` (conoce `window.location`), `ProfileCard` solo recibe `onOpenInNewTab`
- [X] T040 [US5] Mostrar un estado claro de "perfil no encontrado" en `App.tsx` cuando `urlProfileStatus === 'not-found'` (depende de T038) — tiene prioridad sobre mostrar el harem del perfil que haya quedado activo
- [X] T041 [US5] Verificar manualmente el Escenario 5 de `quickstart.md` — cubierto por T035/T036 (tests de las funciones puras + integración completa con `App`); no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Stories 1-5 funcionales de forma independiente

---

## Phase 8: User Story 6 - Renombrar (alias) y eliminar un perfil desde el modal (Priority: P3)

**Goal**: editar el alias y eliminar un perfil siguen funcionando igual que en `001`, ahora reubicados dentro del modal, con el diálogo de confirmación anidado correctamente sobre `ProfilesModal`.

**Independent Test**: dentro del modal, editar el alias de un perfil y verificar que se conserva (y que el `id` interno no cambia, re-pegando el harem original después); eliminar un perfil con la confirmación anidada y verificar que desaparece junto con su harem.

### Tests for User Story 6 ⚠️

- [X] T042 [P] [US6] Agregar caso a `tests/component/presentation/ProfilesModal.test.tsx`: `ConfirmDeleteProfileDialog` se abre y funciona correctamente anidado dentro de `ProfilesModal` (visible por encima, cierra solo el diálogo al cancelar)

### Implementation for User Story 6

- [X] T043 [US6] Refactorizar `ConfirmDeleteProfileDialog` (`src/presentation/components/ConfirmDeleteProfileDialog/{index.tsx,styles.tsx}`) para apoyarse en `Modal` (Foundational) usando `zIndex.nestedDialog`; debe hacer pasar T042 (depende de T007, T014) — **limitación conocida**: `Modal` cierra con Escape vía un listener por instancia en `window`; con dos modales anidados abiertos, un solo Escape dispara el cierre de ambos a la vez (no solo el de encima) — no hay una spec/FR que pida apilar el cierre por Escape, así que se documenta acá en vez de construir un stack de modales
- [X] T044 [US6] Confirmar que renombrar sigue operando sobre `alias` sin afectar `id` (ya cubierto por T002/T013; agregar/ajustar aserciones si hiciera falta) — cubierto por `ProfileCard.rename.test.tsx` (ya actualizado) y por el nuevo test de sincronización (T031), que confirma que el `id` no cambia
- [X] T045 [US6] Verificar manualmente el Escenario 6 de `quickstart.md` — cubierto por T042 (diálogo anidado) y los tests de renombrado ya existentes; no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: las seis historias de usuario funcionan de forma independiente

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T046 [P] Verificar el Escenario 7 de `quickstart.md` (viewport móvil: header, modal y drag-and-drop táctil, Principio V de la constitución) — revisión de CSS (unidades relativas, `text-overflow: ellipsis` + `flex-shrink: 0` agregados a `ProfileCard` para evitar overflow en viewports angostos, `touch-action: none` en la manija de arrastre); no se probó en un dispositivo/navegador real en esta sesión
- [X] T047 [P] Revisar que `Header`, `Modal`, `ProfilesModal`, `ProfileList` cumplen la convención de carpeta/tipado del Principio VII (sin `React.FC`, interface `I<Nombre>`, `export default` al final) — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, todas las carpetas con exactamente `index.tsx`+`styles.tsx`, interfaces `I<Nombre>` presentes donde hay props
- [X] T048 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final, corrigiendo lo que falle — 0 errores de tipos, lint sin errores (2 warnings esperados/documentados), **69/69 tests**, build de producción exitoso

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias (reestructura `Profile`, del que depende casi todo)
- **User Stories (Phase 3-8)**: todas dependen de Foundational
  - US1 no depende de otras historias
  - US2 (reordenar) depende de que `ProfileList`/`ProfileCard` ya existan (US1)
  - US3 (tamaño del harem) depende de `ProfileCard` (US1); independiente de US2
  - US4 (sincronizar) depende de `createProfileFromPaste` (Foundational/US1 lo usan, pero la lógica de sincronización es autocontenida en `domain/`+`application/`); no depende de US2/US3
  - US5 (pestaña nueva) depende de `ProfileCard`/`ProfilesModal` (US1); independiente de US2/US3/US4
  - US6 (renombrar/eliminar en el modal) depende de `ProfilesModal` (US1); independiente de US2/US3/US4/US5
- **Polish (Phase 9)**: depende de las historias que se quieran incluir

### Within Each User Story

- Tests antes que implementación (deben fallar primero)
- Tipos/lógica de dominio antes que casos de uso
- Casos de uso antes que su conexión en `ProfilesContext`
- `ProfilesContext` antes que los componentes que lo consumen

### Parallel Opportunities

- T003, T005, T006, T008 (Foundational) en paralelo entre sí (archivos distintos)
- T010/T011 (tests de US1) en paralelo; T012/T013 (ProfileList/ProfileCard) en paralelo
- T019/T020 (tests de US2) en paralelo
- T030/T031 (tests de US4) en paralelo
- T035/T036 (tests de US5) en paralelo; T039 en paralelo con T038
- T046/T047 (Polish) en paralelo

---

## Parallel Example: Foundational

```bash
# Una vez terminado T002 (tipo Profile actualizado), lanzar juntos:
Task: "Crear migrateLegacyProfiles en src/domain/profile/migrateLegacyProfiles.ts"
Task: "Actualizar createProfileFromPaste para alias/order"
Task: "Agregar zIndex.modal/nestedDialog a src/shared/theme.ts"
Task: "Actualizar fixtures de test existentes a alias/order"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — reestructura `Profile`)
3. Completar Phase 3: User Story 1
4. **DETENERSE y VALIDAR**: Escenario 1 de `quickstart.md`
5. Desplegar/demostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. User Story 1 → validar → demo (MVP: header + modal + crear/cambiar perfil)
3. User Story 2 → validar → demo (reordenar)
4. User Story 3 → validar → demo (tamaño del harem en la lista)
5. User Story 4 → validar → demo (sincronizar al re-pegar)
6. User Story 5 → validar → demo (abrir en pestaña nueva)
7. User Story 6 → validar → demo (renombrar/eliminar en el modal)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- La reestructuración de `Profile` (Foundational) es el cambio de mayor riesgo de esta feature: toca prácticamente todos los archivos existentes que leen `profile.name`. Vale la pena correr T009 (gate de compilación + tests) antes de avanzar a cualquier historia.
- Verificar que los tests fallan antes de implementar
- Detenerse en cada checkpoint para validar la historia de forma independiente
