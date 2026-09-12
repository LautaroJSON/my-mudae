import styled from 'styled-components'

// A diferencia de SettingsFab.Wrapper (position: relative a propósito),
// este Wrapper se deja en position: static (el default de un `div`,
// declarado igual de forma explícita para que quede claro que es
// intencional): así HaremSortPanel, con `position: absolute; top: 100%`,
// ancla contra `Bar` (el header sticky) en vez de contra este botón —
// ver research.md §3 de 010.
export const Wrapper = styled.div`
  position: static;
`

export const IconButton = styled.button<{ $isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: ${(props) => props.theme.radii.pill};
  border: 1px solid ${(props) => (props.$isOpen ? 'transparent' : props.theme.colors.border)};
  background: ${(props) => (props.$isOpen ? props.theme.colors.accent : 'transparent')};
  color: ${(props) => (props.$isOpen ? props.theme.colors.onAccent : props.theme.colors.textPrimary)};
  cursor: pointer;
  transition:
    background-color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing},
    color ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing};

  &:hover {
    background: ${(props) => (props.$isOpen ? props.theme.colors.accentHover : props.theme.colors.border)};
  }
`
