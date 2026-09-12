import { useRef, useState, type ClipboardEvent } from "react";
import { useProfiles } from "../../context/ProfilesContext";
import Modal from "../Modal";
import {
  ErrorMessage,
  Message,
  MismatchName,
  PasteZone,
  RetryButton,
  Title,
} from "./styles";

interface IUpdateHaremModal {
  onClose: () => void;
  /** Se llama tras actualizar el harem con éxito; el padre decide cerrar el modal y mostrar feedback. */
  onUpdated: () => void;
}

type View =
  | { kind: "paste"; formatError?: string }
  | { kind: "mismatch"; pastedProfileName: string };

/**
 * Modal de re-pegado para actualizar el harem del perfil activo (FR-002
 * a FR-007 de 005). Construido sobre el `Modal` genérico; usa su propia
 * zona de pegado en vez de reutilizar `PasteHaremScreen` (acoplado a
 * `createProfileFromPaste`, ver research.md). Una discordancia de
 * nombre de perfil reemplaza la zona de pegado por una vista de
 * advertencia dentro del mismo modal, nunca un segundo modal apilado.
 */
const UpdateHaremModal = ({ onClose, onUpdated }: IUpdateHaremModal) => {
  const { activeProfile, updateActiveProfileHarem } = useProfiles();
  const pasteZoneRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ kind: "paste" });

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    const result = updateActiveProfileHarem(pastedText);

    if (pasteZoneRef.current) {
      pasteZoneRef.current.textContent = "";
    }

    if (result.ok) {
      onUpdated();
      return;
    }

    if (result.reason === "PROFILE_MISMATCH") {
      setView({
        kind: "mismatch",
        pastedProfileName: result.pastedProfileName,
      });
      return;
    }

    setView({
      kind: "paste",
      formatError:
        "No se reconoció el formato del harem pegado. Verificá que sea el mensaje completo que te manda Mudae.",
    });
  };

  if (view.kind === "mismatch") {
    return (
      <Modal onClose={onClose} ariaLabel="Actualizar harem">
        <Title>Actualizar harem</Title>
        <Message>
          El texto pegado pertenece a{" "}
          <MismatchName>{view.pastedProfileName}</MismatchName>, que no
          corresponde al perfil que se está actualizando (
          <strong>{activeProfile?.alias}</strong>). No se modificó ningún harem.
        </Message>
        <RetryButton type="button" onClick={() => setView({ kind: "paste" })}>
          Reintentar
        </RetryButton>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} ariaLabel="Actualizar harem">
      <Title>Actualizar harem</Title>
      <Message>
        Volvé a pegar el mensaje que te manda Mudae con <code>$mmaikrs</code>{" "}
        para actualizar tu harem con los cambios más recientes.
      </Message>
      <PasteZone
        ref={pasteZoneRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Pegá tu harem actualizado acá"
        data-placeholder="Pegá acá tu harem actualizado"
        onPaste={handlePaste}
      />
      {view.formatError && (
        <ErrorMessage role="alert">{view.formatError}</ErrorMessage>
      )}
    </Modal>
  );
};

export default UpdateHaremModal;
