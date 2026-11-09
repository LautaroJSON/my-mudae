import styled from "styled-components";
import { CARD_WIDTH, CARD_WIDTH_MOBILE } from "../CharacterCard/styles";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  /* surfaceMuted (no surface, que ya usa CharacterCard): separa
     visualmente el panel de la serie de las tarjetas de personaje que
     contiene, en vez de que ambos compitan por el mismo tono. */
  background: ${(props) => props.theme.colors.surfaceMuted};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  padding: ${(props) => props.theme.spacing.md};
  box-sizing: border-box;
  /* Ancho de contenido explícito (no un width implícito de ítem flex):
     junto con contain: inline-size en Header (ver abajo), el panel
     toma el ancho de sus tarjetas, sin que el encabezado (más largo) lo
     infle. max-width: 100% evita que desborde horizontalmente en mobile
     (Principio V) cuando ni siquiera las tarjetas entran en una fila. */
  width: fit-content;
  max-width: 100%;
  /* Referencia de posición de SeriesWidthHandle (013). */
  position: relative;

  /* "bloque N" y "Unir" de un bloque separado (012): se revelan con
     hover/foco del bloque, mismo criterio que los botones de
     CharacterCard — solo con puntero fino; en táctil quedan siempre
     visibles. */
  @media (hover: hover) and (pointer: fine) {
    &:hover [data-block-reveal],
    &:focus-within [data-block-reveal] {
      opacity: 1;
    }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  /* El ancho de la serie lo definen sus personajes, nunca el nombre:
     contain: inline-size hace que el encabezado no aporte nada al
     ancho intrínseco de Section (width: fit-content), así que un
     nombre más largo que las tarjetas no ensancha el panel; el
     encabezado se estira al ancho que dejan las tarjetas y SeriesName
     se trunca con "…". Antes esto se hacía midiendo CharacterList con
     JS y aplicando un max-width inline, que fallaba si la medición daba
     0 (el título volvía a ensanchar la serie) y con 2+ personajes
     (CharacterList al 100% medía el ancho ya inflado por el título). */
  contain: inline-size;
  min-width: 0;
  overflow: hidden;
`;

export const SeriesName = styled.h2`
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.md};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

// "bloque N" de un bloque separado (012): no se trunca (flex-shrink 0),
// el que cede espacio es SeriesName.
// Ocupan su lugar aunque estén ocultos (opacity, no display): así
// revelarlos no cambia el ancho disponible para SeriesName.
const revealOnHover = `
  @media (hover: hover) and (pointer: fine) {
    opacity: 0;
  }
`;

export const BlockTag = styled.span`
  ${revealOnHover}
  transition: opacity ${(props) => props.theme.motion.duration.base}
    ${(props) => props.theme.motion.easing};
  flex-shrink: 0;
  white-space: nowrap;
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const MergeButton = styled.button`
  ${revealOnHover}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: auto;
  background: none;
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xxs};
  transition: background-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    opacity ${(props) => props.theme.motion.duration.base}
      ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.accent};
  }
`;

// Mismo patrón que ProfileCard/styles.tsx: `touch-action: none` evita
// que el navegador interprete el arrastre como scroll táctil (Principio
// V: el drag-and-drop debe funcionar con touch, no competir con el
// gesto de scroll de la página).
export const DragHandle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: grab;
  padding: ${(props) => props.theme.spacing.xxs};
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

// Ancho de `n` tarjetas más los `n - 1` gaps entre ellas.
const widthFor = (count: number, cardWidth: string, gap: string) =>
  `calc(${count} * ${cardWidth} + ${count - 1} * ${gap})`;

/*
 * `$visibleCount` = personajes que se ven a lo ancho (013). Si es menor
 * que la cantidad de tarjetas, el resto queda detrás del scroll
 * horizontal. Se calcula en CSS (no midiendo con JS) para que el mismo
 * número valga con la tarjeta de escritorio y la de mobile. Con un solo
 * personaje, `$visibleCount` es 1 y el bloque mide una tarjeta, como
 * antes.
 */
export const CharacterList = styled.div<{ $visibleCount: number }>`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  width: ${(props) =>
    widthFor(props.$visibleCount, CARD_WIDTH, props.theme.spacing.md)};
  max-width: 100%;
  gap: ${(props) => props.theme.spacing.md};

  // Mobile: las CharacterCard pasan a ~72px de ancho y alto intrínseco
  // (ver CharacterCard/styles.tsx). El alto pasa a auto: es seguro en
  // mobile porque los navegadores táctiles usan scrollbars superpuestas
  // que no reservan alto de layout. El gap también baja, proporcional al
  // ancho de card reducido.
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    height: auto;
    gap: ${(props) => props.theme.spacing.sm};
    width: ${(props) =>
      widthFor(props.$visibleCount, CARD_WIDTH_MOBILE, props.theme.spacing.sm)};
  }
`;
