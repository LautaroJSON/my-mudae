import styled from 'styled-components'

// Toda la tarjeta es la superficie de arrastre (sin manija dedicada,
// ver index.tsx); `touch-action: none` evita que el navegador interprete
// el arrastre como scroll táctil (Principio V), igual que la manija de
// ProfileCard.
export const Item = styled.div`
  touch-action: none;
`
