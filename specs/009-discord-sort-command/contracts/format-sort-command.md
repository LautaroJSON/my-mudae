# Contrato: `formatSortCommand`

**Módulo**: `domain/parsing/formatSortCommand.ts` — función pura de
`domain/` (sin React/`styled-components`/`localStorage`/`navigator`),
hermana de `domain/parsing/formatHaremMessage.ts` (004) pero con un
propósito y formato de salida distintos (comando `$sm` de Mudae para
Discord, no el formato de pegado de perfiles).

## Firma

```ts
function formatSortCommand(harem: Harem): string | null
```

Ver `data-model.md` para los tipos `Harem`/`Series`/`Character` (sin
cambios respecto de `001`/`002`/`003`).

## Precondiciones

- `harem` es un `Harem` válido tal como lo expone `activeProfile.harem`
  de `useProfiles()`; puede tener cero o más `series`, y cada `series`
  puede tener cero o más `characters` (aunque, por FR-022 de `001`, una
  serie persistida nunca queda vacía en la práctica — la función igual
  se comporta de forma segura si alguna vez lo estuviera).
- No se asume que el caller ya validó nada más allá de tener un `Harem`
  en la forma correcta.

## Postcondiciones

- Se calcula `nombres = harem.series.flatMap(series =>
  series.characters.map(character => character.name))`, preservando el
  orden exacto de `harem.series` y, dentro de cada serie, el orden
  exacto de `series.characters` (el mismo orden que ya usa
  `HaremView`/`SeriesGroup` para renderizar, y que gestionan
  `reorderSeries`/`reorderCharactersInSeries` de `003`).
- Si `nombres.length === 0` → devuelve `null`.
- En caso contrario → devuelve exactamente
  `` `$sm ${nombres.join(' $ ')}` ``, es decir el literal `"$sm"`, un
  espacio, y los nombres separados por `" $ "` (espacio, signo pesos,
  espacio), sin espacio final.
- Cada `character.name` se incluye **tal cual está guardado**, sin
  recortar espacios, sin escapar el carácter `$` si estuviera presente
  en el nombre, y sin ningún otro tipo de transformación.
- No incluye `kakera`, `claimRank` ni `imageUrl` de ningún personaje —
  a diferencia de `formatHaremMessage`, el comando `$sm` de Mudae solo
  necesita nombres.
- **Nunca lanza**: para cualquier `Harem` con la forma de tipo correcta
  (incluyendo series vacías, si existieran), la función siempre
  devuelve `string | null`, nunca propaga una excepción.

## Casos borde cubiertos por el contrato

- `harem.series` vacío (`[]`) → `null`.
- Todas las series presentes pero con `characters: []` → `null` (mismo
  resultado que el caso anterior, tratado igual por `flatMap`).
- Un único personaje en una única serie → `` `$sm ${nombre}` `` (sin
  ningún separador `" $ "`, porque no hay un segundo nombre).
- Un `character.name` que contiene el carácter `$` (ej. `"Ka$h"`) → se
  incluye tal cual, sin escapar; el contrato no garantiza que el
  resultado sea reinterpretable sin ambigüedad por el bot de Discord —
  eso queda fuera de alcance (ver Edge Cases de `spec.md`).
- Un `character.name` con espacios múltiples o al inicio/final → se
  incluye tal cual, sin `trim()` ni colapsar espacios.

## Testing de este contrato

- `harem.series = []` → `null`.
- Una serie con un personaje → `` `$sm ${name}` ``, sin separador.
- Dos series con dos personajes cada una, en un orden particular →
  el resultado respeta ese orden serie-por-serie y personaje-por-personaje
  (comparar contra el `join` esperado construido a mano en el test, no
  contra un valor recalculado con la misma función).
- Una serie con `characters: []` intercalada entre series con
  personajes → se omite del resultado sin dejar un `" $  $ "` con
  separadores duplicados.
- Un nombre con `$` y con espacios extra → se preserva exactamente en
  el `string` resultante (comparación exacta, no solo `.includes`).
- Cambiar el orden de `harem.series` (o de `characters` dentro de una
  serie) entre dos llamadas produce un resultado con ese nuevo orden —
  prueba directa de que la función no cachea nada internamente
  (Principio II).
