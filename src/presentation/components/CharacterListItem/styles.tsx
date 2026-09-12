import styled from "styled-components";

// Toda la tarjeta es la superficie de arrastre (sin manija dedicada,
// ver index.tsx). El reordenamiento dentro de una serie es siempre
// horizontal (CharacterList es `nowrap`, ver SeriesGroup/styles.tsx);
// el scroll problemático de la página es siempre vertical (las series
// se apilan en HaremView). `touch-action: pan-y` le deja al navegador
// el paneo vertical nativo (así apoyar el dedo sobre una tarjeta para
// scrollear la página ya no se interpreta como arrastre), dejando el
// movimiento horizontal disponible para que @dnd-kit lo tome como
// inicio de un arrastre — sin agregar ningún activationConstraint al
// PointerSensor compartido (que cambiaría el arrastre para todos los
// inputs, ver research.md de 006) ni afectar el arrastre por mouse en
// desktop (`touch-action` no tiene efecto sobre mouse).
//
// flex-shrink: 0 -- CharacterList ahora es `flex-wrap: nowrap` con
// `overflow-x: auto` (ver SeriesGroup/styles.tsx); sin esto, el
// encogimiento por defecto de los flex items comprimiría las tarjetas
// para que "entren" todas en el ancho disponible en vez de desbordar y
// activar el scroll horizontal.
export const Item = styled.div`
  touch-action: pan-y;
  flex-shrink: 0;
`;
