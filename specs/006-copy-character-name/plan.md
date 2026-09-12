# Implementation Plan: Copiar Nombre de Personaje al Pasar el Mouse

**Branch**: `006-copy-character-name` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-copy-character-name/spec.md`

## Summary

Agregar un botón redondo pequeño, superpuesto en la esquina superior
derecha de cada `CharacterCard`, que copia `character.name` al
portapapeles. Visible al pasar el mouse (o con foco por teclado) en
dispositivos con hover real; siempre visible en dispositivos táctiles
(resuelto con una media query CSS, sin detección de dispositivo por
JS). Reutiliza `copyToClipboard`, `Toast` y `ManualCopyDialog` de `004`
sin modificarlos. El riesgo central de esta feature — que el nuevo
botón, al estar montado sobre la superficie de arrastre existente de
`CharacterListItem` (`003`), dispare un reordenamiento accidental — se
resuelve deteniendo la propagación del evento `pointerdown` del botón,
sin tocar `SeriesGroup` ni el sensor de `@dnd-kit` en absoluto.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (sin cambios)

**Primary Dependencies**: React 19.2, `styled-components` 6.5,
`lucide-react` 1.44, `@dnd-kit/core`/`sortable`/`utilities` (todas ya
instaladas — esta feature no agrega ninguna dependencia nueva; no se
modifica ninguna configuración de `@dnd-kit`)

**Storage**: N/A — esta feature no lee ni escribe ningún dato
persistido; solo lee `character.name` ya presente en memoria.

**Testing**: Vitest 5 + `@testing-library/react` 16 + `jsdom` (sin
cambios)

**Target Platform**: SPA client-only, desktop y mobile (touch)

**Project Type**: Aplicación web de una sola página (monolito modular
DDD ya establecido)

**Performance Goals**: la revelación del botón es puramente CSS
(`:hover`/`:focus-within`/media query), sin ningún listener de JS por
tarjeta agregado para mostrarlo — el costo adicional por tarjeta en un
harem de 200+ personajes es despreciable (Principio III); se valida
extendiendo el test de performance ya existente de `003`.

**Constraints**:
- El reordenamiento por arrastre de personajes (`003`) DEBE seguir
  funcionando exactamente igual que antes de esta feature, incluso
  arrastrando desde cerca o sobre otras partes de la misma tarjeta
  (SC-003 de `spec.md`) — la solución al conflicto de arrastre no puede
  cambiar el comportamiento de arrastre existente en ningún otro punto
  de la tarjeta.
- El botón DEBE estar disponible sin depender de un gesto de hover en
  dispositivos que no lo soportan (Principio V), resuelto sin JS de
  detección de dispositivo.
- No se modifica el formato ni el mecanismo de `copyToClipboard`/
  `Toast`/`ManualCopyDialog` ya existentes de `004`.

**Scale/Scope**: mismo orden de magnitud que el resto de la app (harems
de 200+ personajes); alcance limitado a un botón por `CharacterCard`, sin
tocar la lógica de reordenamiento en sí.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Persistencia Local Automática | No aplica: esta feature no crea, edita ni persiste ningún `Profile`/`Harem` — solo lee `character.name` ya cargado en memoria. | PASS (N/A) |
| II. Integridad del Output (Orden = Comando) | No aplica: el texto copiado (`character.name`) no depende de ningún orden de lista — es un valor fijo por personaje, no una serialización de una colección ordenada. | PASS (N/A) |
| III. Rendimiento en Listas Grandes | El botón nuevo se revela con CSS puro (`:hover`/`:focus-within`/media query), sin JS adicional por tarjeta; `CharacterCard` sigue memoizado sin cambios en su estrategia de memoización. Se extiende `HaremView.performance.test.tsx` (de `003`) para confirmar que un harem de 200+ personajes con el botón nuevo en cada tarjeta sigue renderizando sin degradación. | PASS (verificado con test) |
| IV. Simplicidad del Stack | No se agrega ninguna dependencia nueva; se reutilizan `copyToClipboard`, `Toast` y `ManualCopyDialog` de `004` sin modificarlos, y `@dnd-kit` ya instalado sin cambiar su configuración. | PASS |
| V. Diseño Responsive y Touch-First | Es el principio más directamente gobernante del diseño visual de esta feature: el botón se revela por hover/foco en dispositivos con puntero fino (`@media (hover: hover) and (pointer: fine)`) y permanece siempre visible en el resto (touch), sin lógica de detección de dispositivo en JS. Se valida manualmente en viewport móvil en `quickstart.md`. | PASS (por diseño CSS) |
| VI. Confiabilidad del Copiado al Portapapeles | Reutiliza exactamente el mismo flujo de `ShareHaremButton` (`004`): `copyToClipboard` → éxito muestra `Toast`, fallo abre `ManualCopyDialog` (fallback de selección manual) — sin inventar un segundo mecanismo de copiado ni de fallback. | PASS (reutiliza diseño ya conforme) |
| VII. Componentes Pequeños de Responsabilidad Única | Se agrega un componente nuevo y chico, `CopyNameButton` (`index.tsx`+`styles.tsx`, sin `React.FC`, interface `ICopyNameButton`, arrow function, `export default` al final), responsable únicamente de mostrar el botón y disparar el copiado/feedback — `CharacterCard` se mantiene presentacional, delegándole esa responsabilidad en vez de absorberla. | PASS (por diseño) |

No hay violaciones que requieran justificación → no aplica la sección
"Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/006-copy-character-name/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   └── copy-name-button-ui.md
└── tasks.md              # Fase 2 (/speckit-tasks — NO se crea acá)
```

### Source Code (repository root)

Mismo proyecto único ya vigente. Archivos nuevos/afectados de esta
feature marcados:

```text
src/
├── presentation/
│   ├── copyToClipboard.ts             # (sin cambios — se reutiliza tal cual, de 004)
│   └── components/
│       ├── CharacterCard/
│       │   ├── index.tsx              # MODIFICADO — monta <CopyNameButton />
│       │   └── styles.tsx             # MODIFICADO — Card gana position:relative + regla de revelado por hover/focus-within
│       ├── CopyNameButton/            # NUEVO — botón de copiar nombre + feedback
│       │   ├── index.tsx
│       │   └── styles.tsx
│       ├── Toast/                     # (sin cambios — se reutiliza tal cual, de 004)
│       ├── ManualCopyDialog/          # (sin cambios — se reutiliza tal cual, de 004)
│       └── CharacterListItem/         # (sin cambios — el arrastre sigue montado igual; el fix vive en CopyNameButton)
└── shared/
    └── theme.ts                        # (sin cambios)

tests/
└── component/presentation/
    ├── CharacterCard.copyName.test.tsx      # NUEVO
    └── HaremView.performance.test.tsx       # MODIFICADO — confirma que el botón nuevo no degrada el render de 200+ personajes
```

**Structure Decision**: se mantiene la arquitectura ya vigente. Todo el
trabajo nuevo es de `presentation/`: un componente chico nuevo
(`CopyNameButton`) y una modificación puntual a `CharacterCard` para
montarlo. No se toca `domain/`, `application/` ni `infrastructure/` —
esta feature no involucra ningún dato persistido. `CharacterListItem`/
`SeriesGroup` (la infraestructura de arrastre de `003`) tampoco se
modifican: el conflicto de arrastre se resuelve enteramente dentro de
`CopyNameButton`.

## Complexity Tracking

*No aplica — el Constitution Check no encontró violaciones que requieran
justificación.*
