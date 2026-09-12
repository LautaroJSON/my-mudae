import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Text, Viewport } from "./styles";

interface ICharacterName {
  name: string;
}

/**
 * Nombre de personaje de una sola línea: nunca hace salto de línea, se
 * corta con "…" cuando no entra en el ancho de la tarjeta. Al mantener el
 * mouse encima (solo en dispositivos con puntero fino, sin hover táctil)
 * y únicamente si el nombre está efectivamente cortado, hace un loop de
 * ida y vuelta que revela el nombre completo — la distancia del
 * recorrido se mide en runtime (`scrollWidth - clientWidth`) y se pasa a
 * la animación vía una custom property, ya que varía según cada nombre.
 */
const CharacterName = ({ name }: ICharacterName) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const element = textRef.current;
    if (!element) {
      return;
    }
    setOverflowPx(Math.max(0, element.scrollWidth - element.clientWidth));
  }, [name]);

  return (
    <Viewport>
      <Text
        ref={textRef}
        data-overflowing={overflowPx > 0}
        style={{ "--mm-marquee-distance": `${overflowPx}px` } as CSSProperties}
      >
        {name}
      </Text>
    </Viewport>
  );
};

export default CharacterName;
