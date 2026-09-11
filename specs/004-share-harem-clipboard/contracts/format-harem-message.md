# Contrato: `formatHaremMessage`

**Módulo**: `domain/parsing/formatHaremMessage.ts` — función pura de
`domain/` (sin React/`styled-components`/`localStorage`/`navigator`),
inversa de `domain/parsing/parseHaremMessage.ts` (ver
`specs/001-multi-profile-harems/contracts/parse-harem-message.md`).

## Firma

```ts
function formatHaremMessage(profile: Profile): string
```

Ver `data-model.md` para los tipos `Profile`/`Harem`/`Series`/
`Character` (sin cambios respecto de `001`/`002`/`003`).

## Precondiciones

- `profile` es un `Profile` válido tal como lo devuelve `useProfiles()`
  (típicamente `activeProfile`); puede tener cero o más `series`, y cada
  `series` puede tener cero o más `characters` (aunque en la práctica,
  por FR-022 de `001`, una serie persistida nunca queda vacía — la
  función igual debe comportarse de forma segura si alguna vez lo
  estuviera, ver Casos borde).
- No se asume que el caller ya validó nada más allá de tener un
  `Profile` en la forma correcta.

## Postcondiciones

- El `string` resultante, al pasarse tal cual como `rawText` a
  `parseHaremMessage`, produce `{ ok: true, profileName, series }` donde:
  - `profileName === profile.alias`.
  - `series.length === profile.harem.series.filter(s => s.characters.length > 0).length`,
    en el **mismo orden** que `profile.harem.series`.
  - Para cada serie, `series[i].characters` tiene el mismo `length`, en
    el **mismo orden**, que `profile.harem.series[i].characters`, y cada
    `ParsedCharacter` resultante tiene el mismo `name`, `kakera` y
    `claimRank` (normalizado a `#<rank>`) que el `Character` original
    (o el `claimRank` sintetizado, ver más abajo, si el original era
    `undefined`).
- Formato línea por línea (ver `research.md` para el razonamiento de
  cada decisión):
  1. Primera línea: `"<profile.alias>'s harem"`.
  2. Por cada serie con al menos un personaje, en el orden de
     `profile.harem.series`:
     - Línea de encabezado: `"<series.name> - <n>/<n>"`, con
       `n = series.characters.length`.
     - Por cada personaje, en el orden de `series.characters`:
       - Si `character.kakera !== undefined`:
         `"#<rank> - <character.name> <character.kakera> ka - <character.imageUrl>"`.
       - Si `character.kakera === undefined`:
         `"#<rank> - <character.name> - <character.imageUrl>"`.
       - `<rank>` es `character.claimRank` sin el prefijo `#` si ya lo
         tiene (se normaliza para no duplicarlo), o
         `<posición 1-based del personaje dentro de la serie>` si
         `character.claimRank` es `undefined`.
  3. Una serie de `profile.harem.series` con `characters.length === 0`
     se omite por completo (no genera ni encabezado ni líneas) — mismo
     invariante que ya aplica `parseHaremMessage` del lado de lectura.

## Casos borde cubiertos por el contrato

- `profile.harem.series` vacío (`[]`) → devuelve solo la línea de
  encabezado de perfil, sin ninguna serie. (En la práctica, `FR-007` de
  `spec.md` evita que se llegue a invocar esta función desde
  `ShareHaremButton` en ese caso — el icono está deshabilitado — pero la
  función en sí no lanza ni devuelve `undefined`.)
- Una serie con `characters: []` (no debería ocurrir persistida, ver
  FR-022 de `001`, pero el contrato la contempla por robustez) → se omite
  del texto generado, igual que el caso general.
- Un `Character` con `claimRank: undefined` → se sintetiza un rango por
  posición (`#1`, `#2`, ...) dentro de esa serie, para que la línea
  generada siga siendo válida contra `CHARACTER_WITH_KAKERA`/
  `CHARACTER_WITHOUT_KAKERA` de `parseHaremMessage`.
- Nombres de perfil/serie/personaje con caracteres especiales (comillas,
  guiones, acentos, emojis) se insertan tal cual, sin escapar — el
  parser tampoco los escapa al leer, así que no hace falta ninguna
  transformación adicional para que el round-trip funcione.

## Testing de este contrato

- **Round-trip principal**: construir un `Profile` fixture con 2+ series
  y 3+ personajes (con y sin `kakera`, con y sin `claimRank` explícito),
  pasar `formatHaremMessage(profile)` directamente a `parseHaremMessage`,
  y verificar que el resultado `ok: true` reproduce el mismo
  `profileName`, cantidad de series, cantidad de personajes por serie, y
  campos (`name`/`kakera`/`claimRank`) de cada uno.
- **Orden (Principio II)**: reordenar el fixture (series y personajes
  dentro de una serie) con las funciones puras ya existentes de `003`
  (`reorderSeries`/`reorderCharactersInSeries` de `domain/harem/
  Harem.ts`) y verificar que `formatHaremMessage` sobre el harem
  reordenado produce las líneas en el nuevo orden, no en el original.
- **Serie vacía**: un `Harem` con una serie de `characters: []` mezclada
  con series no vacías → esa serie no aparece en el texto generado.
- **`claimRank` ausente**: un personaje sin `claimRank` → la línea
  generada usa un rango sintético por posición y sigue siendo parseable
  por `parseHaremMessage` sin producir `ok: false`.
