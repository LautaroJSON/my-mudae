# Data Model: Perfiles Múltiples con Harem Propio

**Feature**: `001-multi-profile-harems` | **Date**: 2026-09-11

Todas las entidades viven en `domain/` como tipos/clases puros (sin
dependencias de React, `styled-components` ni `localStorage`, por
Restricciones Técnicas de la constitución). `infrastructure/` es la única
capa que sabe cómo serializar/deserializar estos tipos hacia `localStorage`.

## Perfil (`Profile`)

Representa una cuenta/servidor separado del usuario. Fuente: FR-001 a
FR-003, FR-008 a FR-016, FR-023, FR-024.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Identificador único, generado al crear el perfil (no viene del texto pegado). |
| `name` | `string` | Sí | Extraído de la primera línea del pegado (`<name>'s harem`) al crear; editable después (FR-009). No se valida unicidad entre perfiles (Assumptions). |
| `isActive` | `boolean` | Sí | A lo sumo un `Profile` con `isActive: true` en toda la colección (FR-012). |
| `harem` | `Harem` | Sí | Relación 1:1; un `Profile` tiene exactamente un `Harem` (FR-016). |
| `createdAt` | `string` (ISO 8601) | Sí | Para poder listar/ordenar perfiles de forma estable; no pedido explícitamente por la spec, pero necesario para un orden determinístico de la lista de perfiles. |

**Invariantes**:
- No existe un `Profile` sin `Harem` asociado (se crean atómicamente juntos, ver FR-002).
- Eliminar un `Profile` elimina su `Harem` completo (FR-011) — no hay borrado en cascada parcial.
- Como máximo un `Profile` de toda la colección tiene `isActive: true` (FR-012); la colección completa puede tener cero `Profile`s (FR-010).

## Harem

La colección de series/personajes de un `Profile`. Fuente: FR-016, FR-017.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `profileId` | `string` | Sí | FK lógica al `Profile` dueño; el `Harem` no se comparte ni se reutiliza entre perfiles (FR-016). |
| `series` | `Series[]` | Sí (puede ser `[]`) | Nunca contiene una `Series` sin personajes (ver invariante de `Series`). |

**Invariantes**:
- Cada `Character` del harem pertenece a exactamente una `Series` de este arreglo (FR-017).

## Serie (`Series`)

Agrupador con nombre dentro de un `Harem`. Fuente: FR-017, FR-018, FR-022.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Identificador único, generado al crear. |
| `name` | `string` | Sí | Extraído del encabezado `<Nombre de Serie> - X/Y` del pegado (solo el nombre; `X/Y` se descarta, ver Assumptions). |
| `characters` | `Character[]` | Sí (mínimo 1) | Una `Series` con 0 personajes se elimina automáticamente (FR-022); por lo tanto nunca existe persistida con el arreglo vacío. |

**Invariantes**:
- `characters.length >= 1` siempre que la `Series` exista; al llegar a 0 tras una eliminación, la `Series` se elimina del `Harem`, no queda como registro vacío (FR-022, edge case).

## Personaje (`Character`)

Pertenece a exactamente una `Series`. Fuente: FR-017, FR-019 a FR-021.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Identificador único, generado al crear. |
| `name` | `string` | Sí | Extraído de la línea de personaje del pegado. No hay `Character` sin `name` (FR-019). |
| `imageUrl` | `string` (URL) | Sí | Extraído de la línea de personaje. No hay `Character` sin `imageUrl` (FR-019). |
| `kakera` | `number \| undefined` | No | Extraído cuando la línea lo incluye reconociblemente; `undefined` si Mudae todavía no lo calculó (FR-006, FR-020). |
| `claimRank` | `string \| undefined` | No | Formato `"#N"` (con el `#` incluido, tal como aparece en el pegado), extraído de la línea de personaje (FR-021). |

**Invariantes**:
- `name` e `imageUrl` siempre presentes; un intento de crear un `Character` sin alguno de los dos se rechaza a nivel de parsing, no se persiste nunca un `Character` incompleto (FR-019, SC-005).
- Se permiten `Character` duplicados (mismo `name`/`imageUrl`) dentro de la misma `Series` o entre `Series` distintas (Assumptions) — no hay restricción de unicidad.

## Resultado de parseo (`ParsedHaremMessage`)

Value object interno de `domain/parsing/`, no persistido — es la salida
intermedia del parser antes de construir un `Profile` real. Fuente:
FR-004 a FR-008.

```ts
type ParsedHaremMessage =
  | { ok: true; profileName: string; series: ParsedSeries[] }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' };

interface ParsedSeries {
  name: string;
  characters: ParsedCharacter[];
}

interface ParsedCharacter {
  claimRank?: string;
  name: string;
  kakera?: number;
  imageUrl: string;
}
```

El caso `ok: false` corresponde a FR-007 (texto sin ninguna línea de serie
ni de personaje reconocible) y es lo único que `application/` necesita
para decidir no crear ningún `Profile` (SC-006).

## Relaciones (resumen)

```
Profile (0..N, colección global)
  └── 1:1 → Harem
              └── 1:N → Series (0..N; nunca con characters vacío una vez creada)
                          └── 1:N → Character (1..N; name + imageUrl obligatorios)
```

- **Profile ↔ Harem**: 1:1, creación atómica, borrado en cascada (FR-011, FR-016).
- **Harem ↔ Series**: 1:N, una `Series` se autoelimina al quedar sin personajes (FR-022).
- **Series ↔ Character**: 1:N, cada `Character` pertenece exactamente a una `Series` (FR-017).
