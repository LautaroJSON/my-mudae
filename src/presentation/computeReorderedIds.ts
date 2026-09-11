import { arrayMove } from '@dnd-kit/sortable'

/**
 * Traduce un `active`/`over` de `@dnd-kit` (un ítem soltado sobre otro)
 * a la nueva secuencia completa de ids, usando `arrayMove` de
 * `@dnd-kit/sortable`. Función pura, separada de `ProfileList` para
 * poder testearla sin simular un gesto de arrastre real (que `jsdom` no
 * puede medir con layout real) — ver tests/unit/presentation/computeReorderedIds.test.ts.
 */
export function computeReorderedIds(ids: string[], activeId: string, overId: string): string[] {
  const oldIndex = ids.indexOf(activeId)
  const newIndex = ids.indexOf(overId)

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return ids
  }

  return arrayMove(ids, oldIndex, newIndex)
}
