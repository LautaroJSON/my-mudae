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

export const CharacterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  /* Crítico: sin esto, CharacterList hereda el align-items: stretch por
     defecto de Section (flex-direction: column) y se estira para
     igualar el ancho YA resuelto de Section -- que, mientras el
     encabezado todavía no está acotado, puede ser más ancho que las
     tarjetas (por el nombre de la serie). Eso hace que la medición por
     ResizeObserver en index.tsx termine devolviendo ese ancho inflado
     en vez del ancho real de las tarjetas, dejando el "cap" del
     encabezado sin efecto. flex-start hace que CharacterList siempre
     reporte su propio ancho de contenido, sin importar qué tan ancho
     esté Section en ese momento. */
  align-self: flex-start;
`;
