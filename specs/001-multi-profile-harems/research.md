# Research: Perfiles Múltiples con Harem Propio

**Feature**: `001-multi-profile-harems` | **Date**: 2026-09-11

El stack, la arquitectura (DDD por capas) y la convención de componentes ya
están fijados a nivel de proyecto en `.specify/memory/constitution.md`
(v1.2.0), no a nivel de feature. Esta feature no introduce ninguna
dependencia nueva fuera de lo ya pinneado por la constitución. Las
decisiones de esta sección son las que sí son específicas de esta feature
(parsing, testing, estructura de estado) y no estaban resueltas todavía.

## Decisión: versiones concretas del stack

- **Decision**: al hacer el scaffolding real con `npm create vite@latest
  -- --template react-ts`, la plantilla oficial instaló React 19.2 +
  TypeScript ~6.0 sobre Vite 8.3, con `styled-components` 6.x y
  `lucide-react` en su última versión estable.
- **Rationale**: son las versiones que la propia herramienta oficial
  entrega por defecto al día de la implementación; usarlas tal cual evita
  fijar a mano un major desactualizado y mantiene el proyecto alineado
  con la plantilla oficial de Vite.
- **Alternatives considered**: fijar a mano React 18.x/Vite 5.x (versión
  estimada antes del scaffolding real) — se descarta porque la plantilla
  oficial ya no ofrece esas versiones por defecto y no hay ninguna razón
  de esta feature para bajar el major; `domain/` sigue sin depender de
  React, así que una futura migración de major de React no lo afectaría
  de todos modos.
- **Nota sobre TypeScript 6 (`erasableSyntaxOnly`)**: la plantilla activa
  `erasableSyntaxOnly` en los `tsconfig.*.json`, lo que prohíbe sintaxis
  de TS que no sea "borrable" en tiempo de compilación (p. ej. `enum` y
  parameter properties de clases). El código de `domain/`/`application/`
  de esta feature ya está diseñado como tipos/interfaces + funciones
  puras (sin `enum` ni clases con parameter properties), así que no hay
  impacto.

## Decisión: testing

- **Decision**: Vitest + React Testing Library para tests unitarios (
  `domain/`, `application/`) y de componentes (`presentation/`). La
  verificación de viewport móvil (Principio V de la constitución) se hace
  de forma manual con el checklist de `quickstart.md`, usando el modo
  responsive del navegador; no se introduce un framework de e2e (Playwright/
  Cypress) para esta feature.
- **Rationale**: Vitest comparte configuración y motor con Vite (cero
  configuración adicional de bundler), y React Testing Library es el
  estándar de facto para testear componentes React sin acoplarse a
  detalles de implementación. Sumar un framework de e2e para una sola
  feature no se justifica todavía (Principio IV, simplicidad) — se puede
  reconsiderar si una feature futura (p. ej. el drag-and-drop) lo amerita.
- **Alternatives considered**: Playwright component testing (se descarta
  por ahora, mayor superficie de configuración); Jest (se descarta porque
  Vitest ya viene alineado con Vite y evita mantener dos configuraciones
  de transformación de TS/JSX distintas).

## Decisión: linting

- **Decision**: se usa `oxlint` (ya incluido por la plantilla oficial de
  Vite `react-ts` como `.oxlintrc.json` + script `npm run lint`), con las
  reglas de React/TypeScript que trae por defecto (`react/rules-of-hooks`
  en error, `react/only-export-components` en warning). No se agrega
  Prettier como formateador separado para esta feature.
- **Rationale**: `oxlint` es el linter que la propia plantilla oficial de
  Vite entrega por defecto a la fecha de este scaffolding, es
  compatible con buena parte de las reglas de ESLint y corre en Rust
  (mucho más rápido); sumar ESLint + Prettier encima sería duplicar
  herramienta sin necesidad real (Principio IV, simplicidad). Se puede
  reconsiderar sumar un formateador si el equipo lo pide explícitamente.
- **Alternatives considered**: ESLint + Prettier (decisión original de
  `plan.md`/`tasks.md` antes del scaffolding real) — se descarta porque
  reemplazaría una herramienta ya configurada y funcionando por una
  equivalente, sin beneficio concreto para esta feature.

## Decisión: parseo del mensaje de harem de Mudae

- **Decision**: el parseo vive como una función pura en
  `domain/parsing/parseHaremMessage.ts`, sin dependencias de React,
  `styled-components` ni `localStorage` (cumpliendo la regla de
  aislamiento de `domain/` de la constitución). Recibe el texto pegado
  (`string`) y devuelve un resultado discriminado: `{ ok: true, profile:
  ParsedProfile }` o `{ ok: false, reason }`. Reconoce tres tipos de línea
  mediante expresiones regulares ancladas por línea:
  - Encabezado de perfil: `^(.+)'s harem$` → nombre de perfil.
  - Encabezado de serie: `^(.+) - \d[\d,]*\/\d[\d,]*$` → nombre de serie
    (se descarta el resto).
  - Línea de personaje: `^#([\d,]+) - (.+?) (\d[\d,]*) ka - (https?:\/\/\S+)$`
    → claim rank, nombre, kakeras, URL de imagen; si no matchea el
    fragmento `\d+ ka`, se reintenta sin ese grupo para permitir kakeras
    ausente (ver FR-006).
  - Cualquier otra línea (blanco, espacio invisible, `Total value: ...`,
    `Imagen`, etc.) no matchea ninguno de los patrones anteriores y se
    descarta silenciosamente (FR-005).
- **Rationale**: mantener el parser como función pura en `domain/`
  permite testearlo exhaustivamente con el ejemplo real provisto por el
  usuario (y variaciones) sin levantar React ni tocar `localStorage`, y
  respeta la regla de aislamiento de capa ya fijada en la constitución.
- **Alternatives considered**: un parser basado en un mini-tokenizer línea
  por línea con máquina de estados — se descarta por ahora por ser más
  código del necesario para tres patrones de línea bien delimitados; se
  puede migrar a esa alternativa sin tocar el resto de las capas si el
  formato de Mudae se vuelve más complejo.

## Decisión: forma del estado global (Context API)

- **Decision**: un único `ProfilesContext` en `presentation/context/`
  expone el estado de perfiles (lista, cuál está activo) y las acciones de
  aplicación (`createProfileFromPaste`, `renameProfile`, `deleteProfile`,
  `activateProfile`) ya conectadas al repositorio de `infrastructure/`. Los
  componentes de `presentation/` solo consumen este contexto vía un hook
  `useProfiles()`; no acceden a `localStorage` ni a los casos de uso de
  `application/` directamente.
- **Rationale**: un solo contexto alcanza para el tamaño de estado de esta
  feature (perfiles + cuál está activo) y evita el boilerplate de repartir
  el estado en varios contextos sin necesidad real (Principio IV). El
  contexto es la única frontera entre `presentation/` y el resto de las
  capas, lo que mantiene testeables `domain/` y `application/` sin React.
- **Alternatives considered**: múltiples contextos separados
  (`ProfileListContext` + `ActiveProfileContext`) — se descarta por
  agregar complejidad sin necesidad concreta en esta feature; se puede
  partir más adelante si el contexto único se vuelve un cuello de botella
  de re-renders.

## Decisión: dónde vive el "harem vacío" cuando hay 0 perfiles

- **Decision**: la ausencia de perfiles NO se modela como un perfil
  especial ni un estado por defecto en `domain/`; es simplemente una lista
  vacía de perfiles en el contexto. `presentation/` decide, en base a esa
  lista vacía, renderizar `PasteHaremScreen` en lugar de `HaremView`.
- **Rationale**: mantiene `domain/` libre de conceptos de UI ("pantalla
  inicial"); la decisión de qué mostrar es pura responsabilidad de
  `presentation/`, consistente con el aislamiento de capas de la
  constitución.
- **Alternatives considered**: modelar un "perfil nulo"/sentinel en
  `domain/` — se descarta por introducir un caso especial artificial que
  complica el resto de las reglas de negocio (p. ej. FR-012 sobre "como
  máximo un perfil activo") sin beneficio real.

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el Technical
Context del plan.
