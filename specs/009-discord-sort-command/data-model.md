# Data Model: Comando de Orden de Harem para Discord

**Feature**: `009-discord-sort-command`

Esta feature no agrega ninguna entidad persistida nueva ni modifica los
tipos existentes de `domain/harem/` (`Harem`, `Series`, `Character`,
definidos en `001`/`002`/`003`). Solo agrega un tipo derivado (no
persistido) y describe el estado de UI efímero de los componentes
nuevos.

## Entidades existentes reutilizadas (sin cambios)

- **`Harem`** (`domain/harem/Harem.ts`): `{ profileId: string; series:
  Series[] }`. Es la fuente única de verdad del orden (Principio II) —
  ver `research.md` §2.
- **`Series`** (`domain/harem/Series.ts`): `{ id: string; name: string;
  characters: Character[] }`.
- **`Character`** (`domain/harem/Character.ts`): `{ id: string; name:
  string; imageUrl: string; kakera?: number; claimRank?: string }`. Solo
  se usa `name` para esta feature.

## Entidad derivada nueva

### Comando de orden de harem (texto)

No es una entidad persistida — es el valor de retorno puro de
`formatSortCommand(harem: Harem): string | null`, recalculado en cada
render a partir del `Harem` vigente (nunca guardado en `localStorage` ni
en ningún estado de React que pueda desincronizarse).

| Campo conceptual | Tipo | Descripción |
|---|---|---|
| prefijo | `"$sm"` (literal) | Fijo, no configurable (Assumption de `spec.md`). |
| separador | `" $ "` (literal) | Fijo, tal como lo especifica el ejemplo del usuario. |
| nombres | `string[]` | `character.name` de cada personaje, en el orden `harem.series[i].characters[j]` (mismo orden que `HaremView`/`SeriesGroup` renderizan). |
| resultado vacío | `null` | Cuando `nombres.length === 0` (harem sin series o sin personajes) — FR-008. |

**Regla de derivación** (ver `contracts/format-sort-command.md` para el
contrato completo):

```
nombres = harem.series.flatMap(series => series.characters.map(c => c.name))
resultado = nombres.length === 0
  ? null
  : "$sm " + nombres.join(" $ ")
```

**Invariantes**:
- El resultado nunca contiene un nombre que no pertenezca al `Harem`
  actual (no hay caché ni snapshot intermedio — Principio II).
- El resultado nunca es `""` (string vacío): o es `null`, o contiene al
  menos `"$sm " + <un nombre>`.
- No se escapa ni transforma el `character.name` (edge case de
  `spec.md`: nombres con `$` o espacios múltiples se incluyen tal cual).

## Estado de UI efímero (no persistido)

Vive únicamente en memoria de los componentes nuevos, se resetea al
recargar la página (mismo criterio que `SettingsFab.isOpen`, ver
Assumptions de `spec.md`).

| Componente | Estado | Tipo | Notas |
|---|---|---|---|
| `SortCommandToggle` | `isOpen` | `boolean` | Arranca en `false`; controla el `$isOpen` de `SortCommandBar`. |
| `CopyCommandButton` | `feedback` | `'idle' \| 'success' \| 'error'` | Mismo patrón que `ShareHaremButton` (004); vuelve a `'idle'` tras un timeout. |
| `CopyCommandButton` | `manualCopyText` | `string \| null` | No-`null` mientras `ManualCopyDialog` está abierto (fallback de Principio VI). |

Ninguno de estos tres estados se sincroniza entre pestañas ni
dispositivos — son puramente locales a la sesión de UI activa.
