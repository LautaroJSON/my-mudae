import styled from "styled-components";

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
     junto con align-self: flex-start en CharacterList (ver abajo), es
     lo que le permite al panel medir su ancho real contra el ancho de
     las tarjetas, sin que el encabezado (más largo) lo infle. max-width:
     100% evita que desborde horizontalmente en mobile (Principio V)
     cuando ni siquiera las tarjetas entran en una fila. */
  width: fit-content;
  max-width: 100%;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xxs};
  /* min-width:0 + overflow:hidden: sin esto, un flex item no se achica
     por debajo del ancho de su contenido aunque tenga max-width (inline,
     ver index.tsx) -- necesario para que SeriesName pueda truncarse en
     vez de desbordar el encabezado. */
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

export const CharacterList = styled.div<{ $widthCant?: number }>`
  display: flex;
  flex-wrap: nowrap;
  /* justify-content: center; */
  /* align-self: flex-start; */
  /* align-items: flex-start; */

  overflow-x: auto;
  overflow-y: hidden;

  /* height: 310px; */

  width: ${(props) =>
    props.$widthCant ? (props.$widthCant === 1 ? "144px" : "100%") : "100%"};
  /* max-width: 925px; */

  gap: ${(props) => props.theme.spacing.md};

  // Mobile: las CharacterCard pasan a ~72px de ancho y alto intrínseco
  // (ver CharacterCard/styles.tsx) — sin este ajuste, el alto fijo de
  // 325px (pensado para la card de 300px de desktop + margen de
  // scrollbar) dejaría un espacio vacío grande debajo de las tarjetas
  // achicadas. El alto pasa a auto: es seguro en mobile porque los
  // navegadores táctiles usan scrollbars superpuestas que no reservan
  // alto de layout. El gap también baja, proporcional al ancho de card
  // reducido.
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    height: auto;
    gap: ${(props) => props.theme.spacing.sm};
    width: ${(props) =>
      props.$widthCant ? (props.$widthCant === 1 ? "72px" : "100%") : "100%"};
  }
`;
