import { memo, type CSSProperties } from "react";
import type { Character } from "../../../domain/harem/Character";
import CopyNameButton from "../CopyNameButton";
import {
  Body,
  Card,
  Image,
  ImageContainer,
  Kakera,
  Meta,
  Name,
} from "./styles";
import { GemIcon } from "lucide-react";

interface ICharacterCard {
  character: Character;
  /** Posición dentro de la serie, usada solo para escalonar la animación de entrada. */
  staggerIndex?: number;
}

// Memoizado por props: con harems de 200+ personajes, mover/actualizar un
// personaje no debe re-renderizar el resto de la lista (Principio III).
const CharacterCard = ({ character, staggerIndex = 0 }: ICharacterCard) => {
  return (
    <Card style={{ "--mm-stagger-index": staggerIndex } as CSSProperties}>
      <CopyNameButton characterName={character.name} />
      <ImageContainer>
        <Image
          src={character.imageUrl}
          alt={character.name}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </ImageContainer>
      <Body>
        <Name>{character.name}</Name>
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
        {character.claimRank && <Meta>{character.claimRank}</Meta>}
      </Body>
    </Card>
  );
};

export default memo(CharacterCard);
