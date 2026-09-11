# Contrato: casos de uso de reordenamiento — `application/useCases/`

**Módulos nuevos**: `application/useCases/reorderSeries.ts`,
`application/useCases/reorderCharactersInSeries.ts`. Mismo patrón que
`application/useCases/reorderProfiles.ts` de `002`.

```ts
function reorderSeries(
  repository: ProfileRepository,
  profileId: string,
  orderedSeriesIds: string[],
): void

function reorderCharactersInSeries(
  repository: ProfileRepository,
  profileId: string,
  seriesId: string,
  orderedCharacterIds: string[],
): void
```

## Comportamiento común

1. `repository.getAll()` — lee todos los perfiles.
2. Ubica el `Profile` cuyo `id === profileId`.
   - Si no existe: no hace nada (no llama a `repository.save()`).
3. Aplica la función pura correspondiente de
   `domain/harem/Harem.ts` (ver `contracts/harem-reorder-domain.md`)
   sobre `profile.harem`, produciendo un `harem` nuevo.
4. Reemplaza ese `Profile` (mismo `id`, `alias`, `isActive`, `order`,
   `createdAt` — solo cambia `harem`) dentro del arreglo completo de
   perfiles.
5. `repository.save()` con el arreglo completo (persistencia
   automática, Principio I) — ningún otro perfil se modifica.

## Por qué reciben `profileId` explícito (no "el perfil activo")

Los casos de uso de `application/` no conocen el concepto de "perfil
activo de la UI" — esa noción vive en `ProfilesContext`
(`presentation/`). Quien llama a estos casos de uso (el contexto) es
quien decide pasar el `id` del perfil activo; esto mantiene el mismo
patrón que el resto de los casos de uso existentes
(`activateProfile`, `deleteProfile`, `renameProfile` también reciben un
`profileId` explícito).

## Testing de este contrato

- Con un `InMemoryProfileRepository` (ya existe en
  `tests/support/InMemoryProfileRepository.ts`) seedeado con 2+
  perfiles, cada uno con harem propio:
  - `reorderSeries`: reordenar las series del perfil A y verificar que
    el perfil B (su harem) queda intacto tras `repository.getAll()`.
  - `reorderCharactersInSeries`: reordenar los personajes de una serie
    del perfil A y verificar que ninguna otra serie de ese mismo perfil,
    ni el harem del perfil B, cambia.
  - Ambos: llamar con un `profileId` inexistente y verificar que
    `repository.save()` no se invoca (el repositorio queda sin cambios).
