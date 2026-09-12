# Contrato: `sortHaremByKakera` (domain)

**Tipo de contrato**: contrato de función pura de `domain/harem/Harem.ts`
(app client-only, sin API HTTP).

## Firma

```ts
export type KakeraSortDirection = 'asc' | 'desc'

export function sortHaremByKakera(harem: Harem, direction: KakeraSortDirection): Harem
```

## Comportamiento garantizado

1. **No muta la entrada**: `harem`, cada `Series` de `harem.series` y
   cada `Character` de `series.characters` permanecen sin modificar; la
   salida usa arrays nuevos en ambos niveles (`series` y
   `series[].characters`).
2. **Personajes dentro de cada serie**: ordenados por
   `character.kakera ?? 0` — descendente si `direction === 'desc'`,
   ascendente si `direction === 'asc'`.
3. **Series entre sí**: ordenadas por la suma de `character.kakera ?? 0`
   de todos sus personajes — mismo criterio de dirección que el punto 2.
4. **Empates**: se resuelven manteniendo el orden relativo que tenían en
   `harem` de entrada (estabilidad de `Array.prototype.sort`), tanto
   para personajes empatados dentro de una serie como para series con la
   misma suma.
5. **Conjunto de ids preservado**: `resultado.series.map(s => s.id)` es
   una permutación exacta de `harem.series.map(s => s.id)`; ídem para
   los ids de personajes dentro de cada serie. Nunca agrega, quita ni
   duplica series o personajes.
6. **`harem.profileId` sin cambios**.
7. **Idempotencia dentro de la misma dirección**: llamar la función dos
   veces seguidas con la misma `direction` sobre el resultado de la
   primera llamada devuelve un `Harem` con el mismo orden (ya está
   ordenado).
8. **Simetría**: `sortHaremByKakera(harem, 'desc')` y
   `sortHaremByKakera(harem, 'asc')` son exactamente inversas entre sí
   para los personajes/series cuyo valor de kakera es distinto entre
   todos los elementos comparados (con empates, ambas conservan el orden
   original de esos elementos empatados, así que no son un espejo
   perfecto bit a bit en presencia de empates — comportamiento esperado
   de un sort estable).

## Casos borde cubiertos por el contrato

- Harem sin series (`series: []`): devuelve `{ ...harem, series: [] }`
  sin error.
- Serie sin personajes: no debería poder existir en un `Harem` válido
  (ver `removeCharacterFromSeries`, `003`), pero si llegara a pasar, su
  suma es `0` y no rompe el ordenamiento del resto de series.
- Todos los personajes de un harem sin `kakera` cargado: el resultado
  coincide exactamente con el orden de entrada (todo son empates de
  valor `0`).
- Un solo personaje o una sola serie: devuelto sin cambios de contenido,
  solo pasa por el mismo camino de `map`/`sort` sin necesitar un caso
  especial.

## Testing de este contrato

- Personajes con valores `[5, 20, 1]` en una serie → `'desc'` da
  `[20, 5, 1]`, `'asc'` da `[1, 5, 20]`.
- Dos series con sumas `[30, 30]` (mismo valor) → mantienen su orden
  original entre sí en ambas direcciones.
- Personaje sin `kakera` mezclado con personajes con valor → se ordena
  como si tuviera `0` (queda al final en `'desc'`, al principio en
  `'asc'`, salvo otros personajes también en `0`).
- Verificar que `harem` original (el objeto pasado como argumento) no
  cambió después de la llamada (comparar referencias/contenido antes y
  después).
- Verificar que el conjunto de ids de series y de personajes de la
  salida es igual (como `Set`) al de la entrada.
