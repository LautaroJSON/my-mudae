# Contrato: `syncHarem`

**Módulo**: `domain/harem/syncHarem.ts` — función pura de `domain/` (sin
React/styled-components/localStorage).

## Firma

```ts
function syncHarem(currentHarem: Harem, parsedSeries: ParsedSeries[]): Harem
```

## Precondiciones

- `currentHarem` es el harem persistido de un perfil cuyo `id` coincidió
  con el nombre extraído de un nuevo pegado (FR-015a).
- `parsedSeries` viene de un `ParsedHaremMessage` con `ok: true` (el
  caller ya validó el pegado antes de llamar a esta función).

## Postcondiciones

- El `Harem` resultante contiene, para cada personaje de `parsedSeries`:
  - si su `claimRank` coincide con un personaje de `currentHarem` → un
    `Character` con el mismo `id` que tenía antes, pero con `name`,
    `imageUrl` y `kakera` actualizados a los del pegado nuevo;
  - si no coincide con nada → un `Character` nuevo, con `id` recién
    generado.
- Ningún personaje de `currentHarem` cuyo `claimRank` no aparezca en
  `parsedSeries` sobrevive en el resultado.
- Las series del resultado se arman según el agrupamiento de
  `parsedSeries` (nombres de serie del pegado más reciente); una serie
  sin personajes no aparece en el resultado (mismo invariante que
  `removeCharacterFromSeries` de la feature anterior).
- `profileId` del harem resultante es el mismo que `currentHarem.profileId`
  (no cambia).

## Casos borde cubiertos por el contrato

- `parsedSeries` sin ningún claim rank en común con `currentHarem` →
  el resultado reemplaza el 100% de los personajes (todos nuevos, ver
  Edge Cases de `spec.md`).
- `parsedSeries` idéntico a lo que ya representaba `currentHarem` (mismos
  claim ranks, mismos datos) → el resultado es equivalente al harem
  actual (ningún `id` de personaje cambia).
- Un personaje cambia de serie entre un pegado y otro (mismo claim rank,
  distinta serie) → se reubica bajo la serie nueva sin duplicarse.

## Testing de este contrato

- Test con harem base de 3 personajes en 2 series, sincronizado contra un
  pegado que: mantiene 1 sin cambios, actualiza el kakera de otro, agrega
  uno nuevo, y omite el tercero (que debe desaparecer) — verificando
  `id`s conservados en los que no cambiaron.
- Test de "sin superposición" (0 claims en común) → reemplazo total.
- Test de "serie que queda vacía tras la sincronización" → esa serie no
  aparece en el resultado.
