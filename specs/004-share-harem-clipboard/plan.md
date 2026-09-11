# Implementation Plan: Compartir Harem por Portapapeles

**Branch**: `004-share-harem-clipboard` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-share-harem-clipboard/spec.md`

## Summary

Agregar, a la derecha del header (junto al control de perfil ya
existente), una barra horizontal de iconos redondos de acciones rápidas
con un único icono en esta iteración: "Compartir harem". Al tocarlo, la
app serializa el harem del perfil activo al mismo formato de texto que
ya reconoce `parseHaremMessage` al dar de alta un perfil por pegado
(encabezado `"<alias>'s harem"`, encabezados de serie y líneas de
personaje con claim rank/kakera/imagen), copia ese texto al portapapeles
con manejo explícito de fallback (Principio VI de la constitución), y le
muestra al usuario un feedback visible de éxito o error. No se agrega
backend, no se muta ningún `Profile`/`Harem` persistido — es una
funcionalidad de lectura + efecto de portapapeles sobre el perfil activo
ya cargado en memoria/`localStorage`.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (proyecto existente, sin cambios)

**Primary Dependencies**: React 19.2, `styled-components` 6.5, `lucide-react`
1.44 (todas ya instaladas — esta feature no agrega ninguna dependencia
nueva a `package.json`)

**Storage**: N/A para esta feature — solo lee el `Profile`/`Harem` activo
ya persistido en `localStorage` por `001`/`002`/`003`; no agrega ni
modifica claves de almacenamiento.

**Testing**: Vitest 5 + `@testing-library/react` 16 + `jsdom` (stack de
test existente, sin cambios)

**Target Platform**: SPA client-only en navegador, desktop y mobile
(touch), debe seguir funcionando offline salvo la propia acción de
copiado (que es 100% local al navegador, no requiere red)

**Project Type**: Aplicación web de una sola página (monolito modular
DDD ya establecido: `domain/application/infrastructure/presentation/` +
`shared/`)

**Performance Goals**: sin objetivo nuevo más allá del existente; la
serialización es una operación O(n) sobre el harem, disparada solo al
tocar el icono (no en cada render), por lo que el costo es despreciable
incluso con harems de 200+ personajes (Principio III)

**Constraints**:
- El texto generado DEBE reflejar el orden actual (persistido/renderizado)
  de series y personajes del harem activo, nunca un orden distinto
  (Principio II — "Integridad del Output" aplica también a este nuevo
  tipo de output, no solo al comando de Mudae).
- El copiado al portapapeles DEBE degradarse con gracia si la API de
  Clipboard no está disponible o falla (Principio VI): no hay bloqueo
  duro en "no se puede copiar", siempre hay un camino de fallback.
- No se modifica el comportamiento existente de `parseHaremMessage` /
  `createProfileFromPaste` (pegar sigue funcionando exactamente igual).

**Scale/Scope**: mismo orden de magnitud que el resto de la app (harems
de hasta 200+ personajes, ver Principio III); alcance de esta iteración
limitado a un solo icono de acción (compartir), dejando la barra de
iconos preparada para sumar más acciones en features futuras del mismo
conjunto (fuera de alcance acá).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Persistencia Local Automática | No aplica: esta feature no crea, edita ni borra ningún `Profile`/`Harem` — solo lee el perfil activo ya persistido. No hay nuevo estado que requiera guardarse. | PASS (N/A) |
| II. Integridad del Output (Orden = Comando) | Aplica directamente: el texto copiado es un "comando" que otro usuario va a pegar. `formatHaremMessage` (Fase 1) DEBE iterar `profile.harem.series`/`series.characters` en su orden de array actual, sin reordenar ni tomar un snapshot separado del que ya renderiza `HaremView`. Se agrega un test que reordena vía los casos de uso existentes (`reorderSeries`/`reorderCharactersInSeries` de `003`) y verifica que el texto generado refleja el nuevo orden. | PASS (por diseño, verificado con test) |
| III. Rendimiento en Listas Grandes | La serialización es una función pura O(n), ejecutada una sola vez por click del usuario (no reactiva, no en cada render de `HaremView`). No agrega ningún re-render a la lista existente. | PASS |
| IV. Simplicidad del Stack | No se agrega backend, autenticación ni base de datos remota; no se agrega ninguna dependencia nueva (se reutiliza `lucide-react` y el `Modal` genérico ya existentes). | PASS |
| V. Diseño Responsive y Touch-First | El nuevo icono redondo y la barra que lo contiene deben ser usables por touch (tamaño de tap-target adecuado) y no deben desbordar ni romper el header en viewports angostos (~390px); se valida manualmente en `quickstart.md`. | PASS (a validar en Fase de implementación/QA) |
| VI. Confiabilidad del Copiado al Portapapeles | Es el principio más directamente gobernante de esta feature. Se diseña un fallback en 3 niveles (Clipboard API → `execCommand('copy')` legacy → diálogo de selección manual reutilizando el `Modal` genérico) y feedback visual explícito de éxito/error (nuevo componente `Toast`), sin nunca copiar en silencio. | PASS (núcleo del diseño de Fase 1) |
| VII. Componentes Pequeños de Responsabilidad Única | Se crean componentes nuevos, chicos y de responsabilidad única (`HeaderActions`, `ShareHaremButton`, `Toast`, `ManualCopyDialog`), cada uno en su carpeta `index.tsx`+`styles.tsx`, sin `React.FC`, con interface `I<Componente>` en `index.tsx`, arrow function y `export default` al final — mismo patrón que componentes existentes (`ProfileCard`, `Modal`). | PASS (por diseño) |

No hay violaciones que requieran justificación → no aplica la sección
"Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/004-share-harem-clipboard/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md        # Fase 1 (/speckit-plan)
├── quickstart.md        # Fase 1 (/speckit-plan)
├── contracts/           # Fase 1 (/speckit-plan)
│   ├── format-harem-message.md
│   ├── copy-to-clipboard.md
│   └── share-harem-ui.md
└── tasks.md             # Fase 2 (/speckit-tasks — NO se crea en este comando)
```

### Source Code (repository root)

Proyecto existente de una sola aplicación web (sin frontend/backend
separados). Estructura real ya vigente desde `001`/`002`/`003`, con los
archivos nuevos/afectados de esta feature marcados:

```text
src/
├── domain/
│   ├── parsing/
│   │   ├── parseHaremMessage.ts       # (sin cambios)
│   │   └── formatHaremMessage.ts      # NUEVO — inverso puro de parseHaremMessage
│   ├── harem/
│   │   └── Harem.ts                   # (sin cambios; se reutiliza countCharacters)
│   └── profile/
│       └── Profile.ts                 # (sin cambios)
├── application/
│   └── useCases/                      # (sin cambios — esta feature no persiste nada)
├── infrastructure/
│   └── storage/                       # (sin cambios)
├── presentation/
│   ├── copyToClipboard.ts             # NUEVO — utilidad de efecto (Clipboard API + fallback)
│   ├── components/
│   │   ├── Header/
│   │   │   ├── index.tsx              # MODIFICADO — monta <HeaderActions />
│   │   │   └── styles.tsx             # MODIFICADO — agrupa HeaderActions + ProfileButton a la derecha
│   │   ├── HeaderActions/             # NUEVO — barra horizontal de iconos redondos
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── ShareHaremButton/          # NUEVO — icono "Compartir harem" + feedback
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── Toast/                     # NUEVO — feedback de éxito/error, reutilizable
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── ManualCopyDialog/          # NUEVO — fallback de copiado manual (usa Modal)
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   └── Modal/                     # (sin cambios — se reutiliza tal cual)
│   └── context/
│       └── ProfilesContext.tsx        # (sin cambios — ya expone activeProfile)
└── shared/
    └── theme.ts                        # (sin cambios — zIndex.toast ya existía reservado)

tests/
├── unit/domain/
│   └── formatHaremMessage.test.ts     # NUEVO
├── unit/presentation/
│   └── copyToClipboard.test.ts        # NUEVO
└── component/presentation/
    ├── Header.test.tsx                 # MODIFICADO — agrega assertions de HeaderActions
    └── ShareHaremButton.test.tsx        # NUEVO
```

**Structure Decision**: se mantiene la arquitectura de monolito modular
DDD ya fijada por la constitución (`domain/application/infrastructure/
presentation/` + `shared/`), sin crear ninguna capa ni carpeta de nivel
superior nueva. Todo el trabajo nuevo es: (a) una función pura de
`domain/parsing/`, simétrica a la ya existente `parseHaremMessage`, y
(b) componentes de `presentation/` siguiendo el patrón de carpeta ya
establecido. No se toca `application/` ni `infrastructure/` porque la
feature no persiste ni muta ningún dato — es puramente lectura +
efecto de portapapeles.

## Complexity Tracking

*No aplica — el Constitution Check no encontró violaciones que requieran
justificación.*
