import styled, { keyframes } from "styled-components";

// Ancho de la tarjeta: lo usa también SeriesGroup para calcular el largo
// de un bloque achicado (013), así que vive en un solo lugar.
export const CARD_WIDTH = "144px";
export const CARD_WIDTH_MOBILE = "72px";

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

  /* height: 300px; */
  width: ${CARD_WIDTH};
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
  transition: all 0.8s ${(props) => props.theme.motion.easing};

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: ${(props) => props.theme.colors.shadowLg};
    transform: translateY(1px) scale(1.1em);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover [data-copy-name-button],
    &:focus-within [data-copy-name-button],
    &:hover [data-move-character-button],
    &:focus-within [data-move-character-button],
    &:hover [data-mudae-profile-link],
    &:focus-within [data-mudae-profile-link] {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    &:hover [data-rank-badge],
    &:focus-within [data-rank-badge] {
      opacity: 1;
      transform: scale(1);
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
    width: ${CARD_WIDTH_MOBILE};
    height: auto;
  }
`;

export const Image = styled.img`
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  object-fit: cover;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: fit-content;
  padding: ${(props) => props.theme.spacing.md};
  gap: ${(props) => props.theme.spacing.xxs};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    height: auto;
    padding: ${(props) => props.theme.spacing.xs};
  }
`;

export const RankBadge = styled.span`
  position: absolute;
  top: ${(props) => props.theme.spacing.xs};
  left: ${(props) => props.theme.spacing.xs};
  z-index: 1;
  display: inline-flex;
  align-items: center;
  padding: 0.125rem ${(props) => props.theme.spacing.xs};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.overlay};
  box-shadow: ${(props) => props.theme.colors.shadowSm};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: ${(props) => props.theme.typography.size.xs};
  font-family: ${(props) => props.theme.typography.fontMono};
  pointer-events: none;

  @media (hover: hover) and (pointer: fine) {
    opacity: 0;
    transform: scale(0.85);
    transition: opacity ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing},
      transform ${(props) => props.theme.motion.duration.base}
        ${(props) => props.theme.motion.easing};
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
