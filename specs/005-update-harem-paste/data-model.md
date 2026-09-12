# Data Model: Actualizar Harem por Re-Pegado

**Feature**: `005-update-harem-paste` | **Date**: 2026-09-11

Esta feature no cambia la forma de ningún dato persistido. Reutiliza sin
modificar `Profile`, `Harem`, `Series`, `Character` (`001`/`002`/`003`)
y `ParsedHaremMessage`/`ParsedSeries`/`ParsedCharacter`
(`domain/parsing/parseHaremMessage.ts`, `001`). Solo se documenta el
resultado nuevo del caso de uso.

## Nuevo: `UpdateActiveProfileHaremResult` (`application/useCases/updateActiveProfileHarem.ts`)

```ts
type UpdateActiveProfileHaremResult =
  | { ok: true }
  | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }
  | { ok: false; reason: 'PROFILE_MISMATCH'; pastedProfileName: string }
  | { ok: false; reason: 'NO_ACTIVE_PROFILE' }
```

- `ok: true`: el harem del perfil activo se sobrescribió con éxito
  (`syncHarem` aplicado y persistido).
- `NO_VALID_SERIES_OR_CHARACTER`: el texto pegado no es reconocible como
  un harem de Mudae (mismo motivo que ya usa
  `CreateProfileFromPasteResult` de `001`, ver
  `parseHaremMessage.ts`) — no se modifica nada.
- `PROFILE_MISMATCH`: el texto es un harem válido, pero
  `pastedProfileName` (el nombre extraído de su encabezado) no coincide
  con el `id` del perfil activo — no se modifica nada. `pastedProfileName`
  se expone para que la UI muestre exactamente qué nombre detectó
  (SC-004).
- `NO_ACTIVE_PROFILE`: no hay ningún perfil activo al momento de invocar
  el caso de uso — rama defensiva; la UI solo ofrece esta acción cuando
  sí hay un perfil activo (FR-001), así que en la práctica esta rama es
  inalcanzable desde el flujo normal.

## Nuevo: `updateActiveProfileHarem` (función de caso de uso)

```ts
function updateActiveProfileHarem(
  repository: ProfileRepository,
  activeProfileId: string,
  rawText: string,
): UpdateActiveProfileHaremResult
```

- **Entrada**: el mismo `ProfileRepository` ya inyectado en
  `ProfilesContext`, el `id` del perfil activo (no su `alias`, ver
  `research.md`), y el texto crudo pegado por el usuario.
- **Efecto**: en el único caso de éxito, reemplaza `harem` del perfil
  cuyo `id === activeProfileId` por `syncHarem(harem actual, parsed.series)`
  y persiste el array completo de perfiles vía `repository.save()`
  (mismo contrato "leer todo / guardar todo" ya usado por el resto de
  casos de uso). Ningún otro perfil del repositorio se modifica en
  ningún caso.
- **No cambia** `isActive`, `alias`, `order` ni `createdAt` de ningún
  perfil — a diferencia de `createProfileFromPaste`, esta operación
  nunca activa/desactiva perfiles (el perfil objetivo ya está activo por
  definición).

## Estado local de `UpdateHaremModal` (no persistido)

```ts
type UpdateHaremModalView =
  | { kind: 'paste'; formatError?: string }
  | { kind: 'mismatch'; pastedProfileName: string }
```

- `paste`: vista por defecto (zona de pegado); `formatError`, si está
  presente, muestra el mensaje de formato inválido sin abandonar la
  zona de pegado (mismo patrón que `PasteHaremScreen`).
- `mismatch`: vista de advertencia con el nombre detectado; su botón
  "Reintentar" vuelve a `{ kind: 'paste' }` (limpio, sin `formatError`).
- Al recibir `ok: true`, el modal no transiciona a ningún estado interno
  nuevo: invoca `onUpdated()` y el componente padre (`UpdateHaremButton`)
  decide cerrar el modal y mostrar el `Toast`.
