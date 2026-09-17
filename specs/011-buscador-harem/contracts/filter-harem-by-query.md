# Contrato: `filterHaremByQuery` (domain)

**Tipo de contrato**: contrato de función pura de `domain/harem/Harem.ts`
(app client-only, sin API HTTP).

## Firma

```ts
export function filterHaremByQuery(harem: Harem, query: string): Harem
```

## Comportamiento garantizado

1. **No muta la entrada**: `harem` y cada `Series`/`Character` de
   entrada permanecen sin modificar.
2. **Sin filtro cuando `query` es vacío o solo espacios**: si
   `normalizeSearchText(query) === ''`, la función devuelve exactamente
   el mismo objeto `harem` recibido (misma referencia, sin recorrer ni
   reconstruir nada) — FR-011.
3. **Coincidencia por título de serie**: una serie cuyo `name`
   normalizado incluye el `query` normalizado entra completa al
   resultado, con **todos** sus personajes, sin importar si alguno de
   ellos coincide o no individualmente (FR-005). Se agrega con la misma
   referencia de objeto `Series` que tenía en la entrada (no se clona).
4. **Coincidencia por nombre de personaje**: si una serie NO coincide
   por título, se evalúan sus personajes uno por uno; los que coinciden
   por `name` normalizado se conservan, el resto se descarta (FR-006).
   Si al menos un personaje coincide, la serie entra al resultado con un
   objeto `Series` nuevo (`{ ...series, characters: <subconjunto> }`).
   Si ninguno coincide, la serie no aparece en el resultado.
5. **Normalización de texto** (`normalizeSearchText`, helper privado del
   mismo archivo): `string.normalize('NFD')` para descomponer
   diacríticos, remueve el rango Unicode de marcas combinantes
   (`̀-ͯ`), aplica `trim()` y `toLocaleLowerCase()`. Se aplica
   por igual a `query`, a `series.name` y a `character.name` antes de
   comparar con `includes` (FR-007: case-insensitive, accent-insensitive,
   coincidencia por subcadena).
6. **Orden preservado**: el orden relativo de las series que coinciden
   es el mismo que tenían en `harem.series`; ídem para los personajes
   conservados dentro de una serie filtrada por nombre. La función nunca
   reordena, solo filtra.
7. **`harem.profileId` sin cambios**.
8. **Conjunto de ids es siempre un subconjunto**: ningún id de serie ni
   de personaje en el resultado puede estar ausente de `harem` de
   entrada; la función nunca agrega ni duplica.

## Casos borde cubiertos por el contrato

- `query` vacío (`''`) o solo espacios (`'   '`): equivalente a "sin
  búsqueda", devuelve el `harem` sin filtrar (misma referencia).
- `query` que no coincide con ningún `series.name` ni `character.name`:
  devuelve `{ ...harem, series: [] }`.
- `query` que coincide simultáneamente con el título de una serie y con
  el nombre de un personaje de otra serie distinta: ambas series
  aparecen en el resultado (la primera completa, la segunda con solo el
  personaje que coincide).
- Harem sin series (`series: []`): devuelve `{ ...harem, series: [] }`
  sin error, para cualquier `query`.
- `query` con mayúsculas/minúsculas o acentos distintos a como está
  guardado el nombre (ej. `"KONOSUBA"`, `"nézuko"` vs `"Nezuko"`):
  coincide igual, gracias a `normalizeSearchText`.

## Testing de este contrato

- Serie "Konosuba" con personajes `["Aqua", "Megumin"]`, `query =
  "konosuba"` → resultado incluye la serie completa con ambos
  personajes, y esa `Series` es **la misma referencia** de objeto que la
  de entrada (`toBe`, no solo `toEqual`).
- Serie "Dragon Ball" con personajes `["Goku", "Vegeta"]`, `query =
  "goku"` → resultado incluye la serie con **solo** `"Goku"`, y esa
  `Series` es un objeto **nuevo** (no la misma referencia que la de
  entrada), pero el objeto `Character` de "Goku" adentro sí es la misma
  referencia (no se clona el personaje).
- `query = "no existe nada así"` sobre un harem con contenido → `{
  ...harem, series: [] }`.
- `query = ""` y `query = "   "` → devuelven exactamente `harem` (misma
  referencia, verificado con `toBe`).
- `query = "goku"` sobre un harem que además tiene una serie llamada
  "Goku no Bouken" (coincide por título) → esa serie entra completa
  (todos sus personajes, aunque ninguno se llame "Goku"), simultáneo con
  el resultado del caso de "Dragon Ball" de arriba si ambas series
  existen en el mismo harem de prueba.
- Verificar que `harem` original (el objeto pasado como argumento) no
  cambió después de la llamada.
