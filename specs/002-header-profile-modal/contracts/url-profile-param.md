# Contrato: parámetro `id` en la URL

**Módulos**: `presentation/urlParams.ts` (leer/armar la URL, funciones
puras sobre un `string` de query) + wiring en la inicialización de
`ProfilesContext` (efecto de lectura al montar) + el botón "abrir en
pestaña nueva" de `ProfileCard`.

## Funciones

```ts
function getProfileIdFromUrl(search: string): string | undefined
function buildProfileUrl(origin: string, pathname: string, profileId: string): string
```

Puras sobre strings — no acceden a `window` directamente (quien las llama
les pasa `window.location.search`/`origin`/`pathname`), para poder
testearlas sin DOM real si hiciera falta.

## Comportamiento al cargar la app (FR-017)

1. `ProfilesContext` lee `getProfileIdFromUrl(window.location.search)` al
   inicializar, después de que `migrateLegacyProfiles` ya corrió (vía
   `repository.getAll()`).
2. Si hay un `id` en la URL:
   - si coincide con un perfil existente → ese perfil se activa
     (equivalente a `activateProfile`, incluye persistir el cambio) antes
     del primer render; el estado expuesto por el contexto refleja ya ese
     perfil como activo.
   - si NO coincide con ningún perfil → el perfil activo persistido NO se
     toca (no se desactiva ni se cambia nada), y el contexto expone un
     indicador de "perfil no encontrado" para que `presentation/` muestre
     un estado claro en esa pestaña (Edge Case de `spec.md`; nunca se
     sustituye silenciosamente por otro perfil).
3. Si NO hay `id` en la URL, no se toca nada — se usa el perfil activo
   que ya hubiera, igual que hoy.

## Comportamiento de "abrir en pestaña nueva" (FR-012/FR-013)

- Se arma la URL con `buildProfileUrl` a partir del `id` del perfil de
  esa fila (nunca del alias, que puede repetirse entre perfiles).
- Se abre con `window.open(url, '_blank', 'noopener,noreferrer')` — la
  pestaña original NO cambia su propio estado ni su URL.

## Multi-pestaña (FR-018)

- Cada pestaña resuelve su perfil activo una sola vez, al cargar
  (comportamiento del punto anterior). Ninguna pestaña ya abierta
  escucha cambios en `localStorage` hechos por otra pestaña (no hay
  listener de `storage` en esta feature), así que dos pestañas pueden
  mostrar perfiles distintos de forma estable mientras ambas sigan
  abiertas, incluso si el perfil activo persistido cambia por una de
  ellas.

## Testing de este contrato

- `getProfileIdFromUrl('?id=rodoifin')` → `'rodoifin'`;
  `getProfileIdFromUrl('')` → `undefined`.
- `buildProfileUrl(...)` produce una URL con `?id=<profileId>` bien
  codificado (`encodeURIComponent`) para alias/ids con espacios o
  caracteres especiales.
- Test de integración: montar la app con `?id=` de un perfil existente
  entre varios → ese perfil queda activo; con un `id` que no existe →
  el perfil activo no cambia y se expone el estado de "no encontrado".
