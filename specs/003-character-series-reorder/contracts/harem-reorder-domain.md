# Contrato: funciones puras de reordenamiento — `domain/harem/Harem.ts`

**Módulo**: `domain/harem/Harem.ts` (archivo ya existente, se le agregan
dos funciones — `removeCharacterFromSeries`, `countCharacters` y
`sumKakera` no cambian).

```ts
function reorderSeries(harem: Harem, orderedSeriesIds: string[]): Harem

function reorderCharactersInSeries(
  harem: Harem,
  seriesId: string,
  orderedCharacterIds: string[],
): Harem
```

## `reorderSeries`

- Reordena `harem.series` según `orderedSeriesIds`, con el mismo
  algoritmo tolerante que `reorderProfiles` de
  `domain/profile/Profile.ts`:
  - ids de `orderedSeriesIds` que no correspondan a ninguna serie del
    harem se ignoran (no crean series nuevas ni lanzan error);
  - series del harem ausentes de `orderedSeriesIds` quedan al final,
    conservando su orden relativo anterior entre sí.
- No modifica `series.characters` de ninguna serie — cada `Series` del
  array resultante es la misma referencia/contenido que tenía antes,
  solo cambia su posición dentro de `harem.series` (FR-007).
- No lanza excepciones ante ids inválidos, vacíos, o `orderedSeriesIds`
  vacío (en ese caso, el harem vuelve sin cambios de contenido, solo
  reordenado por el criterio "todas ausentes → quedan en su orden
  relativo anterior").

## `reorderCharactersInSeries`

- Reordena `series.characters` de la serie cuyo `id === seriesId` según
  `orderedCharacterIds`, con el mismo algoritmo tolerante.
- Si `seriesId` no corresponde a ninguna serie del harem, devuelve el
  harem sin cambios (no lanza, no crea nada).
- No afecta a ninguna otra serie del harem — el resto de
  `harem.series` se devuelve sin modificar.
- Al igual que `removeCharacterFromSeries` ya existente, nunca puede
  dejar una serie con `characters: []` como efecto de este reordenamiento
  (reordenar no elimina personajes, solo cambia su posición) — el
  invariante de `Series` (mínimo 1 personaje) no aplica acá porque esta
  función no quita ningún elemento del array, solo lo reposiciona.

## Testing de este contrato

- `reorderSeries`: dado un harem con 3+ series, reordenar y verificar
  el nuevo orden de `harem.series`; verificar que un id desconocido en
  la lista se ignora sin crear nada; verificar que una serie ausente de
  la lista queda al final en su orden relativo previo; verificar que
  `series.characters` de cada serie no cambia de contenido.
- `reorderCharactersInSeries`: dado un harem con una serie de 3+
  personajes, reordenar esa serie y verificar el nuevo orden de
  `characters`; verificar que las demás series del harem no se tocan;
  verificar que un `seriesId` inexistente devuelve el harem sin cambios;
  verificar que un id de personaje desconocido en la lista se ignora.
