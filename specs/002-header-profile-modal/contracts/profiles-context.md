# Contrato: `ProfilesContext` / `useProfiles()` — cambios sobre `001`

**Módulo**: `presentation/context/ProfilesContext.tsx` (mismo archivo que
`001/contracts/profiles-context.md` documentó; acá solo se listan los
cambios de esta feature — `createProfileFromPaste`, `renameProfile`,
`deleteProfile`, `activateProfile` mantienen el contrato de `001`, salvo
por el rename de campo `name`→`alias` en todo lo que devuelven/reciben).

## Cambios al hook

```ts
function useProfiles(): {
  profiles: Profile[]              // ya vienen ordenados por `order`
  activeProfile: Profile | undefined
  urlProfileStatus: 'none' | 'activated' | 'not-found'   // NUEVO
  createProfileFromPaste: (rawText: string) => CreateProfileFromPasteResult
  renameProfile: (profileId: string, alias: string) => void   // renombrado: antes `name`
  deleteProfile: (profileId: string) => void
  activateProfile: (profileId: string) => void
  reorderProfiles: (orderedIds: string[]) => void   // NUEVO
}
```

## `profiles` — orden

- `profiles` SIEMPRE se expone ordenado por `order` ascendente (antes no
  garantizaba ningún orden particular más allá del de inserción). Todo
  componente que renderiza la lista (`ProfileList`) puede confiar en este
  orden sin tener que ordenar él mismo.

## `urlProfileStatus` — nuevo

- `'none'`: no había `id` en la URL al cargar esta pestaña.
- `'activated'`: había un `id` en la URL y coincidió con un perfil, que
  ya quedó activo antes del primer render.
- `'not-found'`: había un `id` en la URL pero no coincidió con ningún
  perfil; `activeProfile` sigue siendo el que ya estuviera activo (no se
  tocó), pero `presentation/` debe mostrar un estado de "perfil no
  encontrado" en vez del harem de ese `activeProfile` heredado, para no
  sustituir silenciosamente lo que el usuario esperaba ver (Edge Case de
  `spec.md`).

## `reorderProfiles` — nuevo

- Recibe la lista completa de `id`s en el nuevo orden deseado (tal como
  la entrega `@dnd-kit/sortable` al terminar un arrastre).
- Reasigna `order` de forma densa (0, 1, 2, ...) según esa secuencia y
  persiste el cambio (Principio I) — no activa ni desactiva ningún
  perfil (FR-010).
- No falla si algún `id` de la lista no existe (se ignora); tampoco
  falla si faltan `id`s de perfiles existentes (quedan al final, en su
  orden relativo anterior) — mantiene la operación tolerante a llamadas
  parciales sin romper la lista.

## `createProfileFromPaste` — resultado extendido

- El resultado exitoso ahora puede incluir `mode: 'created' | 'synced'`
  (ver `data-model.md`), opcional — el contrato mínimo (`{ ok: true }`)
  sigue siendo válido para quien no lo necesite.

## Testing de estos cambios

- Test de que `profiles` respeta `order` tras crear, reordenar y
  eliminar perfiles en distintas secuencias.
- Test de `reorderProfiles` con un `InMemoryProfileRepository` seedeado
  con 3+ perfiles, verificando persistencia del nuevo orden y que
  ninguno cambia su `isActive`.
- Test de `urlProfileStatus` en sus tres valores, montando el
  `ProfilesProvider` con distintos valores simulados de
  `window.location.search`.
