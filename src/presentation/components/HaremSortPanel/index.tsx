import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import KakeraSortOption from '../KakeraSortOption'
import RankSortOption from '../RankSortOption'
import { OptionsList, Panel, SectionRow } from './styles'

/**
 * Panel de opciones de ordenamiento (FR-003/FR-004 de 010): fondo de
 * acento, anclado justo debajo del header completo (`position: absolute;
 * top: 100%`, relativo al `Bar` sticky del header — ver `research.md`
 * §3 de 010, y que el wrapper de `HaremSortButton` se deje en
 * `position: static` a propósito). Contiene el acordeón "Ordenamiento",
 * que despliega `KakeraSortOption` (y `RankSortOption` en User Story 3).
 * No decide cuándo está montada (lo controla `HaremSortButton`).
 */
const HaremSortPanel = () => {
  const [isSortSectionOpen, setIsSortSectionOpen] = useState(false)

  return (
    <Panel role="menu">
      <SectionRow type="button" aria-expanded={isSortSectionOpen} onClick={() => setIsSortSectionOpen((previous) => !previous)}>
        Ordenamiento
        {isSortSectionOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </SectionRow>
      {isSortSectionOpen && (
        <OptionsList>
          <KakeraSortOption />
          <RankSortOption />
        </OptionsList>
      )}
    </Panel>
  )
}

export default HaremSortPanel
