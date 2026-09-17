# Data Model: Buscador de Personajes y Series en el Harem

**Feature**: `011-buscador-harem`

Esta feature no agrega ninguna entidad persistida nueva ni modifica los
campos de los tipos existentes de `domain/harem/` (`Harem`, `Series`,
`Character`, definidos en `001`/`002`/`003`). Agrega una función pura
derivada más el estado de UI efímero del contexto y componente nuevos.

## Entidades existentes reutilizadas (sin cambios de forma)

- **`Harem`** (`domain/harem/Harem.ts`): `{ profileId: string; series:
  Series[] }`. Sigue siendo la fuente única de verdad del harem
  persistido — el filtro de búsqueda nunca se guarda de vuelta en esta
  forma.
- **`Series`** (`domain/harem/Series.ts`): `{ id: string; name: string;
  characters: Character[] }`. `name` es uno de los dos campos por los
  que se puede buscar (coincidencia de "título de serie", FR-005).
- **`Character`** (`domain/harem/Character.ts`): `{ id: string; name:
  string; imageUrl: string; kakera?: number; claimRank?: string }`.
  `name` es el segundo campo por el que se puede buscar (FR-006).

## Función nueva (domain, sin persistencia)

### `filterHaremByQuery(harem: Harem, query: string): Harem`

Función pura agregada a `domain/harem/Harem.ts`. No es una entidad
persistida — es un `Harem` derivado, recalculado cada vez que
`HaremView` la invoca a partir del `Harem` (persistido, y ya
opcionalmente pasado por `sortHaremByKakera`) vigente.

| Campo conceptual | Descripción |
|---|---|
| entrada | `harem: Harem`, `query: string` (el valor crudo del input, sin trim previo) |
| salida | Un `Harem` nuevo cuyo `series` es un subconjunto (mismo orden relativo) del de entrada; si `query` normalizado es vacío, devuelve exactamente el mismo `harem` de entrada (misma referencia, sin filtrar). |
| coincidencia por serie | Si `normalizeSearchText(series.name)` incluye `normalizeSearchText(query)`, la serie completa entra al resultado **con la misma referencia de objeto** que tenía (FR-005). |
| coincidencia por personaje | Si la serie no coincide por título, se conservan solo los `characters` cuyo `normalizeSearchText(character.name)` incluye `normalizeSearchText(query)`; si queda al menos uno, la serie entra al resultado como un objeto `Series` **nuevo** con ese subconjunto (FR-006). Si no queda ninguno, la serie se omite del resultado. |
| normalización | `normalizeSearchText`: `NFD` + remoción de marcas diacríticas (`̀-ͯ`) + `trim()` + `toLocaleLowerCase()` — case/accent-insensitive, coincidencia por subcadena (FR-007). |

**Regla de derivación** (ver `contracts/filter-harem-by-query.md` para
el contrato completo):

```
normalizedQuery = normalizeSearchText(query)
if normalizedQuery === '': return harem   // sin filtro activo

resultado.series = harem.series.reduce((matched, series) => {
  if (normalizeSearchText(series.name).includes(normalizedQuery)) {
    matched.push(series)                              // misma referencia
  } else {
    characters = series.characters.filter(character =>
      normalizeSearchText(character.name).includes(normalizedQuery))
    if (characters.length > 0) {
      matched.push({ ...series, characters })          // objeto nuevo
    }
  }
  return matched
}, [])
```

**Invariantes**:
- Nunca muta `harem` ni ninguno de sus `series`/`characters`.
- El resultado es siempre un subconjunto del conjunto de ids de entrada
  (nunca agrega series/personajes que no existían).
- Con `query` vacío o solo espacios, el resultado es idéntico (misma
  referencia) al `harem` de entrada.
- El orden relativo de las series que sí coinciden se conserva igual
  que en la entrada; ídem para los personajes dentro de una serie
  filtrada por nombre.
- No tiene efecto sobre `harem.profileId`.
- No se persiste en ningún repositorio.

## Estado de UI efímero (no persistido)

Vive únicamente en memoria de React, se resetea al recargar la página
(mismo criterio que otros estados efímeros de `HeaderActions`) y,
adicionalmente para `HaremSearchContext`, al cambiar de perfil activo
(FR-010).

| Dueño | Estado | Tipo | Notas |
|---|---|---|---|
| `HaremSearchContext` (provider global, dentro de `ProfilesProvider`) | `isOpen` | `boolean` | Arranca en `false`; controla si `HaremSearchButton` muestra el `input` expandido. |
| `HaremSearchContext` | `query` | `string` | Arranca en `''`; se limpia a `''` cada vez que `isOpen` pasa de `true` a `false` (FR-009) y cada vez que cambia el perfil activo (FR-010). Es el valor que `HaremView` pasa a `filterHaremByQuery`. |
| `HaremSearchButton` | *(sin estado propio)* | — | Solo lee/escribe `HaremSearchContext`; el foco del `input` al abrirse se maneja con un `ref` imperativo, no es estado. |

Ninguno de estos dos estados se sincroniza entre pestañas ni
dispositivos, ni sobrevive a un refresh — son puramente locales a la
sesión de UI activa, a diferencia del `Harem` persistido que sí
sobrevive (Principio I, sin cambios).
