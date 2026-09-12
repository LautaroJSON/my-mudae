import styled, { keyframes } from "styled-components";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Card = styled.article`
  position: relative;
  display: grid;
  grid-template-rows: 224px auto;

  height: 300px;
  width: 144px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  overflow: hidden;
  background: ${(props) => props.theme.colors.surface};
  animation: ${fadeInUp} ${(props) => props.theme.motion.duration.slow}
    ${(props) => props.theme.motion.easing} both;
  animation-delay: calc(
    var(--mm-stagger-index, 0) *
      ${(props) => props.theme.motion.staggerStepMs}ms
  );
  transition:
    border-color ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing},
    box-shadow ${(props) => props.theme.motion.duration.fast}
      ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: ${(props) => props.theme.colors.shadowSm};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover [data-copy-name-button],
    &:focus-within [data-copy-name-button] {
      opacity: 1;
      pointer-events: auto;
    }
  }

  // Mobile: card a la mitad de ancho/alto de imagen (72px/112px, la
  // mitad exacta de 144px/224px) — preserva el ratio 9:14 por
  // construcción, ya que escala ambas dimensiones por igual. La altura
  // pasa a auto (no un segundo número fijo) para que el alto total lo
  // defina el contenido intrínseco de Body, que también pasa a auto
  // acá abajo.
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-rows: 112px auto;
    width: 72px;
    height: auto;
  }
`;

export const Image = styled.img`
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  object-fit: cover;
  background: ${(props) => props.theme.colors.surfaceMuted};
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 76px;
  padding: ${(props) => props.theme.spacing.sm};
  gap: ${(props) => props.theme.spacing.xxs};

  // Mobile: alto intrínseco (no 76px fijo) con padding más ajustado —
  // el texto no se achica más (Name/Meta ya están en el piso de la
  // escala tipográfica), pero el contenedor deja de reservar espacio
  // fijo que ya no hace falta con la card compacta.
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    height: auto;
    padding: ${(props) => props.theme.spacing.xs};
  }
`;

export const Name = styled.span`
  font-size: ${(props) => props.theme.typography.size.sm};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  line-height: ${(props) => props.theme.typography.lineHeight.tight};
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const Meta = styled.span`
  font-size: ${(props) => props.theme.typography.size.xs};
  font-family: ${(props) => props.theme.typography.fontMono};
  color: ${(props) => props.theme.colors.textSecondary};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    line-height: ${(props) => props.theme.typography.lineHeight.tight};
  }
`;

export const Kakera = styled.span`
  font-size: ${(props) => props.theme.typography.size.xs};
  font-family: ${(props) => props.theme.typography.fontMono};
  color: ${(props) => props.theme.colors.accent};
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 224px;
  width: 144px;
  overflow: hidden;

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    width: 72px;
    height: 112px;
  }
`;
