# Contrato: `migrateLegacyProfiles`

**Módulo**: `domain/profile/migrateLegacyProfiles.ts` — función pura.
**Caller**: `infrastructure/storage/LocalStorageProfileRepository.getAll()`,
de forma transparente (ver `research.md`).

## Firma

```ts
function migrateLegacyProfiles(raw: unknown[]): Profile[]
```

Recibe el array tal como sale de `JSON.parse` sobre lo persistido (puede
ya estar en la forma nueva, en la forma vieja de `001`, o vacío).

## Precondiciones

- Ninguna — debe tolerar tanto perfiles ya migrados (con `alias`/`order`)
  como perfiles con la forma vieja (`{id: uuid, name, ...}` sin esos
  campos), mezclados en el mismo array si hiciera falta.

## Postcondiciones

- Todo elemento del resultado tiene `alias` y `order` definidos.
- Un elemento que YA tenía `alias`/`order` se devuelve sin modificar
  (idempotencia: correr la migración dos veces da el mismo resultado).
- Un elemento con la forma vieja se transforma: `alias := name`,
  `id := dedupe(name)`, `order := <índice original en el array de
  entrada>`. `harem`, `isActive`, `createdAt` no se tocan.
- El resultado nunca tiene dos elementos con el mismo `id` (regla de
  desambiguación con sufijo `-2`, `-3`, ... aplicada en orden de
  aparición en el array de entrada).

## Contrato del caller (`LocalStorageProfileRepository.getAll()`)

- Tras aplicar `migrateLegacyProfiles`, si el resultado difiere del array
  crudo leído (algún perfil no tenía `alias`/`order` todavía), el
  repositorio DEBE persistir el resultado migrado inmediatamente
  (`save()`) antes de devolverlo, para que la migración no vuelva a
  correr en la próxima carga.

## Testing de este contrato

- Array vacío → `[]`.
- Array ya migrado → se devuelve sin cambios (mismo `id`/`alias`/`order`
  en cada elemento).
- Array con forma vieja, sin nombres repetidos → cada `id` pasa a ser su
  `name` original, `order` sigue el índice del array.
- Array con forma vieja y dos perfiles con el mismo `name` → el primero
  conserva el nombre limpio como `id`, el segundo recibe el sufijo `-2`.
