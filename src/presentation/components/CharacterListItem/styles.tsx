import styled from 'styled-components'

// Toda la tarjeta es la superficie de arrastre (sin manija dedicada,
// ver index.tsx); `touch-action: none` evita que el navegador interprete
// el arrastre como scroll táctil (Principio V), igual que la manija de
// ProfileCard.
//
// flex-shrink: 0 -- CharacterList ahora es `flex-wrap: nowrap` con
// `overflow-x: auto` (ver SeriesGroup/styles.tsx); sin esto, el
// encogimiento por defecto de los flex items comprimiría las tarjetas
// para que "entren" todas en el ancho disponible en vez de desbordar y
// activar el scroll horizontal.
export const Item = styled.div`
  touch-action: none;
  flex-shrink: 0;
`
