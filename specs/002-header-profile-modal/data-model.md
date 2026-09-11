# Data Model: Header con Modal de Perfiles

**Feature**: `002-header-profile-modal` | **Date**: 2026-09-11

Extiende el modelo de `001-multi-profile-harems` (`Profile`, `Harem`,
`Series`, `Character`). Solo se documentan los campos/tipos que cambian o
se agregan; el resto se mantiene igual que en `001/data-model.md`.

## Perfil (`Profile`) — cambios

| Campo | Tipo | Cambio | Notas |
|---|---|---|---|
| `id` | `string` | **Cambia de significado** | Antes: UUID generado. Ahora: el nombre extraído la primera vez que se pegó el harem (o, para perfiles migrados, su `name`/alias al momento de migrar). Único entre todos los perfiles, inmutable de por vida (FR-015). |
| `alias` | `string` | **Nuevo** (reemplaza el uso de `name` como nombre editable) | Nombre visible y editable. Igual al `id` al crear (FR-016); puede editarse libremente después sin afectar al `id`. |
| `order` | `number` | **Nuevo** | Posición manual en la lista, resultado del drag-and-drop (FR-008/009). Se asigna al final del orden existente al crear un perfil nuevo. Reemplaza a `createdAt` como criterio de orden de visualización (`createdAt` se conserva solo a fines de auditoría/debug, ya no ordena la lista). |
| `isActive`, `harem`, `createdAt` | (sin cambios) | — | Mismas reglas que en `001` (a lo sumo un activo, harem 1:1, etc.). |

**Invariantes nuevas/actualizadas**:
- `id` es único entre todos los perfiles en todo momento — incluso
  inmediatamente después de una migración de perfiles previos a esta
  feature (FR-015, con sufijo numérico de desambiguación si hiciera
  falta).
- `order` es único y denso dentro de la colección de perfiles (sin
  huecos) — se renumera por completo cada vez que se persiste un
  reordenamiento, la creación de un perfil nuevo, o la eliminación de
  uno.

## Migración de perfiles previos a esta feature

Dado un perfil con la forma de `001` (`{ id: uuid, name, isActive, harem,
createdAt }`, sin `alias` ni `order`), la migración (función pura,
`domain/profile/migrateLegacyProfiles.ts`) produce:

```ts
{
  id: dedupe(profile.name),   // ver regla de desambiguación abajo
  alias: profile.name,
  order: <índice original en el array>,
  isActive: profile.isActive,
  harem: profile.harem,       // sin cambios
  createdAt: profile.createdAt,
}
```

**Regla de desambiguación** (`dedupe`): si el `id` candidato ya fue usado
por otro perfil migrado en la misma pasada, se le agrega el sufijo
`-2`, `-3`, etc. (el primero que reclama un nombre se queda con el `id`
limpio; los siguientes con el mismo nombre reciben el sufijo). Un perfil
cuya forma persistida YA tiene `alias`/`order` (creado con esta feature
ya instalada) no se toca — la migración es idempotente.

## Harem — funciones derivadas nuevas

No cambia su forma (`{ profileId, series }`), pero se agregan dos
funciones puras de solo lectura en `domain/harem/Harem.ts`, usadas por la
lista de perfiles del modal:

- `countCharacters(harem): number` — total de personajes en todas las
  series del harem.
- `sumKakera(harem): number` — suma de `character.kakera ?? 0` de todos
  los personajes; un harem sin ningún kakera cargado devuelve `0`.

## Sincronización de harem al re-pegar (FR-015a/FR-015b)

Nueva función pura `domain/harem/syncHarem.ts`:

```ts
function syncHarem(currentHarem: Harem, parsedSeries: ParsedSeries[]): Harem
```

Algoritmo (por claim rank, ver `research.md`):

1. Se indexan los personajes actuales del harem por `claimRank`.
2. Por cada personaje de `parsedSeries`:
   - si su claim rank ya existe en el índice → se actualiza ese
     `Character` (nombre, imagen, kakera) **conservando su `id` interno**
     y se lo reubica bajo la serie indicada en el nuevo pegado (por si
     Mudae reagrupó la serie del personaje);
   - si no existe → se crea un `Character` nuevo (`id` generado).
3. Cualquier personaje del harem actual cuyo claim rank no apareció en
   `parsedSeries` se descarta (no pasa a la serie resultante).
4. Las series resultantes se arman a partir de los personajes ya
   resueltos, agrupados por el nombre de serie del pegado más reciente;
   una serie sin ningún personaje no se incluye (mismo invariante que
   `Harem.removeCharacterFromSeries` de `001`).

## Uso de caso: crear-o-sincronizar (reemplaza el flujo de `createProfileFromPaste` de `001`)

`application/useCases/createProfileFromPaste.ts` (mismo archivo,
comportamiento extendido):

```
parsear texto
  → si falla: return { ok: false, reason }
  → si un perfil existente tiene id === parsed.profileName:
      harem := syncHarem(perfil.harem, parsed.series)
      activar ese perfil (desactivar los demás), persistir
      return { ok: true, mode: 'synced', profileId }
  → si no:
      crear Profile nuevo (id = parsed.profileName, alias = id,
        order = siguiente disponible), activar, persistir
      return { ok: true, mode: 'created', profileId }
```

El campo `mode` en el resultado es nuevo (antes el resultado de éxito no
distinguía nada); `presentation/` puede usarlo para un mensaje distinto
("perfil actualizado" vs. "perfil creado"), aunque no es obligatorio para
cumplir los requisitos.

## `zIndex` — nuevo nivel para diálogos anidados

`shared/theme.ts` ya define `zIndex.overlay`/`zIndex.dialog` (10),
`zIndex.dropdown` (20), `zIndex.toast` (30). Con `ProfilesModal` y
`ConfirmDeleteProfileDialog` pudiendo estar ambos abiertos a la vez
(confirmar borrado de un perfil desde dentro del modal de perfiles), se
agrega:

| Token | Valor | Uso |
|---|---|---|
| `zIndex.modal` | 10 | `ProfilesModal` (nivel base de modal) |
| `zIndex.nestedDialog` | 20 | `ConfirmDeleteProfileDialog` cuando se abre encima de otro modal — reemplaza el uso anterior de `zIndex.dialog` para este componente |

`zIndex.dropdown`/`zIndex.toast` se renumeran a 30/40 para dejar 20
reservado a diálogos anidados sin ambigüedad.
