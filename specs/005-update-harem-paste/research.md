# Research: Actualizar Harem por Re-Pegado

**Feature**: `005-update-harem-paste` | **Date**: 2026-09-11

El stack, la arquitectura DDD y el sistema de tokens ya están fijados
(constitución v1.3.0) y `004` ya estableció el patrón de icono redondo +
`HeaderActions` + `Toast`. Esta sección cubre únicamente las decisiones
nuevas de esta feature.

## Decisión: caso de uso nuevo y dedicado, no reutilizar `createProfileFromPaste`

- **Decision**: se agrega `application/useCases/updateActiveProfileHarem.ts`,
  un caso de uso nuevo y separado de `createProfileFromPaste.ts` (de
  `001`/`002`), en vez de reutilizar ese último desde el nuevo modal.
- **Rationale**: `createProfileFromPaste` decide crear-o-sincronizar
  buscando **cualquier** perfil existente cuyo `id` coincida con el
  nombre extraído del pegado — si coincide con un perfil que NO es el
  activo, lo sincroniza a ÉL y lo activa, cambiando silenciosamente cuál
  perfil está activo. Ese es exactamente el comportamiento que el pedido
  original del usuario buscaba evitar ("la única condición es que el
  nombre de usuario sea igual al perfil donde se está actualizando"): el
  nuevo caso de uso compara el nombre pegado **únicamente** contra el
  `id` del perfil activo que se pasa explícitamente como parámetro, y
  ante cualquier discordancia (con el activo o con cualquier otro
  perfil) se bloquea sin tocar nada — nunca reasigna la operación a otro
  perfil.
- **Alternatives considered**: agregar un parámetro opcional
  `scopedToProfileId` a `createProfileFromPaste` para acotar su
  búsqueda — se descarta porque ese caso de uso también maneja la ruta
  de "crear un perfil nuevo" (cuando no hay ningún match), que no tiene
  sentido para "actualizar": si el nombre pegado no coincide con nada,
  acá NO se debe crear un perfil nuevo, se debe advertir. Forzar ambos
  comportamientos dentro de la misma función con flags aumentaría su
  complejidad condicional más de lo que ahorra en líneas compartidas.

## Decisión: forma del resultado del caso de uso

- **Decision**:
  ```ts
  export type UpdateActiveProfileHaremResult =
    | { ok: true }
    | { ok: false; reason: 'NO_VALID_SERIES_OR_CHARACTER' }
    | { ok: false; reason: 'PROFILE_MISMATCH'; pastedProfileName: string }
    | { ok: false; reason: 'NO_ACTIVE_PROFILE' }

  function updateActiveProfileHarem(
    repository: ProfileRepository,
    activeProfileId: string,
    rawText: string,
  ): UpdateActiveProfileHaremResult
  ```
- **Rationale**: tres motivos de falla distintos requieren tres mensajes
  distintos en la UI (FR-004 vs FR-006 de `spec.md`): texto no
  reconocible, nombre de perfil distinto (con el nombre detectado para
  mostrarlo, SC-004), y un perfil activo inexistente (caso defensivo:
  la UI solo muestra el icono/modal cuando hay un perfil activo, así que
  esta rama es prácticamente inalcanzable, pero mantiene el tipo total
  sin recurrir a asserts inseguros en `ProfilesContext`).
- **Alternatives considered**: devolver un `boolean` + un mensaje de
  error genérico en un string — se descarta porque la UI necesita
  distinguir programáticamente el caso "discordancia de nombre" (para
  mostrar la vista de advertencia con el nombre detectado) del caso
  "formato inválido" (para mostrar el mensaje ya existente en el flujo
  de alta de perfiles), igual que ya hace `CreateProfileFromPasteResult`
  con su campo `reason`/`mode`.

## Decisión: comparación de nombre de perfil por `id`, no por `alias`

- **Decision**: la comparación es `parsed.profileName === activeProfileId`,
  donde `activeProfileId` es `Profile.id` (el identificador inmutable
  fijado la primera vez que se pegó el harem, `002`), no `Profile.alias`
  (editable libremente).
- **Rationale**: es el mismo criterio que ya usa `createProfileFromPaste`
  para decidir sync-vs-create, y es el único valor que sigue reflejando
  de forma confiable el nombre de usuario real de Mudae/Discord en cada
  pegado — un `alias` editado (p. ej. a "Mi cuenta principal") ya no
  tiene relación con lo que Mudae va a mandar en el próximo pegado, así
  que compararlo produciría falsos "discordancia" constantes para
  cualquier perfil renombrado.
- **Alternatives considered**: comparar contra `alias` — se descarta por
  la razón anterior; comparar contra ambos (`id` O `alias`) — se
  descarta por innecesariamente permisivo: abriría la puerta a que un
  alias coincidiera por casualidad con el nombre de otro usuario de
  Mudae y la actualización pasara sin la advertencia que exige la spec.

## Decisión: reconciliación de personajes — reutilizar `syncHarem` sin cambios

- **Decision**: una vez confirmado que el nombre coincide, el nuevo
  harem se calcula con `syncHarem(activeProfile.harem, parsed.series)`
  (mismo módulo de `domain/harem/syncHarem.ts` que ya usa
  `createProfileFromPaste` en su rama de sincronización), sin ninguna
  modificación a esa función.
- **Rationale**: el pedido del usuario ("el harem que se pasa sobrescribe
  el actual") describe exactamente el comportamiento que `syncHarem` ya
  implementa (agregar nuevos, actualizar coincidentes por claim rank,
  eliminar ausentes) — es el mismo criterio de "actualizar re-pegando"
  que la app ya expone hoy de forma implícita al pegar un segundo
  mensaje del mismo perfil en el flujo de alta; esta feature solo agrega
  un punto de entrada explícito para dispararlo desde el perfil ya
  activo, sin inventar un segundo algoritmo de reconciliación.
- **Alternatives considered**: un reemplazo total y literal del harem
  (sin preservar ningún `id` interno de personaje) — se descarta porque
  perdería la ventaja ya documentada de `syncHarem` (conservar el `id`
  interno de un personaje sin cambios reales evita, por ejemplo,
  re-disparar animaciones de entrada innecesariamente), sin ningún
  beneficio a cambio.

## Decisión: dónde vive el modal de re-pegado y cómo presenta la advertencia

- **Decision**: `UpdateHaremModal`, un componente nuevo construido sobre
  el `Modal` genérico (mismo patrón que `ManualCopyDialog` de `004`),
  con su **propia** zona de pegado (`contentEditable` + evento `paste`,
  mismo mecanismo visual que `PasteHaremScreen` de `001`, duplicado
  puntualmente en `UpdateHaremModal/styles.tsx` en vez de importarlo).
  La advertencia de discordancia de nombre se muestra **dentro del mismo
  modal**, reemplazando la zona de pegado por una vista de aviso con el
  nombre detectado y un botón "Reintentar" que vuelve a mostrar la zona
  de pegado (limpia) — no se abre un segundo modal apilado.
- **Rationale**:
  - No reutilizar `PasteHaremScreen` tal cual: ese componente está
    acoplado a `createProfileFromPaste` y a los dos únicos resultados
    que maneja (éxito/formato inválido); forzarlo a soportar un tercer
    resultado (discordancia de nombre) con un caso de uso distinto
    aumentaría su complejidad condicional para un consumidor (alta de
    perfil) que no lo necesita. Duplicar la zona de pegado (un
    `contentEditable` + su estilo, ~15 líneas) es más barato y mantiene
    cada componente enfocado en una sola responsabilidad (Principio
    VII), a costa de una duplicación menor de marcado/estilo, no de
    lógica de negocio (que vive enteramente en `updateActiveProfileHarem`
    reutilizado por completo).
  - Una sola vista dentro de un único modal (en vez de apilar un segundo
    `Modal` con `zIndex.nestedDialog`, como hace
    `ConfirmDeleteProfileDialog` dentro de `ProfilesModal`) alcanza para
    cumplir FR-006/FR-007: el usuario puede cerrar el modal en cualquier
    momento (Escape/click afuera/botón "X", ya provistos por `Modal`) o
    tocar "Reintentar" para volver a pegar sin salir del flujo — no hace
    falta la semántica de "diálogo encima de otro diálogo" que sí
    necesita `ConfirmDeleteProfileDialog` (que se abre desde dentro de
    `ProfilesModal`, un modal distinto).
- **Alternatives considered**: refactorizar `PasteHaremScreen` para
  aceptar un caso de uso y un mapeo de resultados inyectados por props —
  se descarta por alterar un componente ya probado de una feature
  anterior sin necesidad real, y porque sus dos consumidores (alta de
  perfil, actualización) terminarían compartiendo muy poco marcado real
  una vez que cada uno maneja resultados distintos.

## Decisión: feedback de éxito — reutilizar `Toast` de `004`

- **Decision**: al actualizar con éxito, `UpdateHaremModal` invoca un
  callback `onUpdated()` que el componente padre (`UpdateHaremButton`)
  usa para cerrar el modal y mostrar el mismo componente `Toast`
  (`presentation/components/Toast`, de `004`) con variante `success`,
  sin ninguna modificación a `Toast`.
- **Rationale**: `Toast` ya es genérico (`variant`, `message`,
  `onDismiss`) y no depende de `ShareHaremButton` ni de ningún estado de
  "compartir" — es exactamente el mismo tipo de feedback no bloqueante
  que pide FR-008 acá. Reutilizarlo evita duplicar el componente de
  feedback por segunda vez en la misma app.
- **Alternatives considered**: mostrar el éxito como un mensaje inline
  dentro del propio modal antes de cerrarlo — se descarta por
  inconsistencia visual con el patrón de feedback ya establecido por
  `004` para acciones del mismo `HeaderActions`.

## Decisión: icono y botón redondo — duplicar `RoundIconButton`, no compartirlo entre carpetas

- **Decision**: `UpdateHaremButton/styles.tsx` define su propio
  `RoundIconButton` (icono `RefreshCw` de `lucide-react`), con el mismo
  CSS que el `RoundIconButton` de `ShareHaremButton/styles.tsx` (de
  `004`), en vez de extraer un styled-component compartido entre ambas
  carpetas de componente.
- **Rationale**: la convención de la constitución (Principio VII) es que
  cada componente vive en su propia carpeta con sus propios
  `index.tsx`/`styles.tsx` autocontenidos; no describe un mecanismo de
  estilos compartidos entre carpetas de componentes hermanos. Duplicar
  un bloque CSS de ~15 líneas es más barato que introducir una excepción
  a esa convención (un archivo de estilos compartido, o un import
  cruzado entre carpetas de componente) para dos únicos consumidores.
- **Alternatives considered**: extraer `RoundIconButton` a un archivo
  compartido (p. ej. dentro de `HeaderActions/styles.tsx`, importado por
  ambos botones) — se descarta por las razones anteriores; si en una
  futura feature del mismo conjunto de iconos aparece un tercer
  consumidor, ese es el momento natural para evaluar extraer la
  abstracción compartida, no antes (YAGNI).

**Resultado**: no quedan `NEEDS CLARIFICATION` pendientes en el
Technical Context del plan.
