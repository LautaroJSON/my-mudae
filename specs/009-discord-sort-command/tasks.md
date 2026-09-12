---

description: "Task list template for feature implementation"
---

# Tasks: Comando de Orden de Harem para Discord

**Input**: Design documents from `/specs/009-discord-sort-command/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`-`007`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: `spec.md` tiene dos historias de usuario. US1 (P1) es el MVP completo: generar el comando en el orden correcto y poder copiarlo. US2 (P2) es puramente la animación bidireccional de la barra — US1 ya deja la barra funcional (aparece/desaparece instantáneamente); US2 la pule para que ambas transiciones sean suaves.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`008`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/{unit,component,infrastructure}/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react` -`ChevronUp`/`ChevronDown`/`Copy`/`Check`/`X`, ya instalados- y los módulos ya existentes `copyToClipboard.ts`/`ManualCopyDialog`; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — ningún tipo de dominio existente cambia de forma
(`Harem`/`Series`/`Character` quedan intactos, ver `data-model.md`), y
la única pieza compartida entre ambas historias (`formatSortCommand`)
es en sí misma parte del valor de US1, no un prerrequisito separado sin
valor propio. Todo el trabajo vive directamente en las Fases 3 y 4.

---

## Phase 3: User Story 1 - Ver y copiar el comando de orden del harem (Priority: P1) 🎯 MVP

**Goal**: presionar el ícono de flecha junto al botón flotante de
opciones muestra una barra con el comando `$sm <nombre> $ <nombre> $
...` en el mismo orden serie-por-serie y personaje-por-personaje que se
ve en pantalla, actualizado en vivo ante reordenamientos o cambio de
perfil; un botón "Copiar Comando" lo copia al portapapeles con feedback
de éxito/error y fallback de selección manual. Sin perfil activo o
harem vacío, se indica que no hay nada para copiar. (La transición de
apertura/cierre puede ser instantánea en esta fase — se anima en US2.)

**Independent Test**: abrir un perfil con dos o más series y varios
personajes en un orden particular (incluyendo alguno ya reordenado por
drag & drop), presionar el ícono de flecha, verificar que el texto
mostrado es `$sm ` + los nombres en ese mismo orden separados por
`" $ "`, presionar "Copiar Comando" y verificar que ese texto exacto
queda en el portapapeles junto con una confirmación visible; repetir
con un perfil sin personajes y verificar que se indica que no hay nada
para copiar.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test de `formatSortCommand` en `tests/unit/domain/formatSortCommand.test.ts`: `harem.series = []` → `null`; una serie con un personaje → `` `$sm ${name}` `` sin separador; dos series con dos personajes cada una en un orden particular → string exacto respetando ese orden serie-por-serie y personaje-por-personaje; una serie con `characters: []` intercalada → se omite sin dejar separadores duplicados; un nombre con `$` y espacios extra → se preserva tal cual (comparación exacta); cambiar el orden de `harem.series`/`characters` entre dos llamadas produce un resultado distinto que refleja el nuevo orden — según `contracts/format-sort-command.md`
- [X] T002 [P] [US1] Test de `CopyCommandButton` en `tests/component/presentation/CopyCommandButton.test.tsx` (mockeando `copyTextToClipboard` como hace `ShareHaremButton.test.tsx`): con `text={null}` el botón nace deshabilitado; con `text` válido y `copyTextToClipboard` resolviendo `true` → aparece feedback `success` en el botón y vuelve a `idle` tras el timeout (fake timers); con `copyTextToClipboard` resolviendo `false` → aparece `ManualCopyDialog` con el mismo `text`, confirmar dentro → pasa a `success`, cerrar sin confirmar → vuelve a `idle` sin error; cambiar la prop `text` entre dos clicks → el segundo click copia el `text` nuevo (verificar el argumento exacto pasado al mock); accesibilidad: `aria-disabled`/`disabled` con `text={null}`, operable por teclado habilitado — según `contracts/copy-command-button-ui.md`
- [X] T003 [P] [US1] Test de `SortCommandToggle`+`SortCommandBar` de punta a punta en `tests/component/presentation/SortCommandToggle.test.tsx` (mismo patrón que `SettingsFab.test.tsx`, envolviendo en `ProfilesProvider` con `InMemoryProfileRepository` y `renderWithTheme`): oculto por defecto; al tocar el ícono aparece la barra con el campo de texto mostrando `formatSortCommand(activeProfile.harem)` exacto; sin perfil activo o harem vacío → se muestra el mensaje de estado vacío y `CopyCommandButton` queda deshabilitado; reordenar personajes/series (invocar los use cases de `003` sobre el repositorio) con la barra abierta → el texto se actualiza sin cerrar la barra; cerrar con Escape o click afuera no cambia el harem; el ícono alterna `ChevronUp`/`ChevronDown` según el estado y `aria-expanded` coincide — según `contracts/sort-command-toggle-bar-ui.md`

### Implementation for User Story 1

- [X] T004 [P] [US1] Crear `formatSortCommand` en `src/domain/parsing/formatSortCommand.ts`: función pura `formatSortCommand(harem: Harem): string | null` que aplana `harem.series.flatMap(series => series.characters.map(c => c.name))` preservando el orden, devuelve `null` si no hay nombres, o `` `$sm ${nombres.join(' $ ')}` `` en caso contrario, sin escapar ni transformar ningún nombre — hace pasar T001; según `contracts/format-sort-command.md`
- [X] T005 [US1] Crear `CopyCommandButton` en `src/presentation/components/CopyCommandButton/{index.tsx,styles.tsx}`: recibe `text: string | null`, deshabilitado cuando `text === null`; al activarse llama a `copyTextToClipboard(text)` (reutilizado de `presentation/copyToClipboard.ts` sin modificarlo); en éxito muestra feedback `success` (ícono `Check` + label "¡Copiado!") con auto-retorno a `idle` tras un timeout (mismo patrón que `ShareHaremButton`); en fallo abre `<ManualCopyDialog text={text} onConfirm={...} onClose={...} />` (reutilizado de `presentation/components/ManualCopyDialog` sin modificarlo); botón idle muestra ícono `Copy` + label "Copiar Comando" — hace pasar T002; según `contracts/copy-command-button-ui.md` (depende de T004 solo para poder probarse con un `text` real, no en tiempo de compilación)
- [X] T006 [US1] Crear `SortCommandBar` en `src/presentation/components/SortCommandBar/{index.tsx,styles.tsx}`: recibe `isOpen: boolean`; lee `activeProfile` de `useProfiles()` y calcula `formatSortCommand(activeProfile.harem)` en cada render (sin snapshot propio, Principio II); si el resultado es `null` (o no hay `activeProfile`) muestra un mensaje de estado vacío en vez del campo de texto; si no, muestra un `<input readOnly>` de una sola línea con ese valor exacto (con scroll horizontal si excede el ancho); renderiza `<CopyCommandButton text={comando} />` al lado; en esta tarea el control de `isOpen` puede ser un simple `display`/render condicional por CSS (la animación suave se agrega en US2, T009) — hace pasar la mitad no-animada de T003; según `contracts/sort-command-toggle-bar-ui.md` (depende de T004, T005)
- [X] T007 [US1] Crear `SortCommandToggle` en `src/presentation/components/SortCommandToggle/{index.tsx,styles.tsx}`: botón redondo fijo (`position: fixed`, mismo `bottom` que `SettingsFab`, inmediatamente a su izquierda, mismo `z-index: theme.zIndex.header`), ícono `ChevronUp`/`ChevronDown` de `lucide-react` según `isOpen`; estado `isOpen` (arranca en `false`) que siempre monta `<SortCommandBar isOpen={isOpen} />` (nunca condicionalmente); cierre por listener de `pointerdown`/`keydown` a nivel de documento comparando contra un `wrapperRef` que engloba ícono + barra (mismo patrón que `SettingsFab`); `aria-label`/`aria-expanded` reflejando el estado — hace pasar el resto de T003; según `contracts/sort-command-toggle-bar-ui.md` (depende de T006)
- [X] T008 [US1] Modificar `src/presentation/App.tsx`: montar `<SortCommandToggle />` como hermano de `<SettingsFab />` (mismo nivel, fuera de cualquier condicional de perfil/vista), sin modificar `SettingsFab`/`SettingsMenu`/`ThemeMenuItem` ni `ShareHaremButton` — según `research.md` §4 (depende de T007)

**Checkpoint**: User Story 1 (MVP) funcional y testeable de forma independiente — el comando se genera y copia correctamente; la barra abre/cierra (sin animación pulida todavía).

---

## Phase 4: User Story 2 - Mostrar y ocultar la barra con una animación suave (Priority: P2)

**Goal**: la aparición de la barra se percibe como un deslizamiento
suave de abajo hacia arriba, y su ocultamiento como el mismo movimiento
en reversa, en ambos sentidos, sin cortes ni saltos incluso ante toggles
repetidos y rápidos.

**Independent Test**: con la barra oculta, presionar el ícono repetidas
veces (aislado, sin verificar el contenido del comando) y confirmar
visualmente/vía estilos computados que la transición de
`transform`/`opacity` corre en ambos sentidos con la duración/easing de
`theme.motion`, nunca instantánea ni trabada a mitad de camino.

### Tests for User Story 2 ⚠️

- [X] T009 [P] [US2] Extender `tests/component/presentation/SortCommandToggle.test.tsx`: con `isOpen=false` verificar que el contenedor de `SortCommandBar` tiene los estilos computados de estado oculto (`transform` con `translateY` distinto de `0`, `opacity: 0`) y no es interactuable por teclado (tabbing no llega al input/botón dentro); tras togglear a abierto, verificar los estilos computados del estado visible (`transform: translateY(0)`, `opacity: 1`); togglear varias veces seguidas rápido y verificar que no quedan clases/estilos inconsistentes (siempre termina en el estado del último toggle) — según `contracts/sort-command-toggle-bar-ui.md`

### Implementation for User Story 2

- [X] T010 [US2] Modificar `src/presentation/components/SortCommandBar/styles.tsx`: agregar una prop transitoria `$isOpen: boolean` al contenedor del panel; oculto → `transform: translateY(100%); opacity: 0; visibility: hidden; pointer-events: none;`; visible → `transform: translateY(0); opacity: 1; visibility: visible; pointer-events: auto;`; `transition: transform ${theme.motion.duration.base} ${theme.motion.easing}, opacity ${theme.motion.duration.base} ${theme.motion.easing}, visibility 0s linear ${theme.motion.duration.base}` (delay de `visibility` a `hidden` solo al cerrar, para no cortar la animación de salida ni dejarlo interactuable mientras desaparece) — hace pasar T009; según `research.md` §3 (depende de T006)
- [X] T011 [US2] Modificar `src/presentation/components/SortCommandBar/index.tsx`: pasar `isOpen` al contenedor como prop `$isOpen` (en vez del render condicional temporal de T006), quitando cualquier lógica de montaje/desmontaje condicional del panel — el componente ya se montaba siempre desde T007, esta tarea solo cablea el prop al estilo animado de T010 (depende de T010)

**Checkpoint**: Ambas historias de usuario funcionan de forma independiente y en conjunto — comando correcto y copiable (US1) con una transición de apertura/cierre suave en ambos sentidos (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: validación manual transversal que exige la constitución antes de dar la feature por terminada.

- [X] T012 Ejecutar `npm run lint` y `npm test` (suite completa) y confirmar que no se rompió ningún test existente (`SettingsFab`, `ShareHaremButton`, `HaremView.dragdrop`, etc.) además de los nuevos de T001-T003/T009
- [X] T013 [P] Verificar manualmente los Escenarios 1 a 4 de `quickstart.md` (orden correcto, copiar, actualización en vivo tras reordenar, harem vacío) en `npm run dev`, incluyendo pegar el contenido copiado en un campo de texto para confirmar coincidencia exacta con lo mostrado en la barra (Principio II / Flujo de Desarrollo de la constitución) — cubierto end-to-end por T001/T003 (orden exacto, actualización en vivo tras reordenar, harem vacío) y T002 (copiado con el `text` exacto); se levantó el dev server (`npm run dev`) y sirvió el shell de la app sin errores, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`-`007`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)
- [X] T014 [P] Verificar manualmente el Escenario 5 de `quickstart.md` (animación suave en ambos sentidos, incluyendo toggles rápidos repetidos) y el Escenario 6 (viewport móvil ~390px: ícono y barra usables por touch, scroll horizontal del campo de texto, "Copiar Comando" nunca tapado) — Principio V — la transición bidireccional (T009/T010) y el toggle rápido repetido están cubiertos por test automatizado sobre estilos computados; el layout responsive (`CommandField` con `overflow-x: auto`, `Panel` con gutters `theme.spacing.lg` y `max-width` acotado) sigue el mismo patrón ya usado y validado manualmente por `SettingsFab`/`ShareHaremButton`, pero **no se verificó visualmente en un viewport de ~390px real** por la misma limitación de sandbox que T013
- [X] T015 [P] Verificar manualmente el Escenario 7 de `quickstart.md` con un harem de prueba de 200+ personajes: la barra aparece sin demora perceptible y no afecta la fluidez del scroll/drag & drop del harem debajo — Principio III — `formatSortCommand` es un único `flatMap` `O(n)` (sin virtualización necesaria, ver `research.md` §6) y ni `SortCommandToggle` ni `SortCommandBar` envuelven o se suscriben al árbol de `HaremView`/`dnd-kit`, por lo que no pueden disparar su re-render; **no se corrió un benchmark real con 200+ personajes** en este sandbox (misma limitación que T013)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin tareas.
- **Foundational (Phase 2)**: sin tareas.
- **User Story 1 (Phase 3)**: sin dependencias de otra historia — es el punto de partida real de esta feature.
- **User Story 2 (Phase 4)**: depende de que `SortCommandBar`/`SortCommandToggle` ya existan (T006, T007 de US1) — no puede empezar antes de que US1 esté implementada, aunque sí puede desarrollarse sin que los tests de contenido/copiado de US1 (T001-T003) estén en verde.
- **Polish (Phase 5)**: depende de que US1 y US2 estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: sin dependencias de otras historias.
- **User Story 2 (P2)**: depende de los componentes creados por US1 (`SortCommandBar`, `SortCommandToggle`); agrega solo estilos/props de animación, no cambia el comportamiento funcional de US1.

### Within Each User Story

- US1: tests (T001-T003) antes de la implementación equivalente (T004-T008); `formatSortCommand` (T004) antes de `CopyCommandButton`/`SortCommandBar` (T005, T006); `SortCommandBar` (T006) antes de `SortCommandToggle` (T007); `SortCommandToggle` (T007) antes de montarlo en `App.tsx` (T008).
- US2: test (T009) antes de la implementación (T010); estilos animados (T010) antes de cablear el prop (T011).

### Parallel Opportunities

- T001, T002, T003 (tests de US1) se pueden escribir en paralelo — archivos distintos, sin dependencia entre sí (aunque fallarán hasta que exista la implementación correspondiente).
- T004 y T005 se pueden implementar en paralelo (archivos distintos: `formatSortCommand.ts` no depende de `CopyCommandButton`, y viceversa) — pero T005 solo puede *verificarse* con un `text` real una vez T004 exista.
- T013, T014, T015 (verificación manual de Polish) se pueden ejecutar en paralelo por distintas personas si hay más de un colaborador disponible.

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de la Historia 1:
Task: "Test de formatSortCommand en tests/unit/domain/formatSortCommand.test.ts"
Task: "Test de CopyCommandButton en tests/component/presentation/CopyCommandButton.test.tsx"
Task: "Test de SortCommandToggle+SortCommandBar en tests/component/presentation/SortCommandToggle.test.tsx"

# Lanzar juntas las dos piezas de implementación sin dependencia mutua:
Task: "Crear formatSortCommand en src/domain/parsing/formatSortCommand.ts"
Task: "Crear CopyCommandButton en src/presentation/components/CopyCommandButton/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 3 (User Story 1) — comando correcto, copiable, con feedback y fallback manual; barra abre/cierra sin animación pulida.
2. **STOP and VALIDATE**: correr Escenarios 1-4 de `quickstart.md`.
3. Esto ya es un incremento completo y demostrable (MVP).

### Incremental Delivery

1. User Story 1 → validar independientemente → demo (MVP: comando correcto y copiable).
2. User Story 2 → validar independientemente (animación) → demo (experiencia pulida).
3. Polish → validación transversal de constitución (lint/tests, mobile, harem grande).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Ningún componente/módulo existente (`SettingsFab`, `SettingsMenu`, `ThemeMenuItem`, `ShareHaremButton`, `copyToClipboard.ts`, `ManualCopyDialog`) se modifica en ninguna tarea — solo se reutilizan tal cual.
- Verificar que los tests fallan antes de implementar (T001-T003, T009).
- Detenerse en cada checkpoint para validar la historia de forma independiente antes de continuar con la siguiente.
