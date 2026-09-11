import { describe, expect, it } from 'vitest'
import { computeReorderedIds } from '../../../src/presentation/computeReorderedIds'

describe('computeReorderedIds', () => {
  it('mueve el id activo a la posición del id sobre el que se soltó', () => {
    expect(computeReorderedIds(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a'])
    expect(computeReorderedIds(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('no cambia nada si se suelta sobre el mismo ítem', () => {
    expect(computeReorderedIds(['a', 'b', 'c'], 'b', 'b')).toEqual(['a', 'b', 'c'])
  })

  it('no cambia nada si el id activo o el de destino no existen en la lista', () => {
    expect(computeReorderedIds(['a', 'b', 'c'], 'fantasma', 'b')).toEqual(['a', 'b', 'c'])
    expect(computeReorderedIds(['a', 'b', 'c'], 'a', 'fantasma')).toEqual(['a', 'b', 'c'])
  })
})
