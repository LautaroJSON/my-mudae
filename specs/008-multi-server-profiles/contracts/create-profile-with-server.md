# Contrato: `createProfileWithServer` y el `updateActiveProfileHarem` actualizado

**Módulo**: `application/useCases/createProfileWithServer.ts` y
`application/useCases/updateActiveProfileHarem.ts` (modificado) — casos
de uso de `application/`.

## `createProfileWithServer`

### Firma

```ts
function createProfileWithServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  parsedUsername: string,
  parsedSeries: ParsedSeries[],
  serverChoice: ServerChoice,
): CreateProfileWithServerResult
```

Ver `data-model.md` para `ServerChoice`/`CreateProfileWithServerResult`.

### Precondiciones

- `parsedUsername`/`parsedSeries` ya vienen de un `parseHaremMessage`
  con `ok: true` — este caso de uso NO parsea texto crudo (FR-001, ver
  research.md "flujo en dos pasos").
- `serverChoice.kind === 'new-server'` implica que la UI ya validó el
  límite de 50 caracteres (FR-002) antes de llegar acá.

### Postcondiciones

- **`serverChoice.kind === 'existing-server'` con un `serverId` que no
  existe** (caso defensivo — condición de carrera si el servidor se
  eliminó entre que se abrió el pedido y se confirmó): devuelve
  `{ ok: false, reason: 'SERVER_NOT_FOUND' }`, sin persistir nada en
  ninguna de las dos colecciones.
- **`serverChoice.kind === 'new-server'`**: crea un `Server` nuevo
  (`id` generado, `name` = el texto indicado, `profileIds: []`
  inicialmente) y lo agrega a `Server[]` antes de continuar.
- **Coincidencia** (crear-vs-sincronizar, FR-007): se busca en
  `profileRepository.getAll()` un perfil con
  `profile.serverId === targetServer.id && profile.username === parsedUsername`.
  - **Si existe**: se sincroniza su harem (`syncHarem`, mismo criterio
    ya usado por `syncHarem`/`005`), se activa ese perfil (desactivando
    cualquier otro), se persiste `Profile[]`; `Server[]` se persiste
    igual (sin cambios de membresía, ya estaba incluido) →
    `{ ok: true, mode: 'synced' }`.
  - **Si no existe**: se crea un `Profile` nuevo (`id` UUID nuevo,
    `serverId = targetServer.id`, `username = parsedUsername`,
    `alias = parsedUsername`, `isActive: true`, harem construido desde
    `parsedSeries` igual que hoy), se desactivan los demás perfiles, se
    persiste `Profile[]`; se agrega el nuevo `id` a `targetServer.
    profileIds` (`addProfileToServer`) y se persiste `Server[]` →
    `{ ok: true, mode: 'created' }`.
- Un perfil con el mismo `username` en OTRO servidor (`serverId`
  distinto) nunca coincide — siempre se trata como un perfil nuevo
  independiente (FR-007), incluso si el servidor elegido ya tiene otro
  perfil con un `username` distinto.

### Casos borde cubiertos por el contrato

- Elegir un servidor existente que ya tiene el mismo `username` →
  sincroniza ese perfil (no crea un duplicado).
- Elegir "servidor nuevo" con un nombre que coincide textualmente con
  uno ya existente → crea un servidor distinto (mismo nombre, `id`
  distinto) — nunca reutiliza el existente por coincidencia de texto
  (edge case de `spec.md`).
- `serverId` de un `existing-server` que ya no existe → `SERVER_NOT_FOUND`,
  no persiste nada.

### Testing de este contrato

- Con un `ServerRepository`/`ProfileRepository` en memoria vacíos:
  elegir `new-server` con nombre "Mi server" → crea el servidor y el
  perfil, y el servidor queda con `profileIds: [nuevoId]`.
- Con un servidor ya existente sin perfiles: elegir `existing-server`
  con ese id → el perfil nuevo se agrega a `profileIds` de ESE
  servidor, sin crear un servidor adicional.
- Con un perfil ya existente (mismo `serverId` + `username`): repetir el
  alta con el mismo servidor y username → `mode: 'synced'`, sin
  duplicar el perfil ni la membresía en `profileIds`.
- Con el mismo `username` pero eligiendo un servidor DISTINTO al que ya
  lo tiene: → `mode: 'created'`, perfil nuevo e independiente; el
  perfil del otro servidor queda intacto.
- `existing-server` con un id inexistente → `SERVER_NOT_FOUND`, ambos
  repositorios quedan sin cambios.

## `updateActiveProfileHarem` (modificado)

### Cambio de contrato

- **Antes**: comparaba `parsed.profileName !== activeProfileId`.
- **Ahora**: resuelve `target = profiles.find(p => p.id === activeProfileId)`
  primero (antes de comparar, no después), y compara
  `parsed.profileName !== target.username`. El resto del contrato
  (`NO_VALID_SERIES_OR_CHARACTER`, `PROFILE_MISMATCH` con
  `pastedProfileName`, `NO_ACTIVE_PROFILE`, sincronización vía
  `syncHarem`) **no cambia** — ver
  `specs/005-update-harem-paste/contracts/update-active-profile-harem.md`
  para el resto del comportamiento, que sigue vigente tal cual.
- **Por qué no hace falta comparar también el servidor**: `target.
  serverId` es fijo desde la creación del perfil y nunca proviene del
  texto pegado (el mensaje de Mudae no incluye el servidor de Discord)
  — comparar contra `target.username` ya captura exactamente "¿es la
  misma cuenta de Mudae que este perfil, en el servidor que ya tenía
  fijado?" (ver research.md).

### Testing de este contrato

- Reutiliza los mismos casos ya cubiertos en `005` (formato inválido,
  discordancia de nombre, éxito, perfil activo inexistente), ajustando
  los fixtures de `Profile` al nuevo shape (`serverId`/`username` en vez
  de `id = username`).
- Caso nuevo: dos perfiles con el mismo `username` en servidores
  distintos, uno de ellos activo → actualizar el activo con un pegado
  de ESE mismo `username` sincroniza el perfil activo correcto, sin
  afectar al perfil del otro servidor (aunque comparta `username`).
