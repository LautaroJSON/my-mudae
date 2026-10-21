import { memo, useLayoutEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { GripVertical, Merge } from "lucide-react";
import type { Series } from "../../../domain/harem/Series";
import { getSeriesBlocks } from "../../../domain/harem/Harem";
import { useProfiles } from "../../context/ProfilesContext";
import { computeReorderedIds } from "../../computeReorderedIds";
import { getBlockLabel, getBlockNumber } from "../../seriesBlockLabel";
import CharacterListItem from "../CharacterListItem";
import MoveCharacterDialog, { type IMoveTarget } from "../MoveCharacterDialog";
import {
  BlockTag,
  CharacterList,
  DragHandle,
  Header,
  MergeButton,
  SeriesName,
  Section,
} from "./styles";

interface ISeriesGroup {
  series: Series;
  /** Props de `useSortable` de @dnd-kit para la manija de arrastre de nivel serie (User Story 3). */
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
  };
  /** Deshabilita el arrastre de la serie y de sus personajes mientras el ordenamiento temporal por kakera está activo (FR-015 de 010). */
  dragDisabled?: boolean;
}

/**
 * Memoizado por props (Principio III): solo se re-renderiza si cambia la
 * serie que le corresponde, no cuando cambia otra serie del harem. Monta
 * su propio `DndContext`/`SortableContext` para el reordenamiento de SUS
 * personajes (User Story 2 de 003) — independiente del `DndContext` de
 * `HaremView` (nivel serie) y del de cualquier otra `SeriesGroup`: un
 * personaje arrastrado nunca tiene ningún droppable fuera de esta
 * instancia al que soltarse (FR-005, ver research.md).
 *
 * Bloques (012): pasar un personaje a otro bloque de la misma serie es
 * una acción explícita ("Mover a…", con `MoveCharacterDialog`), no un
 * arrastre entre `DndContext`s. Los bloques hermanos se leen del harem
 * REAL del perfil activo (no de `series`, que puede venir filtrada por
 * la búsqueda u ordenada por kakera), así que las opciones y los nombres
 * de bloque no cambian con esas vistas temporales. El bloque separado
 * muestra su número ("bloque 2") y el botón "Unir a la serie".
 */
const SeriesGroup = ({ series, dragHandleProps, dragDisabled }: ISeriesGroup) => {
  const {
    activeProfile,
    reorderCharactersInSeries,
    moveCharacterToBlock,
    mergeSeriesBlock,
  } = useProfiles();
  const [movingCharacterId, setMovingCharacterId] = useState<string | null>(
    null,
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const characterIds = series.characters.map((character) => character.id);

  const siblingBlocks = activeProfile
    ? getSeriesBlocks(activeProfile.harem, series.id)
    : [];
  const blocks = siblingBlocks.length > 0 ? siblingBlocks : [series];
  const realBlock = blocks.find((block) => block.id === series.id) ?? series;
  const blockLabel = getBlockLabel(blocks, realBlock);
  const blockNumber = getBlockNumber(blocks, realBlock);
  const charactersInSeries = blocks.reduce(
    (total, block) => total + block.characters.length,
    0,
  );
  // Con un solo personaje en toda la serie no hay adónde moverlo. El
  // setter de useState es estable: no rompe el memo de CharacterCard.
  const onRequestMove =
    charactersInSeries >= 2 ? setMovingCharacterId : undefined;

  const movingCharacter = realBlock.characters.find(
    (character) => character.id === movingCharacterId,
  );
  const moveTargets: IMoveTarget[] = [
    ...blocks
      .filter((block) => block.id !== realBlock.id)
      .map((block) => ({
        seriesId: block.id,
        label: getBlockLabel(blocks, block),
      })),
    // Un bloque nuevo solo tiene sentido si este bloque queda con algún
    // personaje: si no, sería el mismo bloque con otro id.
    ...(realBlock.characters.length >= 2
      ? [{ seriesId: null, label: "Bloque nuevo" }]
      : []),
  ];

  // El ancho de la serie lo define CharacterList (sus personajes), no el
  // nombre: un `<h2>` normal, sin ninguna restricción propia, ensancha
  // su contenedor con `width: auto/fit-content` hasta el ancho de su
  // texto sin cortar, incluso si es más largo que las tarjetas de
  // personajes. Medir el ancho real de CharacterList y aplicarlo como
  // `max-width` del encabezado hace que el nombre se trunque con "…" en
  // vez de ensanchar la serie — `max-width` sí acota la contribución de
  // un elemento al cálculo de ancho intrínseco de su contenedor (a
  // diferencia de `overflow: hidden` solo, que no lo hace). Requiere
  // `CharacterList` con `align-self: flex-start` (ver styles.tsx): sin
  // eso, `CharacterList` se estira para igualar el ancho ya inflado de
  // `Section` por el título largo, y la medición de acá termina leyendo
  // ese ancho inflado en vez del ancho real de las tarjetas.
  const characterListRef = useRef<HTMLDivElement>(null);
  const [headerMaxWidth, setHeaderMaxWidth] = useState<number>();

  useLayoutEffect(() => {
    const element = characterListRef.current;
    if (!element) {
      return;
    }

    // Medición sincrónica antes del primer paint (useLayoutEffect, no
    // useEffect): evita un flash momentáneo del encabezado sin acotar
    // mientras se espera el primer callback de ResizeObserver.
    const measure = () =>
      setHeaderMaxWidth(element.getBoundingClientRect().width);
    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    reorderCharactersInSeries(
      series.id,
      computeReorderedIds(characterIds, String(active.id), String(over.id)),
    );
  };

  return (
    <Section aria-label={blockLabel}>
      <Header style={headerMaxWidth ? { maxWidth: headerMaxWidth } : undefined}>
        {dragHandleProps && (
          <DragHandle
            type="button"
            aria-label={`Reordenar serie ${blockLabel}`}
            disabled={dragDisabled}
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical size={16} />
          </DragHandle>
        )}
        {/* `title` nativo: nombre completo visible al hacer hover cuando el texto se trunca. */}
        <SeriesName title={series.name}>{series.name}</SeriesName>
        {blockNumber !== null && (
          <>
            <BlockTag data-block-reveal>bloque {blockNumber}</BlockTag>
            <MergeButton
              type="button"
              data-block-reveal
              aria-label={`Unir ${blockLabel} a ${series.name}`}
              title={`Unir a ${series.name}`}
              onClick={() => mergeSeriesBlock(series.id)}
            >
              <Merge size={14} />
            </MergeButton>
          </>
        )}
      </Header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={characterIds} strategy={rectSortingStrategy}>
          <CharacterList
            ref={characterListRef}
            $widthCant={series.characters.length}
          >
            {series.characters.map((character, index) => (
              // Cascada de entrada acotada a 12 pasos (DESIGN.md § Motion): con
              // harems de 200+, un delay sin techo haría que las últimas
              // tarjetas tarden segundos en aparecer.
              <CharacterListItem
                key={character.id}
                character={character}
                staggerIndex={Math.min(index, 12)}
                dragDisabled={dragDisabled}
                onRequestMove={onRequestMove}
              />
            ))}
          </CharacterList>
        </SortableContext>
      </DndContext>
      {movingCharacter && (
        <MoveCharacterDialog
          characterName={movingCharacter.name}
          targets={moveTargets}
          onSelect={(targetSeriesId) => {
            setMovingCharacterId(null);
            moveCharacterToBlock(series.id, movingCharacter.id, targetSeriesId);
          }}
          onClose={() => setMovingCharacterId(null)}
        />
      )}
    </Section>
  );
};

export default memo(SeriesGroup);
