# Contrato: `ProfileRepository` (puerto de `application/`)

**Módulo**: interfaz en `application/ports/ProfileRepository.ts`,
implementada en `infrastructure/storage/LocalStorageProfileRepository.ts`.
**Tipo de contrato**: puerto/adaptador interno (no hay API HTTP en esta
app client-only) — es la única frontera por la que `application/` toca
persistencia, cumpliendo el aislamiento de capas de la constitución.

## Interfaz

```ts
interface ProfileRepository {
  getAll(): Profile[];
  save(profiles: Profile[]): void;
}
```

Se modela como "leer todo / guardar todo" (no CRUD granular por perfil)
porque el volumen de datos de esta feature (perfiles + harems de un solo
usuario, en el navegador de ese usuario) no lo justifica; mantiene la
implementación de `infrastructure/` simple (Principio IV, simplicidad).

## Precondiciones

- `save` recibe siempre la colección completa y consistente de `Profile[]`
  ya validada por `application/` (invariantes de `data-model.md` ya
  cumplidas: a lo sumo un `isActive: true`, ninguna `Series` vacía,
  ningún `Character` sin `name`/`imageUrl`).

## Postcondiciones

- `getAll()` devuelve `[]` si no hay nada persistido todavía (primera
  vez que se abre la app) — nunca lanza una excepción por ausencia de
  datos; ese es precisamente el estado "0 perfiles" de FR-010.
- `save(profiles)` persiste de forma síncrona y automática (FR-023); el
  caller (`application/`) la invoca después de cada operación que
  modifica el estado (crear, renombrar, eliminar, activar), sin que el
  usuario dispare un guardado manual.
- Un `getAll()` inmediatamente después de un `save(profiles)` devuelve
  datos equivalentes a `profiles` (round-trip fiel a través de
  serialización JSON).

## Manejo de errores

- Si `localStorage` no está disponible o lanza (cuota excedida, modo
  privado restrictivo, etc.), `LocalStorageProfileRepository` DEBE
  capturar el error y no dejar que se propague como una excepción no
  controlada hacia `presentation/`; `application/` decide cómo informarlo
  (ver `quickstart.md` para el caso de verificación manual). Este
  comportamiento no está cubierto por un FR explícito de la spec, pero se
  deriva directamente del Principio I de la constitución (la persistencia
  nunca debe hacer que el usuario pierda su harem de forma silenciosa).

## Testing de este contrato

- Se testea con una implementación en memoria (`InMemoryProfileRepository`,
  solo para tests) que cumple la misma interfaz, para poder testear
  `application/` sin tocar `localStorage` real.
- `LocalStorageProfileRepository` se testea por separado (con
  `localStorage` real o un mock de `Storage`) verificando el round-trip
  de serialización/deserialización y el manejo de errores descrito arriba.
