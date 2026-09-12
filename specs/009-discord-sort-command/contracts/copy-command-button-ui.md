# Contrato: UI del botón de copiar (`CopyCommandButton`)

**Tipo de contrato**: contrato de UI de componente de `presentation/`.
Reutiliza tal cual `copyTextToClipboard` (`presentation/copyToClipboard.ts`,
004) y `ManualCopyDialog` (`presentation/components/ManualCopyDialog`,
004) — ver sus contratos ya existentes en
`specs/004-share-harem-clipboard/contracts/`.

## `CopyCommandButton`

- **Responsabilidad única**: el botón "Copiar Comando" (FR-005),
  incluyendo su estado habilitado/deshabilitado y su feedback de
  éxito/error (FR-006, FR-007). No genera el texto del comando — lo
  recibe ya calculado por prop.
- **Props**: `text: string | null` (el resultado de
  `formatSortCommand`, ya resuelto por `SortCommandBar`).
- **Estado habilitado**: `text !== null` (FR-008). Deshabilitado en caso
  contrario (`disabled` + `aria-disabled="true"`), sin ejecutar ningún
  handler al tocarlo.
- **Al activarse (click/tap/Enter con foco), estando habilitado**:
  1. Llama a `copyTextToClipboard(text)` (mismo contrato que 004, sin
     modificarlo).
     - Si resuelve `true`: estado `success` — el botón muestra un
       ícono `Check` + label de confirmación (ej. "¡Copiado!") por un
       breve período, luego vuelve a `idle` (mismo patrón temporal que
       `ShareHaremButton`, sin `Toast` aparte).
     - Si resuelve `false`: abre `<ManualCopyDialog text={text}
       onConfirm={...} onClose={...} />` (fallback de selección
       manual, Principio VI) — no se muestra error de entrada, el
       usuario todavía puede completar la copia a mano.
       - Confirmar dentro del diálogo ("Listo, ya lo copié"): estado
         `success` (mismo feedback que el camino programático).
       - Cerrar el diálogo sin confirmar (Escape, click afuera, "X"):
         vuelve a `idle` sin mostrar éxito ni error.
  2. Clicks repetidos mientras ya hay feedback visible o el diálogo
     abierto: reinician el flujo desde el paso 1 con el `text` vigente
     en ese momento (que ya refleja cualquier reordenamiento reciente,
     Principio II) — no se apilan diálogos ni feedbacks superpuestos.
- **Icono/label**: `Copy` de `lucide-react` + texto "Copiar Comando" en
  estado `idle`; `Check` + "¡Copiado!" en `success`; `X` + un mensaje de
  error breve y distinguible (ej. "No se pudo copiar") en `error` — este
  último solo puede ocurrir si `copyTextToClipboard` lanzara de forma
  inesperada (no debería, ver su contrato: nunca lanza), por lo que en
  la práctica el camino de fallo programático siempre pasa por
  `ManualCopyDialog`, no por un estado `error` visible en el botón.
- **Accesibilidad**: `aria-label` coherente con el label visible en cada
  estado, foco visible con teclado, activable con `Enter`/`Space` como
  cualquier `<button>` nativo; `disabled` real (no solo visual) cuando
  `text === null`.

## Casos borde cubiertos por el contrato

- `text === null` desde el primer render (sin perfil activo o harem
  vacío) → nace deshabilitado, sin necesidad de que el usuario lo toque
  primero para enterarse (FR-008).
- `text` cambia de `null` a un valor válido mientras el botón está
  montado (el usuario carga un harem con la barra ya abierta) → el
  botón pasa a habilitado automáticamente, sin remontarse.
- Copiar, luego reordenar el harem (texto cambia), luego copiar de
  nuevo sin cerrar la barra → la segunda copia usa el `text` actualizado
  recibido por prop, nunca el de la primera copia (Principio II).
- Falla de `copyTextToClipboard` → `ManualCopyDialog` se abre con
  exactamente el mismo `text` que se intentó copiar (no un
  recálculo aparte que pudiera desincronizarse).

## Testing de este contrato

- `text={null}` → botón deshabilitado, sin handler ejecutable.
- `text` válido + `copyTextToClipboard` mockeado a `true` → aparece el
  feedback `success` en el botón, y desaparece solo tras el timeout
  (fake timers).
- `text` válido + `copyTextToClipboard` mockeado a `false` → aparece
  `ManualCopyDialog` (no un estado `error` de entrada); confirmar dentro
  del diálogo → pasa a `success`; cerrar sin confirmar → vuelve a
  `idle` sin mostrar ni éxito ni error.
- Cambiar la prop `text` entre dos clicks (simulando un reordenamiento
  entre medio) → el segundo click copia el `text` nuevo, verificado por
  el argumento exacto pasado a `copyTextToClipboard`.
- Accesibilidad básica: `aria-disabled`/`disabled` cuando `text === null`,
  alcanzable/activable por teclado cuando está habilitado.
