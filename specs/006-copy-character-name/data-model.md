# Data Model: Copiar Nombre de Personaje al Pasar el Mouse

**Feature**: `006-copy-character-name` | **Date**: 2026-09-12

Esta feature no cambia la forma de ningún dato persistido ni agrega
ninguna entidad de dominio. Solo lee `Character.name` (`domain/harem/
Character.ts`, sin cambios) y reutiliza tipos/funciones ya existentes de
`004`.

## Reutilizado sin cambios: `copyTextToClipboard`

```ts
async function copyTextToClipboard(text: string): Promise<boolean>
```

(`presentation/copyToClipboard.ts`, `004`) — se invoca con
`character.name` como `text`. Ver `contracts/copy-to-clipboard.md` de
`004` para su contrato completo (Clipboard API → fallback
`execCommand` → `false` si ambos fallan).

## Reutilizados sin cambios: `Toast` y `ManualCopyDialog`

- `Toast` (`presentation/components/Toast`, `004`): `{ variant:
  'success' | 'error'; message: string; onDismiss: () => void }`.
- `ManualCopyDialog` (`presentation/components/ManualCopyDialog`, `004`):
  `{ text: string; onConfirm: () => void; onClose: () => void }`.

## Nuevo: estado local de `CopyNameButton` (no persistido)

```ts
type CopyNameFeedback = { variant: 'success'; message: string } | null
```

- `null` (por defecto): sin feedback visible.
- `{ variant: 'success', message }`: se setea cuando
  `copyTextToClipboard(character.name)` resuelve `true`, o cuando el
  usuario confirma el copiado manual desde `ManualCopyDialog`. No existe
  un estado `'error'` propio en esta feature (a diferencia de
  `ShareHaremButton`, que sí lo usa para su paso de generación de
  texto): acá no hay ningún paso de generación que pueda fallar antes de
  intentar copiar, así que la única vía de "fallo" ya está cubierta por
  `ManualCopyDialog` (Principio VI).
- Un segundo estado, `manualCopyText: string | null`, controla si
  `ManualCopyDialog` está abierto (mismo patrón que
  `ShareHaremButton`): `null` = cerrado; un `string` = abierto, mostrando
  ese texto (siempre `character.name` en esta feature).

## Props de `CopyNameButton`

```ts
interface ICopyNameButton {
  characterName: string
}
```

Sin dependencia de `useProfiles()` ni de ningún otro contexto: recibe el
nombre a copiar directamente por props desde `CharacterCard`, que a su
vez lo toma de `character.name`.
