# Contrato: UI de "Compartir harem" (`HeaderActions` / `ShareHaremButton` / `Toast` / `ManualCopyDialog`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna.

## `HeaderActions`

- **Responsabilidad única**: renderizar la lista horizontal de iconos
  redondos de acciones rápidas en la esquina superior derecha (FR-001).
  En esta iteración monta un único hijo, `<ShareHaremButton />`.
- **Props**: ninguna en esta iteración (no recibe callbacks ni estado —
  cada icono que contiene resuelve sus propias dependencias vía
  `useProfiles()`, igual que hace `ShareHaremButton`).
- **No** decide habilitado/deshabilitado ni feedback de ningún icono
  individual — esa lógica vive en cada botón de acción.

## `ShareHaremButton`

- **Responsabilidad única**: el icono "Compartir harem" (FR-002),
  incluyendo su estado habilitado/deshabilitado y su feedback de
  éxito/error.
- **Estado habilitado**: `activeProfile` existe y
  `countCharacters(activeProfile.harem) > 0` (FR-007). Deshabilitado en
  cualquier otro caso (`disabled` + `aria-disabled="true"`), sin
  ejecutar ningún handler al tocarlo.
- **Al activarse (click/tap/Enter con foco), estando habilitado**:
  1. Genera `const text = formatHaremMessage(activeProfile.harem al
     nivel de profile completo)` — ver `format-harem-message.md`. Si
     esto lanzara una excepción inesperada (no debería, con datos
     válidos), se trata como falla: pasa directamente al estado
     `error` sin intentar copiar nada.
  2. Llama a `copyTextToClipboard(text)`.
     - Si resuelve `true`: estado `success`, muestra `<Toast
       variant="success">` con un mensaje confirmando que el harem fue
       copiado (FR-006). Se autodescarta solo tras un breve delay.
     - Si resuelve `false`: abre `<ManualCopyDialog text={text} />`
       (fallback de selección manual, Principio VI) en vez de mostrar de
       entrada un error — el usuario todavía puede completar la copia a
       mano.
       - Si el usuario cierra el diálogo tras confirmar que copió (botón
         "Listo"/cerrar): estado `success` (mismo feedback que el camino
         programático — desde la perspectiva del usuario, el harem
         quedó copiado).
       - Si el usuario cierra el diálogo sin usar el botón de
         confirmación (Escape, click afuera, "X"): no se asume éxito;
         no se muestra ni éxito ni error, simplemente se vuelve a
         `idle` (el usuario decidió no completar la acción, no es un
         fallo del sistema).
  3. Clicks repetidos mientras ya hay un `Toast`/diálogo abierto:
     reinician el flujo desde el paso 1 con el texto recalculado en ese
     momento (siempre refleja el estado actual del harem, Principio II)
     — no se apilan múltiples `Toast`s ni diálogos a la vez.
- **Icono**: `Copy` de `lucide-react`, dentro de un botón redondo
  (`border-radius: theme.radii.pill`).
- **Accesibilidad**: `aria-label="Compartir harem"` (o equivalente
  descriptivo), foco visible con teclado, activable con `Enter`/`Space`
  como cualquier `<button>` nativo.

## `Toast`

- **Responsabilidad única**: mostrar un mensaje de feedback temporal, no
  bloqueante, con variante visual `success` o `error`.
- **Props**: `variant: 'success' | 'error'`, `message: string`,
  `onDismiss: () => void` (invocado automáticamente tras el timeout
  interno, o manualmente si el componente expone un cierre explícito).
- **No** mantiene su propia cola ni estado global — cada consumidor
  (por ahora, solo `ShareHaremButton`) controla cuándo se monta y
  desmonta.
- Usa `theme.zIndex.toast` para asegurarse de quedar por encima de
  cualquier otro contenido (incluida, si estuviera abierta,
  `ManualCopyDialog`).

## `ManualCopyDialog`

- **Responsabilidad única**: el fallback de "selección de texto manual"
  del Principio VI, para cuando `copyTextToClipboard` devuelve `false`.
- **Construido sobre** el `Modal` genérico ya existente
  (`presentation/components/Modal`), sin duplicar su patrón de
  overlay/cierre por Escape/click-afuera/botón "X".
- **Props**: `text: string`, `onConfirm: () => void` (el usuario indica
  que ya copió manualmente), `onClose: () => void` (cierre sin
  confirmar).
- **Contenido**: una breve explicación de que el copiado automático no
  funcionó, un `<textarea readOnly value={text}>` que se autoselecciona
  al montar (`autoFocus` + `select()` en un `useEffect`), y un botón
  "Listo, ya lo copié" que invoca `onConfirm`.
- **No** vuelve a intentar `copyTextToClipboard` — es puramente el
  camino manual; reintentar automáticamente ya se probó y falló antes de
  llegar acá.

## Casos borde cubiertos por el contrato

- Sin perfil activo o harem vacío al momento del render inicial del
  header → `ShareHaremButton` nace deshabilitado, sin necesidad de que
  el usuario intente tocarlo primero (FR-007).
- El perfil activo cambia (el usuario activa otro perfil) mientras el
  `Toast` de un compartido anterior todavía está visible → el `Toast`
  en curso no se ve afectado (ya capturó su propio texto), pero un
  compartido nuevo siempre usa el `activeProfile` vigente en ese
  momento.
- Viewport angosto (~390px, Principio V): `HeaderActions` no debe forzar
  scroll horizontal en el header ni tapar el `ProfileButton` — ambos
  deben convivir dentro del ancho disponible (ver `quickstart.md`,
  Escenario 3).

## Testing de este contrato

- `ShareHaremButton` deshabilitado cuando no hay perfil activo, y cuando
  hay uno con harem vacío; habilitado con harem no vacío.
- Click con `copyTextToClipboard` mockeado a `true` → aparece `Toast`
  variant `success` con el mensaje esperado, y desaparece solo tras el
  timeout (usando fake timers).
- Click con `copyTextToClipboard` mockeado a `false` → aparece
  `ManualCopyDialog` (no un `Toast` de error de entrada); confirmar
  dentro del diálogo → pasa a `Toast` variant `success`; cerrar sin
  confirmar → no aparece ningún `Toast`.
- Verificación de accesibilidad básica: el botón deshabilitado tiene
  `aria-disabled`/`disabled`, y es alcanzable/activable por teclado
  cuando está habilitado.
