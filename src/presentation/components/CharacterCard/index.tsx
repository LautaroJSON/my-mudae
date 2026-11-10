import { memo, type CSSProperties } from "react";
import type { Character } from "../../../domain/harem/Character";
import CopyNameButton from "../CopyNameButton";
import MoveCharacterButton from "../MoveCharacterButton";
import MudaeProfileLink from "../MudaeProfileLink";
import DivorceCharacterButton from "../DivorceCharacterButton";
import CharacterName from "../CharacterName";
import {
  Body,
  Card,
  Image,
  ImageContainer,
  Kakera,
  RankBadge,
} from "./styles";
import { GemIcon } from "lucide-react";

interface ICharacterCard {
  character: Character;
  /** Posición dentro de la serie, usada solo para escalonar la animación de entrada. */
  staggerIndex?: number;
  /**
   * Abre "Mover a…" para este personaje (012). Sin esta prop no se muestra
   * el botón (ej. una serie de un solo personaje, que no tiene adónde
   * moverse). Debe ser una referencia estable para no romper el `memo`.
   */
  onRequestMove?: (characterId: string) => void;
  /** Marcado para divorciar (014). */
  isMarked?: boolean;
  /**
   * Marca/desmarca para divorciar (014). Sin esta prop no se muestra el
   * tacho. Debe ser una referencia estable para no romper el `memo`.
   */
  onToggleDivorce?: (characterId: string) => void;
}

// Memoizado por props: con harems de 200+ personajes, mover/actualizar un
// personaje no debe re-renderizar el resto de la lista (Principio III).
const CharacterCard = ({
  character,
  staggerIndex = 0,
  onRequestMove,
  isMarked = false,
  onToggleDivorce,
}: ICharacterCard) => {
  const profileSlot = onRequestMove ? 2 : 1;
  // Marcada, toda la tarjeta desmarca al tocarla (CharacterListItem le
  // apaga el arrastre mientras tanto, así el click llega).
  const handleCardClick =
    isMarked && onToggleDivorce ? () => onToggleDivorce(character.id) : undefined;

  return (
    <Card
      style={{ "--mm-stagger-index": staggerIndex } as CSSProperties}
      $isMarked={isMarked}
      onClick={handleCardClick}
      title={isMarked ? "Tocá para no divorciar" : undefined}
    >
      {character.claimRank && (
        <RankBadge data-rank-badge>{character.claimRank}</RankBadge>
      )}
      <CopyNameButton characterName={character.name} />
      {onRequestMove && (
        <MoveCharacterButton
          characterName={character.name}
          onClick={() => onRequestMove(character.id)}
        />
      )}
      <MudaeProfileLink characterName={character.name} slot={profileSlot} />
      {onToggleDivorce && (
        <DivorceCharacterButton
          characterName={character.name}
          isMarked={isMarked}
          slot={profileSlot + 1}
          onClick={() => onToggleDivorce(character.id)}
        />
      )}
      <ImageContainer>
        <Image
          src={character.imageUrl}
          alt={character.name}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </ImageContainer>
      <Body>
        <CharacterName name={character.name} />
        {character.kakera !== undefined && (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <GemIcon
              size={12}
              color={"var(--mm-color-accent)"}
              fill={"var(--mm-color-accent-hover)"}
            />
            <Kakera>{character.kakera}</Kakera>
          </div>
        )}
      </Body>
    </Card>
  );
};

export default memo(CharacterCard);
