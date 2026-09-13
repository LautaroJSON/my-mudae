import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { BackToTopFab, Wrapper } from "./styles";

const SCROLL_THRESHOLD = 300;

/**
 * Botón flotante "volver arriba": apilado sobre SettingsFab, solo
 * visible una vez que el usuario scrolleó hacia abajo lo suficiente.
 */
const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // `html, body { overflow-x: hidden }` (index.css) fuerza `overflow-y:
    // auto` en `body` (regla del spec de CSS), así que en esta app es
    // `body` el que scrollea, no `window` -- su evento `scroll` no
    // burbujea hasta `window`, por eso escuchamos en fase de captura.
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      setVisible(scrollTop > SCROLL_THRESHOLD);
    };

    handleScroll();
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, []);

  if (!visible) {
    return null;
  }

  const scrollToTop = () => {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Wrapper>
      <BackToTopFab type="button" aria-label="Volver arriba" onClick={scrollToTop}>
        <ArrowUp size={20} aria-hidden="true" />
      </BackToTopFab>
    </Wrapper>
  );
};

export default BackToTopButton;
