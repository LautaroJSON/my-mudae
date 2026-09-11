import styled from 'styled-components'

// Sin ancho propio a propósito: el ancho de cada serie lo define su
// propio contenido en `Section` de SeriesGroup (sin columna fija) — este
// envoltorio solo aporta el ref/transform del arrastre, no debe competir
// con ese ancho.
export const Item = styled.div``
