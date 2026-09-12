# Contrato: `updateActiveProfileHarem`

**Módulo**: `application/useCases/updateActiveProfileHarem.ts` — caso de
uso de `application/` (lee y persiste vía `ProfileRepository`, reutiliza
funciones puras de `domain/`).

## Firma

```ts
function updateActiveProfileHarem(
  repository: ProfileRepository,
  activeProfileId: string,
  rawText: string,
): UpdateActiveProfileHaremResult
```

Ver `data-model.md` para el tipo `UpdateActiveProfileHaremResult`.

## Precondiciones

- `activeProfileId` es el `id` (no el `alias`) de un perfil que, en el
  caso de uso normal, existe en `repository.getAll()` y está marcado
  `isActive: true` — la UI solo invoca este caso de uso cuando hay un
  perfil activo (FR-001 de `spec.md`).
- `rawText` es el string tal cual lo pega el usuario, sin sanitización
  previa (mismo contrato de entrada que `parseHaremMessage`).

## Postcondiciones

- **Formato inválido**: si `parseHaremMessage(rawText)` devuelve
  `{ ok: false }`, el caso de uso devuelve
  `{ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' }` sin llamar a
  `repository.save()` — ningún perfil se modifica (mismo criterio de "no
  persistir nada en falla de parseo" que `createProfileFromPaste`).
- **Perfil activo inexistente** (defensivo): si ningún perfil de
  `repository.getAll()` tiene `id === activeProfileId`, el caso de uso
  devuelve `{ ok: false, reason: 'NO_ACTIVE_PROFILE' }` sin llamar a
  `repository.save()`.
- **Discordancia de nombre**: si el parseo es válido pero
  `parsed.profileName !== activeProfileId`, el caso de uso devuelve
  `{ ok: false, reason: 'PROFILE_MISMATCH', pastedProfileName: parsed.profileName }`
  sin llamar a `repository.save()` — esto aplica **incluso si**
  `parsed.profileName` coincide con el `id` de otro perfil ya existente
  en `repository.getAll()`: ese otro perfil tampoco se toca.
- **Éxito**: si el parseo es válido y `parsed.profileName === activeProfileId`,
  el caso de uso calcula `syncHarem(perfilActivo.harem, parsed.series)`,
  persiste `repository.save(...)` con el array completo de perfiles
  (reemplazando únicamente el `harem` del perfil con `id ===
  activeProfileId`, todos los demás campos y perfiles sin cambios), y
  devuelve `{ ok: true }`.

## Casos borde cubiertos por el contrato

- `parsed.profileName` coincide con el `id` de un perfil que NO es
  `activeProfileId` → se trata igual que cualquier discordancia:
  `PROFILE_MISMATCH`, sin sincronizar ni activar ese otro perfil.
- El pegado no cambia nada respecto del harem actual (mismos claim
  ranks, mismos datos) → `syncHarem` produce un harem equivalente
  (mismos `id` internos, ver contrato de `syncHarem` en
  `002/contracts/sync-harem.md`); el caso de uso igual devuelve
  `{ ok: true }`.
- Repositorio vacío (`repository.getAll()` devuelve `[]`) →
  `NO_ACTIVE_PROFILE` (no puede haber ningún `id` coincidente).
- `rawText` vacío o solo espacios en blanco → `parseHaremMessage` lo
  trata como formato inválido (ninguna línea reconocible) →
  `NO_VALID_SERIES_OR_CHARACTER`.

## Testing de este contrato

- Con un `InMemoryProfileRepository` seedeado con 2+ perfiles: pegar un
  texto válido cuyo nombre coincide con el perfil activo → `{ ok: true
  }`, el harem de ESE perfil queda sincronizado según las reglas de
  `syncHarem`, el harem de cualquier otro perfil queda intacto,
  `isActive`/`alias`/`order` de todos los perfiles quedan intactos.
- Pegar un texto válido cuyo nombre coincide con OTRO perfil del mismo
  repositorio (no el activo) → `PROFILE_MISMATCH` con
  `pastedProfileName` igual al nombre de ese otro perfil; ningún perfil
  del repositorio cambia.
- Pegar un texto válido con un nombre que no coincide con ningún perfil
  existente → `PROFILE_MISMATCH` con `pastedProfileName` igual al
  nombre detectado; no se crea ningún perfil nuevo (a diferencia de
  `createProfileFromPaste`).
- Pegar un texto no reconocible → `NO_VALID_SERIES_OR_CHARACTER`; ningún
  perfil cambia.
- `activeProfileId` que no corresponde a ningún perfil del repositorio →
  `NO_ACTIVE_PROFILE`; ningún perfil cambia.
