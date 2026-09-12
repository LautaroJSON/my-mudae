import { useRef, useState, type ClipboardEvent } from "react";
import { Info } from "lucide-react";
import { useProfiles } from "../../context/ProfilesContext";
import { parseHaremMessage } from "../../../domain/parsing/parseHaremMessage";
import type { ParsedSeries } from "../../../domain/parsing/parseHaremMessage";
import type { ServerChoice } from "../../../application/useCases/createProfileWithServer";
import ServerPickerModal from "../ServerPickerModal";
import {
  AdviceBox,
  AdviceItem,
  AdviceList,
  AdviceTitle,
  Container,
  ErrorMessage,
  PasteZone,
} from "./styles";

interface IPasteHaremScreen {
  /** Se llama tras crear el perfil con éxito (p. ej. para cerrar el modo "nuevo perfil"). */
  onCreated?: () => void;
}

interface IParsedPaste {
  username: string;
  series: ParsedSeries[];
}

/**
 * Pantalla inicial (0 perfiles) y punto de entrada para crear un perfil
 * adicional: el usuario pega el mensaje privado que le manda Mudae con su
 * harem sobre la "zona de pegado" (un div, no un textarea/input). Desde la
 * feature 008, un pegado con formato válido ya no crea el perfil de
 * inmediato: primero valida el formato (`parseHaremMessage`, sin
 * persistir nada) y abre `ServerPickerModal` para indicar a qué servidor
 * pertenece (FR-001); recién al confirmar ese pedido se crea/sincroniza
 * el perfil (`createProfileWithServer`). Volver atrás sin pegar nada es
 * responsabilidad de quien la use (ej. la flecha de `ProfilesModal`), no
 * de este componente.
 */
const PasteHaremScreen = ({ onCreated }: IPasteHaremScreen) => {
  const { createProfileWithServer } = useProfiles();
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pendingPaste, setPendingPaste] = useState<IParsedPaste | undefined>(undefined);

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    // Siempre se evita que el texto pegado se inserte en el div: esto es
    // una zona de pegado, no un campo para releer lo que se escribió.
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    const parsed = parseHaremMessage(pastedText);

    if (pasteZoneRef.current) {
      pasteZoneRef.current.textContent = "";
    }

    if (!parsed.ok) {
      setError(
        "No se reconoció el formato del harem pegado. Verificá que sea el mensaje completo que te manda Mudae.",
      );
      return;
    }

    setError(undefined);
    setPendingPaste({ username: parsed.profileName, series: parsed.series });
  };

  const handleConfirmServer = (choice: ServerChoice) => {
    if (!pendingPaste) {
      return;
    }
    const result = createProfileWithServer(pendingPaste.username, pendingPaste.series, choice);
    if (result.ok) {
      setPendingPaste(undefined);
      onCreated?.();
      return;
    }
    setPendingPaste(undefined);
    setError(
      "No se reconoció el formato del harem pegado. Verificá que sea el mensaje completo que te manda Mudae.",
    );
  };

  return (
    <Container>
      <PasteZone
        ref={pasteZoneRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Pegá tu harem acá"
        data-placeholder="Pegá acá tu harem"
        onPaste={handlePaste}
      />
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      <AdviceBox>
        <AdviceTitle>
          <Info size={16} aria-hidden="true" />
          ¿Cómo cargar tu harem?
        </AdviceTitle>
        <AdviceList>
          <AdviceItem>
            En tu servidor de Discord, en el canal donde esté habilitado Mudae,
            escribe: <code>$mmaikrs</code>. Esto hará que Mudae te envíe un
            mensaje con tu lista de personajes.
          </AdviceItem>
          <AdviceItem>Copiá todo ese mensaje.</AdviceItem>
          <AdviceItem>
            Pegalo directamente acá arriba: con Ctrl + V en la computadora, o
            manteniendo presionado y eligiendo &quot;Pegar&quot; en el celular.
          </AdviceItem>
        </AdviceList>
      </AdviceBox>
      {pendingPaste && (
        <ServerPickerModal onConfirm={handleConfirmServer} onClose={() => setPendingPaste(undefined)} />
      )}
    </Container>
  );
};

export default PasteHaremScreen;
