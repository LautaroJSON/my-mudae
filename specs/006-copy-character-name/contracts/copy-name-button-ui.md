# Contrato: UI de "Copiar nombre de personaje" (`CopyNameButton` / `CharacterCard`)

**Tipo de contrato**: contrato de UI de componentes de `presentation/`
(app client-only, sin API HTTP) — describe el comportamiento observable
de la interacción, no implementación interna.

## `CopyNameButton`

- **Responsabilidad única**: el botón redondo de copiar el nombre de un
  personaje (FR-001/FR-002), incluyendo su revelado por hover/foco, y su
  feedback de éxito/fallback manual.
- **Props**: `characterName: string` (ver `data-model.md`).
- **Marcador para el CSS de revelado**: el elemento raíz del botón lleva
  el atributo `data-copy-name-button` (o equivalente), que
  `CharacterCard/styles.tsx`'s `Card` referencia por selector para
  mostrarlo en `:hover`/`:focus-within` (ver `research.md`).
- **Visibilidad**:
  - En dispositivos con hover real (`@media (hover: hover) and
    (pointer: fine)`): oculto por defecto (`opacity: 0`,
    `pointer-events: none`), visible (`opacity: 1`, `pointer-events:
    auto`) mientras el mouse está sobre la tarjeta contenedora o el
    propio botón tiene foco de teclado.
  - Fuera de esa media query (dispositivos táctiles): visible siempre,
    sin depender de ningún gesto de hover (FR-001, Assumption de
    `spec.md`).
- **Al activarse (click/tap/Enter con foco)**:
  1. Detiene la propagación del `pointerdown` que lo originó (ver
     `research.md`) — este paso ocurre siempre, haya o no arrastre en
     curso, para que un click sobre el botón nunca sea interpretado como
     el inicio de un arrastre de la tarjeta (FR-006).
  2. Llama a `copyTextToClipboard(characterName)`.
     - Si resuelve `true`: muestra `<Toast variant="success">`
       confirmando que el nombre fue copiado (FR-003). Se autodescarta
       solo (mismo componente `Toast` de `004`).
     - Si resuelve `false`: abre `<ManualCopyDialog text={characterName} />`
       (fallback de selección manual, Principio VI, mismo patrón que
       `ShareHaremButton`).
       - Si el usuario confirma el copiado manual: se muestra el mismo
         `Toast` de éxito que en el camino automático.
       - Si el usuario cierra el diálogo sin confirmar: no se muestra
         ningún feedback (ni éxito ni error) — vuelve a su estado
         inicial.
  3. Clicks repetidos: cada uno reinicia el flujo desde el paso 1 con el
     `characterName` vigente en ese momento; no se apilan múltiples
     `Toast`s/diálogos a la vez para la misma tarjeta.
- **Icono**: `Copy` de `lucide-react` (mismo icono que `ShareHaremButton`
  de `004`), en un botón redondo más pequeño que los del header (pensado
  para superponerse a una tarjeta de personaje de 144px de ancho).
- **Accesibilidad**: `aria-label` descriptivo que incluya el nombre del
  personaje (p. ej. `"Copiar nombre de {characterName}"`), foco visible
  con teclado (`:focus-visible`, que también revela el botón aunque el
  mouse no esté encima), activable con `Enter`/`Space`.

## `CharacterCard`

- **Cambio de responsabilidad**: sigue siendo presentacional (imagen,
  nombre, kakera, claim rank), pero ahora también monta
  `<CopyNameButton characterName={character.name} />` como hijo
  adicional. No absorbe ninguna lógica de copiado/feedback — eso vive
  enteramente en `CopyNameButton`.
- **No cambia**: su memoización (`memo(CharacterCard)`), su firma de
  props (`ICharacterCard`), ni el resto de su contenido visual.

## Interacción con el arrastre existente (`003`)

- Arrastrar la tarjeta desde cualquier punto que **no** sea
  `CopyNameButton` sigue disparando el reordenamiento existente sin
  ningún cambio de comportamiento (Acceptance Scenario 5, SC-003).
- Presionar y arrastrar comenzando **sobre** `CopyNameButton` nunca
  inicia un reordenamiento: el `pointerdown` nunca llega al listener de
  arrastre de `CharacterListItem` (Acceptance Scenario 6, FR-006).
- No se modifica `SeriesGroup`, `CharacterListItem` ni la configuración
  de sensores de `@dnd-kit` para lograr esto (ver `research.md`).

## Casos borde cubiertos por el contrato

- Pasar el mouse por varias tarjetas seguidas: el botón revelado
  corresponde siempre a la tarjeta bajo el mouse en cada momento (CSS
  `:hover` por tarjeta, sin estado global compartido entre tarjetas).
- Nombre de personaje con caracteres especiales/muy largo: se copia tal
  cual (`characterName` sin transformar), igual que el resto de la app
  no trunca ni escapa nombres al mostrarlos.
- Copiado al portapapeles no disponible/denegado: cubierto por el mismo
  fallback de `ManualCopyDialog` que ya usa `ShareHaremButton`.

## Testing de este contrato

- El botón está oculto por defecto y se revela con `:hover`/
  `:focus-within` de la tarjeta (verificable por estilos computados o
  por la presencia del atributo/clase de revelado).
- Click en el botón con `copyTextToClipboard` mockeado a `true` →
  aparece `Toast` de éxito con el nombre correcto pasado a
  `copyTextToClipboard`.
- Click en el botón con `copyTextToClipboard` mockeado a `false` →
  aparece `ManualCopyDialog` con `characterName` como texto; confirmar →
  `Toast` de éxito; cerrar sin confirmar → sin `Toast`.
- Simular un `pointerdown` + movimiento (arrastre) que comienza sobre el
  botón → no se invoca `reorderCharactersInSeries` (o el equivalente
  callback de arrastre observable en el test).
- Simular un arrastre que comienza en cualquier otro punto de la
  tarjeta (fuera del botón) → el reordenamiento existente sigue
  funcionando exactamente igual que antes de esta feature.
