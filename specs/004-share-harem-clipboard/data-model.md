# Data Model: Compartir Harem por Portapapeles

**Feature**: `004-share-harem-clipboard` | **Date**: 2026-09-11

Esta feature no cambia la forma de ningún dato persistido. Reutiliza sin
modificar `Profile`, `Harem`, `Series`, `Character` (`domain/profile/
Profile.ts`, `domain/harem/Harem.ts` y `Series.ts`/`Character.ts`) tal
como quedaron después de `001`/`002`/`003`. Solo se documentan los tipos
y funciones nuevas.

## Entrada: `Profile` (sin cambios, referencia)

```ts
interface Profile {
  id: string
  alias: string
  isActive: boolean
  harem: Harem
  createdAt: string
  order: number
}

interface Harem {
  profileId: string
  series: Series[]
}

interface Series {
  id: string
  name: string
  characters: Character[]
}

interface Character {
  id: string
  name: string
  imageUrl: string
  kakera?: number
  claimRank?: string
}
```

## Nuevo: `formatHaremMessage` (`domain/parsing/formatHaremMessage.ts`)

```ts
function formatHaremMessage(profile: Profile): string
```

- **Entrada**: un `Profile` completo (típicamente el `activeProfile` que
  ya expone `useProfiles()`).
- **Salida**: un `string` multilínea, en el mismo formato de texto que
  `parseHaremMessage` reconoce como entrada (ver
  `contracts/format-harem-message.md` para el detalle línea por línea).
- **Pura**: no depende de React, `styled-components`, `localStorage` ni
  `navigator`; determinística para el mismo `Profile` de entrada.
- **No muta** el `Profile` recibido ni ningún estado global.

No introduce ningún tipo intermedio nuevo — a diferencia de
`parseHaremMessage` (que produce `ParsedHaremMessage`/`ParsedSeries`/
`ParsedCharacter` porque su entrada es texto sin validar), esta función
ya parte de datos válidos y tipados (`Profile`), así que su salida es
directamente el `string` final.

## Nuevo: `copyTextToClipboard` (`presentation/copyToClipboard.ts`)

```ts
async function copyTextToClipboard(text: string): Promise<boolean>
```

- **Entrada**: el texto ya generado por `formatHaremMessage`.
- **Salida**: `true` si el texto quedó en el portapapeles del sistema
  por cualquiera de los dos mecanismos programáticos soportados
  (Clipboard API o `execCommand('copy')` legacy); `false` si ninguno de
  los dos funcionó (el caller debe entonces ofrecer el fallback de
  selección manual — ver `contracts/copy-to-clipboard.md`).
- **No es puro** (usa `navigator`/`document`, vive en `presentation/`
  por eso, no en `domain/`), pero no tiene efectos sobre el estado de
  perfiles/harems — solo sobre el portapapeles del navegador.

## Nuevo: estado local de feedback de `ShareHaremButton`

No es una entidad persistida; es estado de componente:

```ts
type ShareFeedbackStatus = 'idle' | 'success' | 'error'
```

- `idle` → `success`: al resolver `copyTextToClipboard` con `true`.
- `idle` → `error`: al resolver `copyTextToClipboard` con `false` **y**
  el usuario cierra `ManualCopyDialog` sin haber podido confirmar el
  copiado (ver `contracts/share-harem-ui.md` para el flujo exacto); o
  ante cualquier excepción inesperada al generar el texto.
- `success`/`error` → `idle`: automáticamente tras un `setTimeout` breve
  (feedback no bloqueante, Principio VI), o al desmontarse el
  componente.

## Función de soporte reutilizada (sin cambios): `countCharacters`

`domain/harem/Harem.ts` ya expone:

```ts
function countCharacters(harem: Harem): number
```

Se reutiliza tal cual (introducida en `002`) para decidir si
`ShareHaremButton` debe habilitarse: deshabilitado cuando no hay
`activeProfile` o `countCharacters(activeProfile.harem) === 0` (FR-007).
No se agrega ninguna función nueva de conteo/validación.
