---

description: "Task list template for feature implementation"
---

# Tasks: Actualizar Harem por Re-Pegado

**Input**: Design documents from `/specs/005-update-harem-paste/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`-`004`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: `spec.md` de esta feature tiene una única historia de usuario (US1, P1) — toda la funcionalidad solicitada vive en esa historia; no hay Setup ni Foundational compartidos entre historias porque no hay una segunda historia con la que compartir nada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`004`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react`, el `Modal` y el `Toast` de `004` ya instalados/existentes; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — no hay ningún tipo de dominio que cambie de forma
(`Profile`/`Harem`/`Series`/`Character`/`ParsedHaremMessage` quedan
intactos, ver `data-model.md`) ni ninguna migración pendiente. Al haber
una sola historia de usuario, todo el trabajo vive directamente en la
Fase 3.

---

## Phase 3: User Story 1 - Actualizar el harem del perfil activo re-pegando el mensaje de Mudae (Priority: P1) 🎯 MVP

**Goal**: un segundo icono redondo "Actualizar harem" en la esquina
superior derecha (junto a "Compartir harem" de `004`) abre un modal para
volver a pegar el mensaje de Mudae; si el nombre de perfil pegado
coincide con el perfil activo, su harem se sobrescribe (agrega/actualiza/
elimina personajes según el nuevo pegado); si no coincide (con el activo
o con cualquier otro perfil existente), se bloquea con una advertencia
explícita, sin tocar ningún dato persistido.

**Independent Test**: con un perfil activo cargado, tocar "Actualizar
harem", pegar una variante más reciente del mismo mensaje y verificar
que el harem queda exactamente como describe el nuevo pegado; luego
repetir pegando un mensaje de otro nombre de perfil y verificar que
aparece la advertencia sin modificar ningún harem.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test de `updateActiveProfileHarem` en `tests/unit/application/updateActiveProfileHarem.test.ts` con un `InMemoryProfileRepository` seedeado con 2+ perfiles: pegar un texto válido con el nombre del perfil activo → `{ ok: true }`, ese harem queda sincronizado (agrega/actualiza/elimina según `syncHarem`), el harem de cualquier otro perfil queda intacto, `isActive`/`alias`/`order` de todos los perfiles quedan intactos; pegar un texto válido con el nombre de OTRO perfil existente (no el activo) → `PROFILE_MISMATCH` con `pastedProfileName` correcto, ningún perfil del repositorio cambia; pegar un texto válido con un nombre que no corresponde a ningún perfil → `PROFILE_MISMATCH`, no se crea ningún perfil nuevo; pegar un texto no reconocible → `NO_VALID_SERIES_OR_CHARACTER`, ningún perfil cambia; `activeProfileId` inexistente → `NO_ACTIVE_PROFILE`, ningún perfil cambia — según `contracts/update-active-profile-harem.md`
- [X] T002 [P] [US1] Test de `UpdateHaremModal` (vía `UpdateHaremButton`, que es quien le provee `onClose`/`onUpdated`) en `tests/component/presentation/UpdateHaremModal.test.tsx`: con un perfil activo, abrir el modal y pegar (`user.paste`, mismo mecanismo que `PasteHaremScreen.test.tsx`) un texto válido con el nombre del perfil activo → el modal se cierra y aparece un `Toast` de éxito; pegar un texto válido con OTRO nombre de perfil → aparece la vista de advertencia con el nombre detectado (no un `Toast`), el modal sigue abierto; tocar "Reintentar" → vuelve a la zona de pegado; pegar un texto no reconocible → mensaje de error inline en la misma zona de pegado; cerrar el modal (Escape) en cualquier vista → no aparece ningún `Toast` y el harem del perfil activo no cambió — según `contracts/update-harem-ui.md`
- [X] T003 [US1] Extender `tests/component/presentation/Header.test.tsx`: con un perfil activo (incluso con harem vacío), el header renderiza también el icono "Actualizar harem" habilitado junto al de "Compartir harem"; sin perfil activo, "Actualizar harem" aparece deshabilitado — según `contracts/update-harem-ui.md`

### Implementation for User Story 1

- [X] T004 [P] [US1] Implementar `updateActiveProfileHarem(repository, activeProfileId, rawText)` en `src/application/useCases/updateActiveProfileHarem.ts`: parsea con `parseHaremMessage`, compara `parsed.profileName` contra `activeProfileId` (no contra `alias`), en éxito calcula `syncHarem(harem actual, parsed.series)` y persiste solo el perfil objetivo, según `contracts/update-active-profile-harem.md` y `data-model.md`; hace pasar T001
- [X] T005 [US1] Exponer `updateActiveProfileHarem(rawText)` en `src/presentation/context/ProfilesContext.tsx` (nuevo método de `IProfilesContext`, opera sobre `activeProfile.id`, devuelve `NO_ACTIVE_PROFILE` sin llamar al caso de uso si no hay perfil activo) (depende de T004)
- [X] T006 [US1] Crear `UpdateHaremModal` en `src/presentation/components/UpdateHaremModal/{index.tsx,styles.tsx}`: construido sobre el `Modal` genérico existente, con su propia zona de pegado (`contentEditable` + evento `paste`, mismo mecanismo visual que `PasteHaremScreen`), vista `paste` (con error inline en formato inválido) y vista `mismatch` (con el nombre detectado y botón "Reintentar"), invoca `onUpdated()` en éxito sin cambiar de vista — según `contracts/update-harem-ui.md` y `data-model.md` (depende de T005)
- [X] T007 [US1] Crear `UpdateHaremButton` en `src/presentation/components/UpdateHaremButton/{index.tsx,styles.tsx}`: icono `RefreshCw` de `lucide-react` en botón redondo (mismo patrón `RoundIconButton` que `ShareHaremButton` de `004`, duplicado en este `styles.tsx` según `research.md`); deshabilitado solo cuando no hay `activeProfile` (a diferencia de `ShareHaremButton`, no exige harem no vacío); abre `UpdateHaremModal`, y en `onUpdated` cierra el modal y muestra `Toast` de éxito reutilizando el componente `Toast` de `004`; `aria-label="Actualizar harem"` — según `contracts/update-harem-ui.md`; hace pasar T002 (depende de T006) — **ajustado en ejecución**: sin props propias, omite una interface `IUpdateHaremButton` vacía, mismo criterio ya usado por `Header`/`ShareHaremButton`
- [X] T008 [US1] Modificar `src/presentation/components/HeaderActions/index.tsx`: montar `<UpdateHaremButton />` como segundo hijo, junto a `<ShareHaremButton />` (depende de T007); hace pasar T003
- [X] T009 [US1] Verificar manualmente los Escenarios 1 a 4 de `quickstart.md` (actualizar con éxito, formato inválido no modifica nada, advertencia cuando el nombre no coincide —incluyendo el caso de que coincida con OTRO perfil existente—, y actualizar un perfil con harem vacío) — cubierto end-to-end por T001 (casos del caso de uso, incluyendo el escenario de coincidencia con otro perfil existente) y T002/T003 (flujo de UI completo con perfil real vía `ProfilesContext`); se levantó el dev server (`npm run dev`) y sirvió el shell de la app sin errores, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`/`004`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (única historia de esta feature = MVP completo)

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T010 [P] Verificar manualmente el Escenario 5 de `quickstart.md` (viewport móvil ~390×844, Principio V): el icono "Actualizar harem", el modal, su zona de pegado y la vista de advertencia se leen completos sin scroll horizontal ni elementos cortados — **ajustado en ejecución**: sin navegador real disponible en este sandbox (misma limitación de `003`/`004`), se verificó por razonamiento sobre el CSS: `UpdateHaremButton` reutiliza el mismo botón redondo de tamaño fijo ya validado por `004`, y `UpdateHaremModal` se construye sobre el `Modal` genérico (ya validado en viewport móvil por `002`/`003`) con la misma `PasteZone` de `PasteHaremScreen` (`001`), ya usable en mobile. No se hizo verificación visual real en un viewport de DevTools/dispositivo
- [X] T011 [P] Revisar que `UpdateHaremModal` y `UpdateHaremButton` cumplen la convención de carpeta/tipado del Principio VII (grep de `React.FC`, `styled.` fuera de `styles.tsx`, presencia de interface `I<Nombre>` en cada `index.tsx` que reciba props, `export default` al final) y que ningún `styles.tsx` nuevo usa un valor de color/tipografía/spacing hardcodeado fuera de `theme.ts` — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, `IUpdateHaremModal` presente (`UpdateHaremButton` correctamente sin interface por no tener props, mismo criterio que `Header`/`ShareHaremButton`), `export default` al final de ambos; sin valores de color hardcodeados fuera de `theme.ts`
- [X] T012 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final: 0 errores de tipos, lint sin errores nuevos (mismas 2 advertencias preexistentes ya documentadas en `003`/`004`), **130/130 tests en verde**, build de producción exitoso (343.73 kB / gzip 107.75 kB)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: sin tareas, nada que bloquee el inicio de la historia
- **User Story 1 (Phase 3)**: única historia de esta feature; no depende de ninguna otra (reutiliza componentes de `004` sin modificarlos, salvo `HeaderActions`)
- **Polish (Phase 4)**: depende de que la Phase 3 esté completa

### Within User Story 1

- Tests (T001-T003) antes que la implementación que los hace pasar
- `updateActiveProfileHarem` (T004) antes que su exposición en `ProfilesContext` (T005)
- `ProfilesContext` (T005) antes que `UpdateHaremModal` (T006), que lo consume
- `UpdateHaremModal` (T006) antes que `UpdateHaremButton` (T007), que lo monta
- `UpdateHaremButton` (T007) antes que `HeaderActions` (T008), que lo monta

### Parallel Opportunities

- T001/T002 (tests de caso de uso/UI, archivos distintos) en paralelo entre sí; T003 puede escribirse en paralelo pero solo pasará una vez completado T008
- T004 no tiene dependencias de implementación previas — puede arrancar en paralelo con la redacción de T001/T002
- T010/T011 (Polish, verificaciones independientes) en paralelo

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de US1:
Task: "Test de updateActiveProfileHarem en tests/unit/application/updateActiveProfileHarem.test.ts"
Task: "Test de UpdateHaremModal en tests/component/presentation/UpdateHaremModal.test.tsx"

# En paralelo, el caso de uso no depende de ningún componente:
Task: "Implementar updateActiveProfileHarem en src/application/useCases/updateActiveProfileHarem.ts"
```

---

## Implementation Strategy

### MVP First (y única entrega)

1. Completar Phase 3: User Story 1
2. **DETENERSE y VALIDAR**: Escenarios 1-4 de `quickstart.md`
3. Completar Phase 4: Polish (viewport móvil, convención de componentes, gate de lint/tipos/tests/build)
4. Desplegar/demostrar

### Incremental Delivery

Al haber una sola historia de usuario, la entrega es única: Setup/
Foundational (sin tareas) → User Story 1 completa → Polish → listo para
demo.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Ninguna tarea reestructura ningún tipo de dominio existente
  (`Profile`/`Harem`/`Series`/`Character`/`ParsedHaremMessage` no
  cambian de forma); `syncHarem`, `parseHaremMessage`, `Modal` y `Toast`
  se reutilizan sin ninguna modificación
- Verificar que los tests (T001-T003) fallan antes de implementar
  (T004-T008)
- Detenerse en el checkpoint de la Phase 3 para validar la historia de
  forma independiente antes de pasar a Polish
