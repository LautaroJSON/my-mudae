import styled from 'styled-components'

// Sin ancho propio a propósito: el ancho de cada serie lo define su
// propio contenido en `Section` de SeriesGroup (sin columna fija) — este
// envoltorio solo aporta el ref/transform del arrastre, no debe competir
// con ese ancho.
//
// min-width: 0 -- este `Item` es el flex item real de `Container` (en
// HaremView/styles.tsx). Por default, un flex item con overflow visible
// calcula su mínimo automático a partir del contenido; como
// `CharacterList` ahora es `nowrap` con tarjetas no encogibles
// (flex-shrink: 0), ese mínimo de contenido puede ser enorme y gana por
// sobre `max-width: 100%` de `Section` (min siempre gana sobre max),
// forzando a toda la serie a desbordar la página en vez de encogerse al
// ancho disponible y disparar el scroll horizontal de `CharacterList`.
export const Item = styled.div`
  min-width: 0;
`
