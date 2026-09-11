---

description: "Task list template for feature implementation"
---

# Tasks: Perfiles Múltiples con Harem Propio

**Input**: Design documents from `/specs/001-multi-profile-harems/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing (Vitest + React Testing Library) y describe explícitamente qué debe testear cada contrato, así que las tareas de test de abajo SÍ están incluidas (no son opcionales para esta feature).

**Organization**: las tareas están agrupadas por historia de usuario (spec.md) para poder implementar y testear cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Proyecto único (client-only), según `plan.md`: `src/{domain,application,infrastructure,presentation}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicialización del proyecto y estructura base

- [X] T001 Crear la estructura de carpetas del proyecto (`src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`, `tests/unit/domain/`, `tests/unit/application/`, `tests/infrastructure/`, `tests/component/presentation/`, `tests/support/`) según `plan.md`
- [X] T002 Scaffold del proyecto con Vite (plantilla oficial `react-ts`) en la raíz del repo — instaló React 19.2 + TypeScript ~6.0 sobre Vite 8.3 (ver `research.md`)
- [X] T003 [P] Instalar y configurar `styled-components` como dependencia del proyecto (sin `@types/styled-components`: la v6 ya trae sus propios tipos, ver `research.md`)
- [X] T004 [P] Instalar y configurar `lucide-react` como dependencia del proyecto
- [X] T005 [P] Instalar y configurar Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` + `jsdom`, agregando el bloque `test` a `vite.config.ts` y `tests/setup.ts` (ver `research.md`)
- [X] T006 [P] Verificar el linter `oxlint` (ya incluido por la plantilla oficial, `.oxlintrc.json` + script `npm run lint`) cubre React/TS; no se agrega ESLint/Prettier por separado (ver `research.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestructura núcleo que TODAS las historias de usuario necesitan antes de poder implementarse

**⚠️ CRITICAL**: ninguna historia de usuario puede empezar hasta que esta fase esté completa

- [X] T007 [P] Crear el tipo `Profile` (+ helpers `activateProfile`/`deactivateProfile` de dominio) en `src/domain/profile/Profile.ts`, según `data-model.md`
- [X] T008 [P] Crear los tipos `Harem`, `Series` y `Character` (+ helper que elimina una `Series` cuando se queda sin personajes, FR-022) en `src/domain/harem/{Harem.ts,Series.ts,Character.ts}`, según `data-model.md`
- [X] T009 Crear la interfaz `ProfileRepository` en `src/application/ports/ProfileRepository.ts` (depende de T007, T008), según `contracts/profile-repository.md`
- [X] T010 [P] Implementar `LocalStorageProfileRepository` en `src/infrastructure/storage/LocalStorageProfileRepository.ts` (implementa `ProfileRepository` sobre `localStorage`, capturando errores sin propagarlos), según `contracts/profile-repository.md`
- [X] T011 [P] Implementar `InMemoryProfileRepository` (solo para tests) en `tests/support/InMemoryProfileRepository.ts`, según `contracts/profile-repository.md`
- [X] T012 Test de round-trip y manejo de errores de `LocalStorageProfileRepository` en `tests/infrastructure/LocalStorageProfileRepository.test.ts` (depende de T010)
- [X] T013 Crear el esqueleto de `ProfilesContext`/`ProfilesProvider` (estado `profiles`/`activeProfile` cableado a `ProfileRepository`, con las acciones de `contracts/profiles-context.md` como placeholders) en `src/presentation/context/ProfilesContext.tsx` (depende de T009, T010)
- [X] T014 Crear `App.tsx` en `src/presentation/App.tsx` envolviendo la app en `ProfilesProvider`, y `main.tsx` en `src/main.tsx` montando `App` (depende de T013)

**Checkpoint**: infraestructura lista — las historias de usuario pueden empezar

---

## Phase 3: User Story 1 - Crear un perfil pegando el harem de Mudae (Priority: P1) 🎯 MVP

**Goal**: el usuario pega el mensaje privado que le manda Mudae con su harem y la app crea automáticamente un perfil con sus series y personajes ya organizados.

**Independent Test**: arrancar sin perfiles, pegar el mensaje de harem de ejemplo (`quickstart.md`) y verificar que se crea un perfil con nombre, series y personajes correctos; verificar también que un texto sin formato reconocible se rechaza sin crear nada.

### Tests for User Story 1 ⚠️

> Escribir estos tests primero y verificar que fallan antes de implementar

- [X] T015 [P] [US1] Test de `parseHaremMessage` en `tests/unit/domain/parseHaremMessage.test.ts`: el harem de ejemplo completo (perfil `rodoifin`, series y personajes), líneas de ruido ignoradas (`Total value:`, `Imagen`, blancos), personaje sin kakera reconocible, y rechazo de texto sin ninguna línea válida — según `contracts/parse-harem-message.md`
- [X] T016 [P] [US1] Test de `createProfileFromPaste` (con `InMemoryProfileRepository` de T011) en `tests/unit/application/createProfileFromPaste.test.ts`: éxito crea y activa el perfil; falla no persiste nada
- [X] T017 [P] [US1] Test de componente `PasteHaremScreen` en `tests/component/presentation/PasteHaremScreen.test.tsx`: pegar texto válido crea el perfil; pegar texto inválido muestra un error y no crea nada

### Implementation for User Story 1

- [X] T018 [US1] Implementar `parseHaremMessage` en `src/domain/parsing/parseHaremMessage.ts` (regex por línea de encabezado de perfil/serie/personaje, ruido ignorado, kakera opcional — ver `research.md`); debe hacer pasar T015
- [X] T019 [US1] Implementar el caso de uso `createProfileFromPaste` en `src/application/useCases/createProfileFromPaste.ts` (usa `parseHaremMessage` + `ProfileRepository`; en éxito desactiva el perfil activo anterior y activa el nuevo — FR-002, FR-008, FR-014; en falla no persiste nada — FR-007); debe hacer pasar T016
- [X] T020 [US1] Conectar `createProfileFromPaste` en `src/presentation/context/ProfilesContext.tsx`, reemplazando el placeholder de T013
- [X] T021 [P] [US1] Crear el componente `PasteHaremScreen` en `src/presentation/components/PasteHaremScreen/{index.tsx,styles.tsx}` (textarea + botón + mensaje de error, `interface IPasteHaremScreen`, arrow function, `export default`); debe hacer pasar T017
- [X] T022 [P] [US1] Crear el componente `CharacterCard` en `src/presentation/components/CharacterCard/{index.tsx,styles.tsx}` (nombre, imagen, kakera y claim rank opcionales)
- [X] T023 [P] [US1] Crear el componente `SeriesGroup` en `src/presentation/components/SeriesGroup/{index.tsx,styles.tsx}` (nombre de serie + lista de `CharacterCard`)
- [X] T024 [US1] Crear el componente `HaremView` en `src/presentation/components/HaremView/{index.tsx,styles.tsx}` (recibe el harem del perfil activo y lo renderiza agrupado con `SeriesGroup`, memoizando `SeriesGroup`/`CharacterCard` por props para no re-renderizar la lista completa — Principio III de la constitución); depende de T023
- [X] T025 [US1] Cablear en `src/presentation/App.tsx` la decisión: `profiles.length === 0` → `PasteHaremScreen`; si no → `HaremView` del perfil activo (depende de T021, T024)
- [X] T026 [US1] Verificar manualmente el Escenario 1 de `quickstart.md` (crear perfil con el harem de ejemplo real y rechazo de texto inválido) — cubierto por T015-T017 (tests automatizados con el harem real de ejemplo) + `npm run build` sin errores; no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (MVP)

---

## Phase 4: User Story 2 - Cambiar el perfil activo y agregar perfiles adicionales (Priority: P2)

**Goal**: con uno o más perfiles ya creados, el usuario puede elegir cuál está activo/visible y agregar otro perfil pegando un nuevo harem.

**Independent Test**: con un perfil activo, pegar un segundo harem desde la acción "nuevo perfil" y verificar que el recién creado pasa a ser el activo; alternar manualmente cuál perfil está activo; eliminar el activo y verificar que se reactiva otro; eliminar el último y volver a la pantalla de pegado.

### Tests for User Story 2 ⚠️

- [X] T027 [P] [US2] Test de `activateProfile` en `tests/unit/application/activateProfile.test.ts`: a lo sumo un perfil activo a la vez (FR-012, FR-013)
- [X] T028 [P] [US2] Test de `deleteProfile` en `tests/unit/application/deleteProfile.test.ts`: elimina el harem completo en cascada (FR-011); si el eliminado era el activo y quedan otros, activa automáticamente otro (FR-015); si no queda ninguno, ninguno queda activo (FR-010)
- [X] T029 [P] [US2] Test de flujo integrado en `tests/component/presentation/ProfilesFlow.test.tsx`: pegar un segundo harem activa el nuevo perfil; cambiar el activo manualmente; eliminar el activo reactiva otro; eliminar el último vuelve a `PasteHaremScreen`

### Implementation for User Story 2

- [X] T030 [P] [US2] Implementar el caso de uso `activateProfile` en `src/application/useCases/activateProfile.ts`; debe hacer pasar T027
- [X] T031 [P] [US2] Implementar el caso de uso `deleteProfile` en `src/application/useCases/deleteProfile.ts`; debe hacer pasar T028
- [X] T032 [US2] Conectar `activateProfile` y `deleteProfile` en `src/presentation/context/ProfilesContext.tsx` (depende de T030, T031)
- [X] T033 [P] [US2] Crear el componente `ProfileCard` en `src/presentation/components/ProfileCard/{index.tsx,styles.tsx}` (nombre, indicador de activo, acción activar, acción eliminar)
- [X] T034 [US2] Crear el componente `ProfileSwitcher` en `src/presentation/components/ProfileSwitcher/{index.tsx,styles.tsx}` (lista de `ProfileCard` + acción "nuevo perfil" que reabre `PasteHaremScreen`); depende de T033
- [X] T035 [US2] Integrar `ProfileSwitcher` en `src/presentation/App.tsx` cuando `profiles.length > 0` (depende de T025, T034); debe hacer pasar T029
- [X] T036 [US2] Verificar manualmente el Escenario 3 de `quickstart.md` — cubierto por T029 (test integrado que replica el escenario completo); no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: User Stories 1 y 2 funcionales de forma independiente

---

## Phase 5: User Story 3 - Renombrar y eliminar un perfil (Priority: P3)

**Goal**: el usuario puede ponerle un nombre propio a un perfil ya creado y eliminarlo cuando ya no lo necesita.

**Independent Test**: tomar un perfil ya creado, renombrarlo y verificar que el nombre se conserva; eliminarlo y verificar que su harem completo desaparece con él.

### Tests for User Story 3 ⚠️

- [X] T037 [P] [US3] Test de `renameProfile` en `tests/unit/application/renameProfile.test.ts` (FR-009)
- [X] T038 [P] [US3] Test de edición de nombre de `ProfileCard` en `tests/component/presentation/ProfileCard.rename.test.tsx`

### Implementation for User Story 3

- [X] T039 [US3] Implementar el caso de uso `renameProfile` en `src/application/useCases/renameProfile.ts`; debe hacer pasar T037
- [X] T040 [US3] Conectar `renameProfile` en `src/presentation/context/ProfilesContext.tsx` (depende de T039)
- [X] T041 [US3] Agregar edición de nombre inline en `src/presentation/components/ProfileCard/{index.tsx,styles.tsx}` (depende de T040); debe hacer pasar T038
- [X] T042 [P] [US3] Crear el componente `ConfirmDeleteProfileDialog` en `src/presentation/components/ConfirmDeleteProfileDialog/{index.tsx,styles.tsx}` y conectarlo a la acción eliminar de `ProfileCard` (confirmación antes de borrar, ya que es irreversible — FR-011)
- [X] T043 [US3] Verificar manualmente el Escenario 4 de `quickstart.md` — cubierto por T037/T038 (tests automatizados de renombrado y borrado con confirmación); no se hizo click-through manual en navegador en esta sesión

**Checkpoint**: las tres historias de usuario funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: verificaciones y mejoras que cruzan varias historias

- [X] T044 [P] Test del invariante "una `Series` se autoelimina al quedarse sin personajes" en `tests/unit/domain/harem.test.ts` (FR-022, Escenario 6 de `quickstart.md`)
- [X] T045 [P] Verificar el Escenario 5 de `quickstart.md` (viewport móvil) en `PasteHaremScreen`, `ProfileSwitcher` y `HaremView` (Principio V de la constitución) — verificado por revisión de CSS (unidades relativas, `flex-wrap` en las listas de personajes/perfiles, sin anchos fijos mayores a un viewport angosto); no se probó en un dispositivo/navegador real en esta sesión
- [X] T046 [P] Verificar el Escenario 2 de `quickstart.md` (persistencia automática tras refresh, Principio I de la constitución) — automatizado en `tests/component/presentation/Persistence.test.tsx` (desmonta y vuelve a montar `App`, simulando un refresh)
- [X] T047 Revisar que todo componente nuevo de `src/presentation/components/` cumple la convención de carpeta y tipado del Principio VII (sin `React.FC`, interface `I<Nombre>` dentro de `index.tsx`, arrow function, `export default` al final) — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, todas las carpetas con exactamente `index.tsx`+`styles.tsx`, todos con `export default` al final
- [X] T048 Ejecutar `npm run lint` y la suite completa de tests (`npm run test`) — 0 errores de tipos (`tsc -b`), lint sin errores (2 warnings esperados/documentados), 32/32 tests pasando, build de producción (`npm run build`) exitoso

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede arrancar de inmediato
- **Foundational (Phase 2)**: depende de que termine Setup — BLOQUEA todas las historias de usuario
- **User Stories (Phase 3+)**: todas dependen de que termine Foundational
  - US1 no depende de otras historias
  - US2 reutiliza `createProfileFromPaste` de US1 (T019) para su propio flujo de "nuevo perfil", y su componente `ProfileSwitcher` se integra junto al `PasteHaremScreen` cableado en US1 (T025) — por eso US2 se implementa después de US1, aunque ambas siguen siendo verificables con su propio "Independent Test"
  - US3 extiende `ProfileCard` (creado en US2, T033) con renombrado y una confirmación de borrado más rica — se implementa después de US2
- **Polish (Phase 6)**: depende de que las historias deseadas estén completas

### Within Each User Story

- Tests antes que implementación (deben fallar primero)
- Tipos/entidades de dominio antes que casos de uso
- Casos de uso antes que su conexión en `ProfilesContext`
- `ProfilesContext` antes que los componentes que lo consumen
- Componentes hoja (`CharacterCard`, `SeriesGroup`, `ProfileCard`) antes que los componentes que los componen (`HaremView`, `ProfileSwitcher`)

### Parallel Opportunities

- Todas las tareas [P] de Setup (T003-T006) en paralelo, una vez terminado T002
- T007 y T008 (tipos de dominio) en paralelo
- T010 y T011 (las dos implementaciones de `ProfileRepository`) en paralelo, una vez terminado T009
- Dentro de cada historia, todos los tests marcados [P] en paralelo entre sí
- T021, T022, T023 (componentes hoja de US1) en paralelo entre sí
- T030 y T031 (casos de uso de US2) en paralelo entre sí
- T044, T045, T046 (verificaciones de Polish) en paralelo entre sí

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de la User Story 1:
Task: "Test de parseHaremMessage en tests/unit/domain/parseHaremMessage.test.ts"
Task: "Test de createProfileFromPaste en tests/unit/application/createProfileFromPaste.test.ts"
Task: "Test de componente PasteHaremScreen en tests/component/presentation/PasteHaremScreen.test.tsx"

# Lanzar juntos los componentes hoja de la User Story 1:
Task: "Crear PasteHaremScreen en src/presentation/components/PasteHaremScreen/"
Task: "Crear CharacterCard en src/presentation/components/CharacterCard/"
Task: "Crear SeriesGroup en src/presentation/components/SeriesGroup/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Phase 3: User Story 1
4. **DETENERSE y VALIDAR**: probar User Story 1 de forma independiente (Escenario 1 de `quickstart.md`)
5. Desplegar/demostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. Agregar User Story 1 → validar de forma independiente → demo (MVP)
3. Agregar User Story 2 → validar de forma independiente → demo
4. Agregar User Story 3 → validar de forma independiente → demo
5. Cada historia agrega valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- La etiqueta [Story] mapea cada tarea a su historia de usuario para trazabilidad
- Verificar que los tests fallan antes de implementar
- Hacer commit después de cada tarea o grupo lógico de tareas
- Detenerse en cada checkpoint para validar la historia de forma independiente
- Evitar: tareas vagas, conflictos de archivo entre tareas [P], dependencias cruzadas entre historias que rompan su independencia
