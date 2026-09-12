# Implementation Plan: Actualizar Harem por Re-Pegado

**Branch**: `005-update-harem-paste` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-update-harem-paste/spec.md`

## Summary

Agregar un segundo icono ("Actualizar harem") a la barra de iconos del
header introducida por `004`, que abre un modal para volver a pegar el
mensaje de harem de Mudae. Si el nombre de perfil del texto pegado
coincide exactamente con el `id` del perfil activo, se sobrescribe su
harem con la misma lógica de sincronización por claim rank que ya usa la
app (`syncHarem`, de `002`); si no coincide (con el activo o con
cualquier otro perfil ya existente), se bloquea la actualización y se
muestra una advertencia con el nombre detectado, sin tocar ningún dato
persistido. Reutiliza el modal genérico, `syncHarem`, `parseHaremMessage`
y el `Toast` de `004` — no agrega ninguna dependencia nueva ni cambia la
forma de ningún dato persistido.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (sin cambios)

**Primary Dependencies**: React 19.2, `styled-components` 6.5,
`lucide-react` 1.44 (todas ya instaladas — esta feature no agrega
ninguna dependencia nueva)

**Storage**: `localStorage` vía el `ProfileRepository` ya existente; esta
feature solo agrega un nuevo caso de uso que lee y vuelve a guardar el
mismo array de `Profile[]` (mismo mecanismo de `002`/`003`), sin cambiar
ninguna clave ni forma de almacenamiento.

**Testing**: Vitest 5 + `@testing-library/react` 16 + `jsdom` (sin
cambios)

**Target Platform**: SPA client-only en navegador, desktop y mobile
(touch), debe funcionar offline

**Project Type**: Aplicación web de una sola página (monolito modular
DDD ya establecido)

**Performance Goals**: sin objetivo nuevo; la actualización es una
operación puntual disparada por una acción explícita del usuario (pegar
dentro de un modal), con el mismo costo que ya tiene `syncHarem` en el
flujo de alta de perfiles (validado hasta 200+ personajes en `003`)

**Constraints**:
- Una discordancia de nombre de perfil DEBE bloquear la actualización
  por completo — nunca debe sobrescribir el harem del perfil activo, ni
  crear o modificar silenciosamente ningún otro perfil de la app
  (riesgo explícito señalado en `spec.md`).
- No se modifica el comportamiento existente de `createProfileFromPaste`
  (el flujo de alta de perfiles sigue funcionando exactamente igual);
  esta feature agrega un caso de uso nuevo, no reutiliza ese directamente.
- El criterio de reconciliación de personajes (agregar/actualizar/
  eliminar) es exactamente el mismo `syncHarem` ya existente — no se
  introduce un segundo algoritmo de sincronización.

**Scale/Scope**: mismo orden de magnitud que el resto de la app (harems
de hasta 200+ personajes); alcance limitado a un segundo icono dentro de
la barra ya introducida por `004`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Resultado |
|---|---|---|
| I. Persistencia Local Automática | Al actualizar con éxito, el nuevo harem se persiste de inmediato vía `ProfileRepository.save()` (mismo mecanismo ya usado por todos los casos de uso existentes), sin requerir ninguna acción de "guardar" adicional. | PASS |
| II. Integridad del Output (Orden = Comando) | No aplica directamente (esta feature no genera ningún comando/texto para copiar); sí aplica su espíritu al orden de series/personajes tras sincronizar: `syncHarem` ya agrupa por el pegado más reciente sin depender de ningún snapshot separado — se reutiliza tal cual, sin cambios. | PASS (N/A al output, reutiliza lógica ya conforme) |
| III. Rendimiento en Listas Grandes | La actualización reutiliza `syncHarem`, ya validado con harems de 200+ personajes en `003`; es una operación puntual (un pegado → un `save()`), no una interacción continua de UI (no hay drag-and-drop ni re-render por frame involucrado). | PASS |
| IV. Simplicidad del Stack | No se agrega backend, autenticación ni dependencia nueva; se reutilizan `Modal`, `Toast`, `syncHarem` y `parseHaremMessage` ya existentes. | PASS |
| V. Diseño Responsive y Touch-First | El nuevo icono y el modal de pegado deben ser usables por touch (mismo mecanismo de `contentEditable` + evento `paste` que ya usa `PasteHaremScreen`, ya validado en mobile por `001`/`002`); se valida manualmente en `quickstart.md`. | PASS (a validar en Fase de implementación/QA) |
| VI. Confiabilidad del Copiado al Portapapeles | No aplica: esta feature solo **lee** del portapapeles (pegado), no escribe — el Principio VI gobierna la operación inversa (`004`). El pegado en sí reutiliza el mismo mecanismo nativo del navegador (evento `paste`) ya usado por `PasteHaremScreen`, sin ningún fallback propio necesario. | PASS (N/A) |
| VII. Componentes Pequeños de Responsabilidad Única | Se crean componentes nuevos y chicos (`UpdateHaremButton`, `UpdateHaremModal`), cada uno en su carpeta `index.tsx`+`styles.tsx`, sin `React.FC`, con interface `I<Componente>` cuando corresponde, arrow function y `export default` al final — mismo patrón que `ShareHaremButton`/`ManualCopyDialog` de `004`. | PASS (por diseño) |

No hay violaciones que requieran justificación → no aplica la sección
"Complexity Tracking".

## Project Structure

### Documentation (this feature)

```text
specs/005-update-harem-paste/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/            # Fase 1 (/speckit-plan)
│   ├── update-active-profile-harem.md
│   └── update-harem-ui.md
└── tasks.md              # Fase 2 (/speckit-tasks — NO se crea acá)
```

### Source Code (repository root)

Mismo proyecto único ya vigente. Archivos nuevos/afectados de esta
feature marcados:

```text
src/
├── domain/
│   └── harem/
│       └── syncHarem.ts               # (sin cambios — se reutiliza tal cual)
├── application/
│   ├── ports/
│   │   └── ProfileRepository.ts       # (sin cambios)
│   └── useCases/
│       └── updateActiveProfileHarem.ts # NUEVO
├── infrastructure/
│   └── storage/                        # (sin cambios)
├── presentation/
│   ├── components/
│   │   ├── HeaderActions/
│   │   │   └── index.tsx               # MODIFICADO — monta <UpdateHaremButton /> junto a <ShareHaremButton />
│   │   ├── UpdateHaremButton/          # NUEVO — icono "Actualizar harem" + feedback
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── UpdateHaremModal/           # NUEVO — modal de re-pegado + advertencia de discordancia
│   │   │   ├── index.tsx
│   │   │   └── styles.tsx
│   │   ├── Toast/                      # (sin cambios — se reutiliza tal cual, de 004)
│   │   └── Modal/                      # (sin cambios — se reutiliza tal cual)
│   └── context/
│       └── ProfilesContext.tsx         # MODIFICADO — expone updateActiveProfileHarem
└── shared/
    └── theme.ts                         # (sin cambios)

tests/
├── unit/application/
│   └── updateActiveProfileHarem.test.ts # NUEVO
└── component/presentation/
    └── UpdateHaremModal.test.tsx         # NUEVO
```

**Structure Decision**: se mantiene la arquitectura de monolito modular
DDD ya fijada. Todo el trabajo nuevo es: (a) un caso de uso de
`application/`, simétrico a `createProfileFromPaste` pero con matching
estrictamente escopeado al perfil activo, y (b) dos componentes nuevos
de `presentation/` siguiendo el patrón de carpeta ya establecido en
`004`. No se toca `domain/` (se reutiliza `syncHarem`/`parseHaremMessage`
sin cambios) ni `infrastructure/`.

## Complexity Tracking

*No aplica — el Constitution Check no encontró violaciones que requieran
justificación.*
