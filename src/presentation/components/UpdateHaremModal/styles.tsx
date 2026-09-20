import styled from 'styled-components'

// Mismo patrón que ProfilesModal/styles.tsx: Modal solo usa `ariaLabel`
// para accesibilidad (atributo `aria-label`, sin renderizar nada visible)
// -- el título visible lo aporta cada modal en su propio contenido.
export const Title = styled.h2`
  margin: 0;
  font-family: ${(props) => props.theme.typography.fontDisplay};
  font-size: ${(props) => props.theme.typography.size.lg};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  color: ${(props) => props.theme.colors.textPrimary};
`

export const Message = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.base};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  color: ${(props) => props.theme.colors.textSecondary};

  // Mismo tratamiento que AdviceItem en PasteHaremScreen/styles.tsx para
  // referencias a comandos de Discord (ej. $mmaikrs).
  code {
    font-family: ${(props) => props.theme.typography.fontMono};
    font-size: ${(props) => props.theme.typography.size.sm};
    color: ${(props) => props.theme.colors.textPrimary};
    background: ${(props) => props.theme.colors.surface};
    padding: 0 0.25em;
    border-radius: ${(props) => props.theme.radii.sm};
  }
`

// Mismo mecanismo visual/UX que PasteZone de PasteHaremScreen (001):
// contentEditable en vez de textarea/input para que el menú nativo
// "Pegar" también aparezca en mobile, con placeholder resuelto vía
// `:empty::before`. Duplicado a propósito en este styles.tsx en vez de
// compartir el styled-component entre carpetas de componente (ver
// research.md de 005).
export const PasteZone = styled.div`
  min-height: 8rem;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 3px dashed ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.fontMono};
  font-size: ${(props) => props.theme.typography.size.sm};
  line-height: ${(props) => props.theme.typography.lineHeight.base};
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  outline: none;
  cursor: text;
  caret-color: transparent;
  box-shadow: 0 0 0 0 transparent;
  transition:
    border-color ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    box-shadow ${(props) => props.theme.motion.duration.base} ${(props) => props.theme.motion.easing},
    caret-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:empty::before {
    content: attr(data-placeholder);
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.typography.fontBody};
    font-size: ${(props) => props.theme.typography.size.base};
  }

  &:focus-visible {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 0 1.5px ${(props) => props.theme.colors.accent};
    caret-color: ${(props) => props.theme.colors.accent};
  }
`

// Alternativa a pegar: carga un .txt con el mismo formato del mensaje de
// Mudae. Centrado y con estilo de acción secundaria, ya que pegar sigue
// siendo el flujo principal.
export const LoadFileButton = styled.button`
  align-self: center;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.textPrimary};
  }
`

export const FileInput = styled.input`
  display: none;
`

export const ErrorMessage = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.typography.size.sm};
  color: ${(props) => props.theme.colors.danger};
`

export const MismatchName = styled.strong`
  color: ${(props) => props.theme.colors.danger};
`

// Fila de acciones de la vista de discordancia: "Actualizar de todas
// formas" (secundaria, destructiva) + "Reintentar" (primaria).
export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.sm};
  align-self: flex-end;
`

export const RetryButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  border: none;
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
  }
`

// Misma métrica que RetryButton pero en variante contorno: es la acción
// menos habitual (y la única que renombra el perfil), así que no compite
// visualmente con "Reintentar".
export const ForceButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.size.base};
  font-weight: ${(props) => props.theme.typography.weight.semibold};
  cursor: pointer;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.textPrimary};
  }
`
