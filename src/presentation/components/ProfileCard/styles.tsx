import styled from 'styled-components'

// Antes era un <li> directo; ahora vive dentro del <li> "sortable" que
// arma ProfileList (dnd-kit necesita ese <li> para el ref/transform del
// arrastre), así que Card pasa a ser un <div> anidado.
//
// El perfil activo se distingue con un borde en el color de acento de la
// app (mismo lenguaje visual que el :focus-visible de PasteZone en
// DESIGN.md) en vez de la palabra "activo" al lado.
export const Card = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  border: 1.5px solid ${(props) => (props.$isActive ? props.theme.colors.accent : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surface};
  transition: border-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};
`

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
  /* Evita que el navegador interprete el arrastre como scroll táctil
     (Principio V: el drag-and-drop debe funcionar con touch, no competir
     con el gesto de scroll de la página). */
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`

export const NameColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xxs};
`

export const ActivateButton = styled.button<{ $isActive: boolean }>`
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  font-size: ${(props) => props.theme.typography.size.md};
  color: ${(props) => props.theme.colors.textPrimary};
  font-weight: ${(props) => (props.$isActive ? props.theme.typography.weight.bold : props.theme.typography.weight.regular)};
  cursor: ${(props) => (props.$isActive ? 'default' : 'pointer')};
`

export const Stats = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`

export const NameInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: ${(props) => props.theme.typography.size.md};
  padding: ${(props) => props.theme.spacing.xxs} ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
`

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: ${(props) => props.theme.radii.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xxs};
  transition: background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => props.theme.colors.surfaceMuted};
  }
`
