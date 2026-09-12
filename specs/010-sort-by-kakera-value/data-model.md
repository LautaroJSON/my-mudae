# Data Model: Ordenar por Valor de Kakera (Temporal)

**Feature**: `010-sort-by-kakera-value`

Esta feature no agrega ninguna entidad persistida nueva ni modifica los
campos de los tipos existentes de `domain/harem/` (`Harem`, `Series`,
`Character`, definidos en `001`/`002`/`003`). Agrega una función pura
derivada y un tipo de dirección, más el estado de UI efímero de los
componentes nuevos.

## Entidades existentes reutilizadas (sin cambios de forma)

- **`Harem`** (`domain/harem/Harem.ts`): `{ profileId: string; series:
  Series[] }`. Sigue siendo la fuente única de verdad del orden manual
  persistido (Principio I/II) — el ordenamiento temporal nunca se
  guarda de vuelta en esta forma.
- **`Series`** (`domain/harem/Series.ts`): `{ id: string; name: string;
  characters: Character[] }`. Su "valor" para este ordenamiento es
  derivado (suma de kakera de sus personajes), nunca un campo propio.
- **`Character`** (`domain/harem/Character.ts`): `{ id: string; name:
  string; imageUrl: string; kakera?: number; claimRank?: string }`. Se
  usa `kakera` (tratado como `0` si es `undefined`, FR-013).

## Tipo y función nuevos (domain, sin persistencia)

### `KakeraSortDirection`

```ts
export type KakeraSortDirection = 'asc' | 'desc'
```

### `sortHaremByKakera(harem: Harem, direction: KakeraSortDirection): Harem`

Función pura agregada a `domain/harem/Harem.ts`. No es una entidad
persistida — es un `Harem` derivado, recalculado cada vez que
`HaremView` la invoca a partir del `Harem` persistido vigente (nunca
cacheado en `localStorage` ni en un estado de React que pueda
desincronizarse).

| Campo conceptual | Descripción |
|---|---|
| entrada | `harem: Harem` (el persistido, tal cual lo expone `activeProfile.harem`), `direction: KakeraSortDirection` |
| salida | Un `Harem` nuevo: mismas `series`/`characters` (mismos objetos, sin clonar campos), reordenados. |
| orden de personajes | Dentro de cada serie, por `character.kakera ?? 0`, ascendente o descendente según `direction`. |
| orden de series | Por la suma de `kakera ?? 0` de sus personajes (recalculada sobre los personajes ya reordenados de ese mismo `Harem` de salida — el valor de la suma no cambia por el orden interno), ascendente o descendente según `direction`. |
| empates | Se conserva el orden relativo original (estabilidad nativa de `Array.sort`, FR-014) — sin comparador de desempate explícito. |

**Regla de derivación** (ver `contracts/sort-haremby-kakera.md` para el
contrato completo):

```
seriesValue(series) = sum(character.kakera ?? 0 for character in series.characters)
factor = direction === 'desc' ? -1 : 1

resultado.series = harem.series
  .map(series => ({ ...series, characters: [...series.characters].sort((a, b) => factor * ((a.kakera ?? 0) - (b.kakera ?? 0))) }))
  .sort((a, b) => factor * (seriesValue(a) - seriesValue(b)))
```

**Invariantes**:
- Nunca muta `harem` ni ninguno de sus `series`/`characters` (devuelve
  arrays nuevos en cada nivel).
- El conjunto de ids de series y de personajes en la salida es
  exactamente el mismo que en la entrada (solo cambia el orden).
- No tiene efecto sobre `harem.profileId`.
- No se persiste en ningún repositorio: es responsabilidad exclusiva de
  quien la invoca (`HaremView`) decidir cuándo usar su resultado en vez
  del `Harem` original.

## Estado de UI efímero (no persistido)

Vive únicamente en memoria de React, se resetea al recargar la página
(mismo criterio que `SettingsFab.isOpen`/`SortCommandToggle.isOpen`) y,
adicionalmente para `HaremSortContext`, al cambiar de perfil activo
(FR-011).

| Dueño | Estado | Tipo | Notas |
|---|---|---|---|
| `HaremSortContext` (provider global, dentro de `ProfilesProvider`) | `isActive` | `boolean` | Arranca en `false`; controla si `HaremView` aplica `sortHaremByKakera` y si el drag-and-drop está deshabilitado (FR-015). |
| `HaremSortContext` | `direction` | `KakeraSortDirection` | Arranca en `'desc'`; se resetea a `'desc'` cada vez que `isActive` pasa de `false` a `true` (FR-006). |
| `HaremSortButton` | `isOpen` | `boolean` | Arranca en `false`; controla si `HaremSortPanel` está montado. |
| `HaremSortPanel` | `isSortSectionOpen` | `boolean` | Arranca en `false`; controla si se muestran `KakeraSortOption`/`RankSortOption` bajo el ítem "Ordenamiento". |

Ninguno de estos cuatro estados se sincroniza entre pestañas ni
dispositivos, ni sobrevive a un refresh — son puramente locales a la
sesión de UI activa, a diferencia del `Harem` persistido que sí
sobrevive (Principio I, sin cambios).
