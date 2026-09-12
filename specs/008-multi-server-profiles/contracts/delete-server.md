# Contrato: `deleteServer` y el `deleteProfile` actualizado

**Módulo**: `application/useCases/deleteServer.ts` (nuevo) y
`application/useCases/deleteProfile.ts` (modificado).

## `deleteServer`

### Firma

```ts
function deleteServer(
  profileRepository: ProfileRepository,
  serverRepository: ServerRepository,
  serverId: string,
): DeleteServerResult // { ok: true; deletedProfileCount: number }
```

### Postcondiciones

- Elimina el `Server` indicado de `Server[]` (`removeServer`).
- Elimina, en cascada, todos los `Profile` cuyo `serverId === serverId`
  (FR-019) — sin importar si el servidor tenía 0 o más perfiles.
- Si alguno de los perfiles eliminados estaba activo, se activa el que
  indique `pickNextActiveProfileId(serversActualizados,
  profilesActualizados)` (o ninguno, si no queda ningún perfil en
  ningún servidor) — mismo mecanismo que usa `deleteProfile`.
- `deletedProfileCount` es la cantidad de perfiles eliminados (0 si el
  servidor ya estaba vacío) — expuesto para que la UI pueda mostrar
  feedback si hiciera falta, aunque `spec.md` no pide un mensaje de
  éxito específico más allá de que el servidor desaparezca de la lista.
- Es responsabilidad de quien llama a este caso de uso (la UI,
  `ServerPickerModal`/`ConfirmDeleteServerDialog`) decidir SI mostrar
  la advertencia de confirmación antes de invocarlo — este caso de uso
  en sí siempre ejecuta la eliminación completa, sin pedir
  confirmación por su cuenta (esa decisión de UX vive en
  `contracts/server-list-ui.md`, no acá).

### Casos borde cubiertos por el contrato

- `serverId` inexistente → no falla; ambos repositorios quedan sin
  cambios, `deletedProfileCount: 0`.
- Servidor sin perfiles → se elimina solo el servidor,
  `deletedProfileCount: 0`, ningún perfil activo cambia.
- Servidor con el perfil activo entre los eliminados y otros servidores
  con perfiles disponibles → se activa el primer perfil disponible
  según `pickNextActiveProfileId`.
- Servidor con el perfil activo y NINGÚN otro perfil en ningún otro
  servidor → ningún perfil queda activo (igual que hoy cuando se
  elimina el último perfil restante).

### Testing de este contrato

- Con un servidor de 3 perfiles (uno activo) y otro servidor con 1
  perfil: eliminar el primero → los 3 perfiles desaparecen de
  `Profile[]`, el servidor desaparece de `Server[]`, y el único perfil
  del segundo servidor queda activo.
- Eliminar un servidor vacío → `Server[]` pierde ese servidor,
  `Profile[]` no cambia, `deletedProfileCount: 0`.
- Eliminar el único servidor con el único perfil activo → `Profile[]`
  y `Server[]` quedan vacíos, ningún perfil activo.

## `deleteProfile` (modificado)

### Cambio de contrato

- **Firma nueva**: gana un parámetro `serverRepository:
  ServerRepository` (antes solo recibía `profileRepository`).
- **Postcondición nueva**: además de quitar el perfil de `Profile[]`
  (`removeProfile`, ya simplificado — ver `contracts/server-domain.md`),
  ahora también lo quita de `Server.profileIds` vía
  `removeProfileFromServer` (el servidor en sí NO se elimina, aunque
  quede vacío — FR-014).
- **Reactivación**: si el perfil eliminado era el activo, se usa
  `pickNextActiveProfileId` sobre el estado ya actualizado de ambas
  colecciones, en vez de la lógica anterior basada en `Profile.order`
  (que ya no existe).

### Testing de este contrato

- Eliminar un perfil no activo de un servidor con 2+ perfiles → el
  servidor conserva sus otros `profileIds` en el mismo orden relativo;
  ningún cambio de perfil activo.
- Eliminar el perfil activo, quedando otro perfil en el MISMO servidor
  → se activa el siguiente de ese mismo servidor (según su
  `profileIds`).
- Eliminar el único perfil de un servidor, quedando perfiles en OTRO
  servidor → se activa el primero de ese otro servidor; el servidor
  recién vaciado persiste en `Server[]` sin perfiles (FR-014).
