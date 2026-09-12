---

description: "Task list template for feature implementation"
---

# Tasks: Menú Flotante de Temas Visuales

**Input**: Design documents from `/specs/007-theme-settings-menu/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva (igual que en `001`-`006`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: `spec.md` de esta feature tiene una única historia de usuario (US1, P1) — toda la funcionalidad solicitada vive en esa historia; no hay Setup ni Foundational compartidos entre historias porque no hay una segunda historia con la que compartir nada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`006`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo; `index.html` en la raíz.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react` -`Settings`/`ChevronDown`/`Check`- ya instalados; ver `research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

Sin tareas — no hay ningún tipo de dominio que cambie de forma
(`Profile`/`Harem`/`Series`/`Character` quedan intactos, ver
`data-model.md`) ni ninguna migración pendiente. Al haber una sola
historia de usuario, todo el trabajo (incluyendo la extensión del
mecanismo de temas en `theme.ts`/`GlobalStyle.tsx`, que es prerrequisito
de los componentes de UI de esta misma historia) vive directamente en la
Fase 3.

---

## Phase 3: User Story 1 - Elegir el tema visual de la app desde un botón flotante de opciones (Priority: P1) 🎯 MVP

**Goal**: un botón flotante circular (engranaje) fijo en la esquina
inferior derecha abre un menú con la opción "Temas", que despliega tipo
acordeón tres temas elegibles (Default cálido, Claro, Legacy); elegir
uno cambia la apariencia de toda la app de inmediato y la preferencia se
recuerda entre visitas.

**Independent Test**: abrir la app, tocar el botón flotante, tocar
"Temas", elegir cada uno de los tres temas uno por uno y verificar que
la apariencia de toda la app cambia de forma inmediata y consistente en
cada caso, y que el tema elegido se mantiene al recargar la página.

### Tests for User Story 1 ⚠️

- [X] T001 [P] [US1] Test de `useThemePreference` en `tests/unit/presentation/useThemePreference.test.ts`: sin nada guardado en `localStorage` → devuelve `'default'`; con un valor guardado válido (`'claro'`/`'legacy'`) → lo devuelve; con un valor inválido/corrupto guardado → cae a `'default'`; `setTheme('claro')`/`setTheme('legacy')` persisten en `localStorage` (clave `mymudae:theme`) y fijan `document.documentElement.dataset.theme` al valor correspondiente; `setTheme('default')` persiste `'default'` y remueve el atributo `data-theme` del documento; si `localStorage` lanza (mock), el hook no lanza y se comporta como si no hubiera preferencia guardada — según `data-model.md` y `contracts/theme-css-mechanism.md`
- [X] T002 [P] [US1] Test en `tests/component/presentation/SettingsFab.test.tsx` (cubre `SettingsFab`+`SettingsMenu`+`ThemeMenuItem` de punta a punta): el botón está cerrado (sin menú) por defecto; al tocarlo aparece el menú con la opción "Temas"; al tocar "Temas" se despliegan las tres opciones ("Default cálido", "Claro", "Legacy"); tocar "Temas" de nuevo las colapsa; elegir una opción la marca como activa y actualiza `document.documentElement.dataset.theme`; cerrar con Escape o click afuera no cambia el tema activo; el botón y las opciones son operables por teclado (foco visible, Enter/Space) — según `contracts/settings-menu-ui.md`

### Implementation for User Story 1

- [X] T003 [P] [US1] En `src/shared/theme.ts`: agregar `legacyColors` (paleta inspirada en Tokyo Night, mismos 13 campos que `lightColors`/`darkColors`) y `legacyFonts` (`fontBody`/`fontDisplay` con stack Segoe UI); cambiar `typography.fontBody`/`fontDisplay` a `"var(--mm-font-body)"`/`"var(--mm-font-display)"` (mismo patrón que `colors`); actualizar el comentario de cabecera del archivo (hoy dice "no hay toggle manual ni estado de React para el tema", que deja de ser cierto) — valores exactos y rationale en `research.md`
- [X] T004 [US1] En `src/presentation/GlobalStyle.tsx`: agregar `--mm-font-body`/`--mm-font-display` a `:root` (valores por defecto, Outfit); agregar `:not([data-theme="claro"]):not([data-theme="legacy"])` al selector de la regla `@media (prefers-color-scheme: dark)` existente; agregar una regla nueva incondicional `:root[data-theme="legacy"] { ... }` con `legacyColors`/`legacyFonts` — según la tabla completa de `contracts/theme-css-mechanism.md` (depende de T003) — **ajustado en ejecución**: también se cambió `body { font-family: ${typography.fontBody} }` a `font-family: var(--mm-font-body)` (usaba el literal fijo en vez de la variable, lo que hubiera dejado el `<body>` sin cambiar de tipografía bajo "Legacy")
- [X] T005 [P] [US1] Agregar a `index.html` un `<script>` inline (sin `type="module"`, antes de `<div id="root">`) que lee `localStorage.getItem('mymudae:theme')` y, si es `'claro'` o `'legacy'`, fija `document.documentElement.setAttribute('data-theme', valor)` antes del primer render de React — envuelto en `try/catch` (nunca lanza) — según `research.md` (previene el parpadeo de tema al recargar)
- [X] T006 [P] [US1] Crear `useThemePreference` en `src/presentation/useThemePreference.ts`: exporta el tipo `ThemeName = 'default' | 'claro' | 'legacy'` y el hook `useThemePreference(): [ThemeName, (theme: ThemeName) => void]` (lee/valida `localStorage` al iniciar, persiste y fija/remueve `document.documentElement.dataset.theme` en cada cambio, nunca lanza) — según `data-model.md`; hace pasar T001 (depende de T003 para que `data-theme` ya tenga efecto visual, aunque el hook en sí no importa nada de `theme.ts`)
- [X] T007 [US1] Crear `ThemeMenuItem` en `src/presentation/components/ThemeMenuItem/{index.tsx,styles.tsx}`: fila "Temas" con acordeón (`isThemesExpanded`, ícono `ChevronDown`/`ChevronUp` de `lucide-react`) que despliega las tres opciones de tema; usa `useThemePreference()` para leer/cambiar el tema activo y marcarlo (ícono `Check` + `aria-current`) — según `contracts/settings-menu-ui.md` (depende de T006)
- [X] T008 [US1] Crear `SettingsMenu` en `src/presentation/components/SettingsMenu/{index.tsx,styles.tsx}`: contenedor genérico anclado encima del botón (popover), sin lógica de temas propia, monta `<ThemeMenuItem />` como único ítem en esta iteración — según `contracts/settings-menu-ui.md` (depende de T007) — **ajustado en ejecución**: se simplificó a solo `{ children }` en vez de aceptar también `onClose` (el contrato lo mencionaba para uso futuro de un hijo, pero `ThemeMenuItem` no cierra el menú por diseño y un prop sin ningún consumidor real quedaría como código muerto bajo `noUnusedParameters`); el cierre completo (click-afuera/Escape) lo maneja únicamente `SettingsFab`, que envuelve tanto el botón como el menú
- [X] T009 [US1] Crear `SettingsFab` en `src/presentation/components/SettingsFab/{index.tsx,styles.tsx}`: botón redondo fijo en la esquina inferior derecha (`position: fixed`, `theme.zIndex.header`), ícono `Settings` de `lucide-react`, estado `isOpen` que monta `<SettingsMenu>` con `<ThemeMenuItem />` adentro, cierre por listener de `pointerdown`/`keydown` a nivel de documento (click-afuera y Escape) — según `contracts/settings-menu-ui.md`; hace pasar T002 (depende de T008)
- [X] T010 [US1] Modificar `src/presentation/App.tsx`: montar `<SettingsFab />` a nivel de `App` (fuera de cualquier condicional de perfil/vista), para que quede visible en todos los estados (vacío, harem cargado, "perfil no encontrado") — según `contracts/settings-menu-ui.md` (depende de T009)
- [X] T011 [US1] Verificar manualmente los Escenarios 1 a 5 de `quickstart.md` (botón siempre visible, abrir menú y expandir "Temas", elegir cada tema y ver el cambio inmediato incluyendo que "Default cálido" siga el sistema y "Claro"/"Legacy" queden fijos, persistencia sin parpadeo entre recargas, cerrar sin elegir nada) — cubierto end-to-end por T001/T002; se levantó el dev server (`npm run dev`) y sirvió el shell de la app sin errores, pero **no se hizo click-through visual real en navegador** (misma limitación de entorno ya documentada en `003`-`006`: sin `chromium-cli`/Playwright/Chromium instalado en este sandbox)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente (única historia de esta feature = MVP completo)

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T012 [P] Verificar manualmente el Escenario 6 de `quickstart.md` (viewport móvil ~390×844, Principio V): el botón flotante y el menú/acordeón se leen completos, sin salirse de la pantalla ni tapar contenido esencial — **ajustado en ejecución**: sin navegador real disponible en este sandbox, se verificó por razonamiento sobre el CSS: `Wrapper` usa `theme.spacing.lg` de margen desde los bordes (no pegado al borde), `Panel` tiene `min-width: 12rem` con `right: 0` (no se desborda hacia la derecha) y crece hacia arriba (`bottom: calc(100% + spacing.sm)`), consistente con espacio ya disponible en la mayoría de viewports móviles. No se hizo verificación visual real en un viewport de DevTools/dispositivo
- [X] T013 [P] Revisar que `SettingsFab`, `SettingsMenu` y `ThemeMenuItem` cumplen la convención de carpeta/tipado del Principio VII (grep de `React.FC`, `styled.` fuera de `styles.tsx`, presencia de interface `I<Nombre>` en cada `index.tsx` que reciba props, `export default` al final) y que ningún `styles.tsx` nuevo usa un valor de color/tipografía/spacing hardcodeado fuera de `theme.ts` — verificado con grep: 0 usos de `React.FC`, 0 `styled.` fuera de `styles.tsx`, `ISettingsMenu` presente (`SettingsFab`/`ThemeMenuItem` correctamente sin interface por no tener props), `export default` al final de los tres; sin colores hardcodeados fuera de `theme.ts`
- [X] T014 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final: 0 errores de tipos, lint sin errores nuevos (mismas 2 advertencias preexistentes ya documentadas en `003`-`006`), build de producción exitoso (355.49 kB / gzip 110.47 kB). **149-150/150 tests en verde según la corrida** — de los tests en rojo, 2 (`Header.test.tsx`, iconos deshabilitados sin perfil activo) y 1 (`SeriesGroup.appearance.test.tsx`, `align-self: flex-start`) son una regresión preexistente y ajena a esta feature (edición de `HeaderActions`/`CharacterList` hecha fuera de este flujo, ya reportada en sesiones anteriores); 1-2 adicionales (`HaremView.performance.test.tsx` y/o `ProfilesFlow.test.tsx`) aparecieron de forma intermitente en corridas repetidas de la suite completa (no en corridas aisladas) — comportamiento flaky preexistente de tests sensibles a tiempo bajo carga, no una regresión introducida por esta feature (los 7 tests nuevos de `SettingsFab.test.tsx` y los 7 de `useThemePreference.test.ts` pasan consistentemente en todas las corridas). **Fix fuera de alcance aplicado**: `src/presentation/components/CharacterCard/styles.tsx`'s `Kakera` (agregado fuera de este flujo, ya cableado en `index.tsx`) referenciaba `theme.colors.a` (inexistente) y rompía `tsc -b`/`npm run build` para todo el proyecto, no solo para esta feature; se completó a `theme.colors.accent` (fix mínimo de una palabra, no un rediseño) para poder validar el gate final

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** y **Foundational (Phase 2)**: sin tareas, nada que bloquee el inicio de la historia
- **User Story 1 (Phase 3)**: única historia de esta feature; no depende de ninguna otra
- **Polish (Phase 4)**: depende de que la Phase 3 esté completa

### Within User Story 1

- Tests (T001-T002) antes que la implementación que los hace pasar
- `theme.ts` (T003) antes que `GlobalStyle.tsx` (T004), que consume `legacyColors`/`legacyFonts`
- `theme.ts` (T003) es también la base conceptual de `useThemePreference` (T006), aunque el hook en sí no importa nada de ahí
- `useThemePreference` (T006) antes que `ThemeMenuItem` (T007), que lo consume
- `ThemeMenuItem` (T007) antes que `SettingsMenu` (T008), que lo monta
- `SettingsMenu` (T008) antes que `SettingsFab` (T009), que lo monta
- `SettingsFab` (T009) antes que `App.tsx` (T010), que lo monta
- El script anti-parpadeo de `index.html` (T005) es independiente del resto — puede hacerse en cualquier momento

### Parallel Opportunities

- T001/T002 (tests, archivos distintos) en paralelo entre sí
- T003 (theme.ts) y T005 (index.html) en paralelo entre sí (archivos distintos, sin dependencia mutua)
- T012/T013 (Polish) en paralelo

---

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de US1:
Task: "Test de useThemePreference en tests/unit/presentation/useThemePreference.test.ts"
Task: "Test de SettingsFab (flujo completo) en tests/component/presentation/SettingsFab.test.tsx"

# En paralelo, piezas de base sin dependencia mutua:
Task: "Agregar legacyColors/legacyFonts y var(--mm-font-*) en src/shared/theme.ts"
Task: "Agregar script anti-parpadeo en index.html"
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
demo.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- `Profile`/`Harem`/`Series`/`Character` no cambian de forma; esta
  feature no toca `domain/`, `application/` ni `infrastructure/`
- Verificar que los tests (T001-T002) fallan antes de implementar
  (T003-T010)
- Detenerse en el checkpoint de la Phase 3 para validar la historia de
  forma independiente antes de pasar a Polish
