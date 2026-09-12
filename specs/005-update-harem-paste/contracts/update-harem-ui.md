# Contrato: UI de "Actualizar harem" (`UpdateHaremButton` / `UpdateHaremModal`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna.

## `UpdateHaremButton`

- **Responsabilidad única**: el icono "Actualizar harem" (FR-001),
  montado como segundo hijo de `HeaderActions` (junto a
  `ShareHaremButton` de `004`); su estado habilitado/deshabilitado, la
  apertura del modal, y el feedback de éxito una vez cerrado.
- **Estado habilitado**: `activeProfile` existe (FR-001, FR-009) —
  a diferencia de `ShareHaremButton`, NO depende de que el harem tenga
  personajes cargados: un harem vacío también puede actualizarse.
  Deshabilitado (`disabled` + `aria-disabled="true"`) cuando no hay
  ningún perfil activo.
- **Al activarse, estando habilitado**: abre `<UpdateHaremModal />`.
- **Cuando `UpdateHaremModal` invoca `onUpdated()`** (actualización
  exitosa): cierra el modal y muestra `<Toast variant="success">` con un
  mensaje confirmando que el harem se actualizó (FR-008); se
  autodescarta solo, mismo componente `Toast` de `004`.
- **Cuando el usuario cierra `UpdateHaremModal` sin actualizar**
  (Escape, click afuera, botón "X"): el modal se cierra sin mostrar
  ningún `Toast` (ni éxito ni error) — cerrar sin completar no es un
  fallo del sistema.
- **Icono**: `RefreshCw` de `lucide-react`, mismo botón redondo
  (`border-radius: theme.radii.pill`) que `ShareHaremButton`.
- **Accesibilidad**: `aria-label="Actualizar harem"`, foco visible con
  teclado, activable con `Enter`/`Space`.

## `UpdateHaremModal`

- **Responsabilidad única**: pedir un nuevo texto de harem y aplicar
  `updateActiveProfileHarem`, mostrando el resultado correspondiente sin
  salir del modal (salvo en éxito, que se comunica al padre vía
  `onUpdated`).
- **Props**: `onClose: () => void`, `onUpdated: () => void`.
- **Construido sobre** el `Modal` genérico ya existente, reutilizando su
  cierre por Escape/click-afuera/botón "X" sin duplicar esa lógica.
- **Vista por defecto (`paste`)**: una zona de pegado (`contentEditable`
  + evento `paste`, mismo mecanismo que `PasteHaremScreen` de `001`) con
  una breve indicación de cómo obtener el mensaje actualizado de Mudae
  (reutiliza el mismo comando `$mmaikrs` mencionado en `PasteHaremScreen`).
- **Al recibir un pegado**, llama a `updateActiveProfileHarem(activeProfile.id, texto)`
  y limpia la zona de pegado, luego:
  - `{ ok: true }` → invoca `onUpdated()` (no cambia de vista
    internamente; el padre decide cerrar el modal).
  - `{ ok: false, reason: 'NO_VALID_SERIES_OR_CHARACTER' }` → permanece
    en la vista `paste`, mostrando un mensaje de error inline (mismo
    texto/criterio que ya usa `PasteHaremScreen`: "No se reconoció el
    formato del harem pegado...").
  - `{ ok: false, reason: 'PROFILE_MISMATCH', pastedProfileName }` →
    cambia a la vista `mismatch`: un mensaje que menciona
    `pastedProfileName` (el nombre detectado en el texto pegado) y el
    nombre/alias del perfil que se está actualizando, aclarando que no
    coinciden, más un botón "Reintentar" que vuelve a la vista `paste`
    (limpia, sin error previo).
  - `{ ok: false, reason: 'NO_ACTIVE_PROFILE' }` → rama defensiva
    inalcanzable desde la UI normal (el botón que abre este modal ya
    exige `activeProfile`); si ocurriera, se trata igual que un error de
    formato inline en la vista `paste`.
- **Clicks/pegados repetidos**: cada pegado nuevo reevalúa desde cero
  contra el `activeProfile` vigente en ese momento; no se apilan
  múltiples vistas de advertencia ni mensajes de error a la vez (el
  último pegado siempre reemplaza el estado de vista anterior).

## Casos borde cubiertos por el contrato

- Sin ningún perfil activo al momento de renderizar el header →
  `UpdateHaremButton` nace deshabilitado, sin necesidad de que el
  usuario intente abrir el modal primero (FR-001).
- El perfil activo cambia (el usuario activa otro perfil) mientras
  `UpdateHaremModal` está abierto → el próximo pegado dentro del modal
  se evalúa contra el perfil activo vigente en ese momento, no contra el
  que estaba activo cuando se abrió el modal (evita actualizar un perfil
  que el usuario ya dejó de ver).
- Viewport angosto (~390px, Principio V): la zona de pegado y el mensaje
  de discordancia deben leerse completos dentro del modal sin necesitar
  scroll horizontal, igual que `PasteHaremScreen`/`ProfilesModal` ya
  validado en `001`/`002`.

## Testing de este contrato

- `UpdateHaremButton` deshabilitado sin perfil activo; habilitado con
  perfil activo aunque su harem esté vacío (a diferencia de
  `ShareHaremButton`).
- Abrir el modal, pegar un texto válido del mismo perfil → el modal se
  cierra y aparece un `Toast` de éxito.
- Pegar un texto válido de OTRO nombre de perfil → aparece la vista de
  advertencia con el nombre detectado (no un `Toast` de error); tocar
  "Reintentar" vuelve a la zona de pegado; el modal sigue abierto en
  todo momento hasta que el usuario lo cierra explícitamente.
- Pegar un texto no reconocible → mensaje de error inline en la misma
  zona de pegado, sin cambiar a la vista de advertencia.
- Cerrar el modal (Escape) en cualquiera de las vistas anteriores → no
  aparece ningún `Toast`, y una verificación con el `ProfileRepository`
  de test confirma que el harem del perfil activo no cambió.
