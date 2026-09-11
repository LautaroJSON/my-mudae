# Contrato: `ProfilesContext` / `useProfiles()` — cambios sobre `002`

**Módulo**: `presentation/context/ProfilesContext.tsx` (mismo archivo que
`002/contracts/profiles-context.md` documentó; acá solo se listan los
agregados de esta feature — todo lo demás mantiene el contrato de `002`
sin cambios).

## Cambios al hook

```ts
function useProfiles(): {
  // ...todo lo de 001/002 sin cambios...
  reorderSeries: (orderedSeriesIds: string[]) => void            // NUEVO
  reorderCharactersInSeries: (
    seriesId: string,
    orderedCharacterIds: string[],
  ) => void                                                       // NUEVO
}
```

## `reorderSeries` — nuevo

- Toma la lista completa de `id`s de serie en el nuevo orden deseado
  (tal como la entrega `computeReorderedIds` al terminar un arrastre de
  nivel serie).
- Aplica el reordenamiento sobre el **perfil activo** (usa
  `activeProfile.id` internamente — el componente que llama no pasa
  ningún `profileId`), persiste (Principio I), y refresca `profiles`
  desde el repositorio.
- Si no hay perfil activo (`activeProfile === undefined`), no hace nada
  — no hay ningún harem sobre el cual reordenar series.
- No activa ni desactiva ningún perfil, ni afecta el orden de personajes
  dentro de ninguna serie (FR-007).

## `reorderCharactersInSeries` — nuevo

- Toma el `id` de la serie afectada y la lista completa de `id`s de
  personaje en el nuevo orden deseado (misma fuente:
  `computeReorderedIds`, aplicado dentro del `DndContext` de esa serie
  puntual).
- Aplica el reordenamiento sobre el perfil activo, persiste, refresca
  `profiles`.
- Si no hay perfil activo, o el `seriesId` no corresponde a ninguna
  serie de su harem, no hace nada (tolerante, igual que el caso de uso
  subyacente).
- No afecta a ninguna otra serie del harem del perfil activo.

## Testing de estos cambios

- Test de `reorderSeries` con un `ProfilesProvider` + perfil activo
  seedeado con 3+ series: verificar el nuevo orden en
  `profiles.find(p => p.isActive).harem.series` tras llamar, y que
  persiste (releer del repositorio).
- Test de `reorderCharactersInSeries` con una serie de 3+ personajes:
  verificar el nuevo orden de esa serie puntual, y que las demás series
  del mismo harem no cambian.
- Test de que ninguno de los dos métodos hace nada si se invoca sin
  perfil activo (por ejemplo, con `localStorage` vacío).
