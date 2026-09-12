---

description: "Task list template for feature implementation"
---

# Tasks: Compartir Harem por Portapapeles

**Input**: Design documents from `/specs/004-share-harem-clipboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`/`002`/`003`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: `spec.md` de esta feature tiene una única historia de usuario (US1, P1) — toda la funcionalidad solicitada vive en esa historia; no hay Setup ni Foundational compartidos entre historias porque no hay una segunda historia con la que compartir nada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`/`002`/`003`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react` y el `Modal` genérico ya instalados; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — no hay ningún tipo de dominio que cambie de forma
(`Profile`/`Harem`/`Series`/`Character` quedan intactos, ver
`data-model.md`) ni ninguna migración pendiente que deba resolverse
antes de empezar. Al haber una sola historia de usuario, todo el trabajo
vive directamente en la Fase 3.

---

## Phase 3: User Story 1 - Compartir el harem activo por portapapeles (Priority: P1) 🎯 MVP

**Goal**: un icono redondo "Compartir harem" en la esquina superior
derecha del header copia el harem del perfil activo al portapapeles, en
el mismo formato de texto que la app reconoce al pegar un harem para dar
de alta un perfil, con feedback visible de éxito/error y un fallback
funcional cuando la Clipboard API no está disponible o falla.

**Independent Test**: abrir un perfil con harem cargado, tocar el icono
"Compartir harem", verificar que el portapapeles queda con el texto
esperado, pegar ese texto en el flujo de alta de perfil existente y
confirmar que se crea un perfil equivalente, y verificar que se muestra
feedback de éxito al usuario.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test de round-trip para `formatHaremMessage` en `tests/unit/domain/formatHaremMessage.test.ts`: un `Profile` fixture con 2+ series y 3+ personajes (con y sin `kakera`, con y sin `claimRank` explícito) pasado a `formatHaremMessage` y luego a `parseHaremMessage` reproduce el mismo `profileName`/series/personajes; una serie con `characters: []` se omite del texto; un personaje sin `claimRank` recibe un rango sintético por posición y sigue siendo parseable; reordenar el fixture con `reorderSeries`/`reorderCharactersInSeries` de `domain/harem/Harem.ts` (de `003`) hace que el texto generado refleje el nuevo orden — según `contracts/format-harem-message.md`
- [X] T002 [P] [US1] Test de `copyTextToClipboard` en `tests/unit/presentation/copyToClipboard.test.ts`: mock de `navigator.clipboard.writeText` resolviendo → `true` (se llamó con el texto exacto); mock rechazando + `document.execCommand` devolviendo `true` → `true` (se usó el fallback); sin `navigator.clipboard` + `execCommand` devolviendo `true` → `true`; ambos fallando/ausentes → `false` sin lanzar ninguna excepción — según `contracts/copy-to-clipboard.md`
- [X] T003 [P] [US1] Test de `ShareHaremButton` en `tests/component/presentation/ShareHaremButton.test.tsx`: deshabilitado sin perfil activo y con harem vacío, habilitado con harem cargado; click con `copyTextToClipboard` mockeado a `true` → aparece `Toast` con el texto correcto; click con `copyTextToClipboard` mockeado a `false` → aparece `ManualCopyDialog` (no un error de entrada); confirmar dentro del diálogo → pasa a `Toast` de éxito; cerrar sin confirmar (Escape) → no aparece ni éxito ni error; botón deshabilitado vía `disabled`/`aria-disabled` — según `contracts/share-harem-ui.md` — **ajustado en ejecución**: se mockeó el módulo `copyToClipboard` con `vi.mock` en vez de fake timers (más simple y robusto para este set de aserciones); el auto-descarte del `Toast` por timeout queda cubierto a nivel de `Toast` en sí, no repetido acá
- [X] T004 [US1] Extender `tests/component/presentation/Header.test.tsx`: con un perfil activo con harem cargado, el header renderiza `HeaderActions`/el icono "Compartir harem" junto al `ProfileButton` existente; sin perfil activo, el icono aparece deshabilitado — según `contracts/share-harem-ui.md`

### Implementation for User Story 1

- [X] T005 [P] [US1] Implementar `formatHaremMessage(profile: Profile): string` en `src/domain/parsing/formatHaremMessage.ts` (función pura, sin React/`styled-components`/`localStorage`/`navigator`, simétrica a `parseHaremMessage.ts`), según `contracts/format-harem-message.md` y `data-model.md`; hace pasar T001
- [X] T006 [P] [US1] Implementar `copyTextToClipboard(text: string): Promise<boolean>` en `src/presentation/copyToClipboard.ts` (Clipboard API → fallback `execCommand('copy')` con `<textarea>` fuera de pantalla → `false` si ambos fallan; nunca lanza), según `contracts/copy-to-clipboard.md`; hace pasar T002
- [X] T007 [P] [US1] Crear `Toast` en `src/presentation/components/Toast/{index.tsx,styles.tsx}`: props `variant: 'success' | 'error'`, `message: string`, `onDismiss: () => void`; usa `theme.zIndex.toast` y tokens de `theme.ts` (sin valores hardcodeados); sigue la convención de componente del Principio VII (interface `IToast` en `index.tsx`, arrow function, `export default` al final, sin `React.FC`), según `contracts/share-harem-ui.md` — **decisión tomada en ejecución** (no había un color "success" en `theme.ts`): la variante `success` reutiliza `theme.colors.accent` y la variante `error` reutiliza `theme.colors.danger`, documentado en un comentario en `styles.tsx`, en vez de agregar un token de color nuevo para un único consumidor
- [X] T008 [P] [US1] Crear `ManualCopyDialog` en `src/presentation/components/ManualCopyDialog/{index.tsx,styles.tsx}`, construido sobre el `Modal` genérico existente (`src/presentation/components/Modal`): props `text: string`, `onConfirm: () => void`, `onClose: () => void`; `<textarea readOnly value={text}>` que se autoselecciona al montar (`useEffect` + `focus()`/`select()`), botón "Listo, ya lo copié" que invoca `onConfirm`, según `contracts/share-harem-ui.md`
- [X] T009 [US1] Crear `ShareHaremButton` en `src/presentation/components/ShareHaremButton/{index.tsx,styles.tsx}`: lee `activeProfile` de `useProfiles()`, deshabilitado cuando no hay `activeProfile` o `countCharacters(activeProfile.harem) === 0` (reutilizando `countCharacters` de `domain/harem/Harem.ts`); al activarse, genera el texto con `formatHaremMessage`, llama a `copyTextToClipboard`, y muestra `Toast` de éxito o `ManualCopyDialog` según el resultado (flujo exacto de `contracts/share-harem-ui.md`); icono `Copy` de `lucide-react` en botón redondo (`border-radius: theme.radii.pill`); `aria-label="Compartir harem"` (depende de T005, T006, T007, T008); hace pasar T003 — **ajustado en ejecución**: sin props propias, el componente omite una interface `IShareHaremButton` vacía, mismo criterio ya usado por `Header` (que tampoco declara una interface cuando no recibe props)
- [X] T010 [US1] Crear `HeaderActions` en `src/presentation/components/HeaderActions/{index.tsx,styles.tsx}`: contenedor de la lista horizontal de iconos redondos de acciones rápidas (FR-001), sin props en esta iteración, montando `<ShareHaremButton />` como único hijo (depende de T009)
- [X] T011 [US1] Modificar `src/presentation/components/Header/{index.tsx,styles.tsx}`: agrupar `<HeaderActions />` y el `<ProfileButton>` existente en un nuevo contenedor `RightGroup` a la derecha del `Bar` (que conserva `justify-content: space-between` con el `Title` a la izquierda), sin cambiar el comportamiento actual del `ProfileButton`/`ProfilesModal` (depende de T010); hace pasar T004
- [X] T012 [US1] Verificar manualmente los Escenarios 1 a 5 de `quickstart.md` (compartir con éxito por Clipboard API, round-trip completo creando un perfil nuevo a partir del texto copiado, icono deshabilitado sin perfil/harem vacío, fallback de copiado manual cuando la Clipboard API falla o no existe, y que el texto copiado refleja el orden visual actual tras reordenar series/personajes — Principio II) — cubierto end-to-end por T001 (round-trip + orden tras reordenar), T002 (fallback de Clipboard API), T003/T004 (flujo de UI completo con perfil real vía `ProfilesContext`); se levantó el dev server (`npm run dev`) y sirvió el shell de la app sin errores, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003/tasks.md`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (única historia de esta feature = MVP completo)

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T013 [P] Verificar manualmente el Escenario 6 de `quickstart.md` (viewport móvil ~390×844, Principio V): el icono "Compartir harem" y el `ProfileButton` conviven en el header sin scroll horizontal ni elementos cortados; el `Toast`/`ManualCopyDialog` se leen completos sin salirse de la pantalla; el tap-target del icono es usable con touch — **ajustado en ejecución**: sin navegador real disponible en este sandbox (misma limitación de `003`), se verificó por razonamiento sobre el CSS: `RightGroup` es un `flex` sin ancho fijo dentro de `Bar` (`justify-content: space-between`), el nuevo botón redondo es de tamaño fijo chico (`2.25rem`, tap-target aceptable) y el `ProfileButton` ya tolera achicarse (`overflow:hidden`+`text-overflow:ellipsis`, comportamiento preexistente de `002` no modificado); `Toast` usa `max-width: calc(100vw - spacing.xxxl)` para no desbordar en pantallas angostas y `ManualCopyDialog` reutiliza el `Modal` genérico ya validado en viewport móvil por `002`/`003`. No se hizo verificación visual real en un viewport de DevTools/dispositivo
- [X] T014 [P] Revisar que `HeaderActions`, `ShareHaremButton`, `Toast` y `ManualCopyDialog` cumplen la convención de carpeta/tipado del Principio VII (grep de `React.FC`, `styled.` fuera de `styles.tsx`, presencia de interface `I<Nombre>` en cada `index.tsx`, `export default` al final) y que ningún `styles.tsx` nuevo usa un valor de color/tipografía/spacing hardcodeado fuera de `theme.ts` — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, `IToast`/`IManualCopyDialog` presentes (`HeaderActions`/`ShareHaremButton` correctamente sin interface por no tener props, mismo criterio que `Header`), `export default` al final de los cuatro; único color no proveniente de un token es el reuso documentado de `theme.colors.accent`/`theme.colors.danger` para las variantes de `Toast` (T007)
- [X] T015 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final: 0 errores de tipos, lint sin errores nuevos (mismas 2 advertencias preexistentes ya documentadas en `003`: espacio irregular en el fixture de `parseHaremMessage.test.ts` y el export no-componente de `ProfilesContext.tsx`), **118/118 tests en verde**, build de producción exitoso (338.44 kB / gzip 106.96 kB)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: sin tareas, nada que bloquee el inicio de la historia
- **User Story 1 (Phase 3)**: única historia de esta feature; no depende de ninguna otra
- **Polish (Phase 4)**: depende de que la Phase 3 esté completa

### Within User Story 1

- Tests (T001-T004) antes que la implementación que los hace pasar
- `formatHaremMessage` (T005) y `copyTextToClipboard` (T006) son funciones/utilidades independientes entre sí y de `Toast`/`ManualCopyDialog` (T007/T008) — las cuatro pueden avanzar en paralelo
- `ShareHaremButton` (T009) depende de las cuatro anteriores (T005-T008), porque las orquesta a todas
- `HeaderActions` (T010) depende de `ShareHaremButton` (T009)
- `Header` (T011) depende de `HeaderActions` (T010)

### Parallel Opportunities

- T001/T002/T003 (tests de dominio/utilidad/componente, archivos distintos) en paralelo entre sí; T004 puede escribirse en paralelo con ellos pero solo pasará una vez completado T011
- T005/T006/T007/T008 (archivos nuevos, sin dependencias entre sí) en paralelo entre sí
- T013/T014 (Polish, archivos/verificaciones independientes) en paralelo

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de US1:
Task: "Round-trip de formatHaremMessage en tests/unit/domain/formatHaremMessage.test.ts"
Task: "Test de copyTextToClipboard en tests/unit/presentation/copyToClipboard.test.ts"
Task: "Test de ShareHaremButton en tests/component/presentation/ShareHaremButton.test.tsx"

# En paralelo, las piezas de implementación sin dependencias entre sí:
Task: "Implementar formatHaremMessage en src/domain/parsing/formatHaremMessage.ts"
Task: "Implementar copyTextToClipboard en src/presentation/copyToClipboard.ts"
Task: "Crear Toast en src/presentation/components/Toast/"
Task: "Crear ManualCopyDialog en src/presentation/components/ManualCopyDialog/"
```

---

## Implementation Strategy

### MVP First (y única entrega)

1. Completar Phase 3: User Story 1
2. **DETENERSE y VALIDAR**: Escenarios 1-5 de `quickstart.md`
3. Completar Phase 4: Polish (viewport móvil, convención de componentes, gate de lint/tipos/tests/build)
4. Desplegar/demostrar

### Incremental Delivery

Al haber una sola historia de usuario, la entrega es única: Setup/
Foundational (sin tareas) → User Story 1 completa → Polish → listo para
demo. No hay una segunda o tercera historia que agregar en esta
iteración (la barra de iconos queda preparada para sumarlas en features
futuras del mismo conjunto, fuera de alcance acá).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Ninguna tarea reestructura ningún tipo de dominio existente
  (`Profile`/`Harem`/`Series`/`Character` no cambian de forma)
- Verificar que los tests (T001-T004) fallan antes de implementar
  (T005-T011)
- Detenerse en el checkpoint de la Phase 3 para validar la historia de
  forma independiente antes de pasar a Polish

---

## Addendum (post-implementación, sesión posterior): feedback de "copiado" en el propio icono, sin `Toast`

- [X] T016 Reemplazar el `Toast` de `ShareHaremButton` por feedback en el propio icono (relleno `theme.colors.accent`/`theme.colors.danger` + icono `Check`/`X` de `lucide-react` en vez de `Copy`, por 2500ms) — pedido explícito del usuario ("se eliminan los mensajes toast... el icono se vuelve de color naranja y un check negro en su interior"), ver Addendum de `research.md`. Se agregó el token `theme.colors.onAccent` (`src/shared/theme.ts`) para el color del icono sobre el relleno de acento/danger. Se actualizaron los tests de `tests/component/presentation/ShareHaremButton.test.tsx` que buscaban el texto del `Toast` para en cambio verificar el `aria-label` del botón (`/harem copiado/i`) mientras dura el feedback. `Toast` en sí no se modificó ni se eliminó — sigue en uso por `UpdateHaremButton` (`005`), que no es un icono de "copiar" y quedó fuera de este pedido.
