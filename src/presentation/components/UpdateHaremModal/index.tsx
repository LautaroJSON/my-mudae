import { useRef, useState, type ClipboardEvent } from "react";
import { useProfiles } from "../../context/ProfilesContext";
import Modal from "../Modal";
import {
  ButtonRow,
  ErrorMessage,
  ForceButton,
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
  | {
      kind: "mismatch";
      /** Nombre que venía en el encabezado del pegado. */
      pastedProfileName: string;
      /** `username` guardado del perfil: lo que realmente se comparó (NO el alias). */
      profileUsername: string;
      /** Se conserva para poder reintentar el mismo pegado forzando. */
      pastedText: string;
    };

/**
 * Modal de re-pegado para actualizar el harem del perfil activo (FR-002
 * a FR-007 de 005). Construido sobre el `Modal` genérico; usa su propia
 * zona de pegado en vez de reutilizar `PasteHaremScreen` (acoplado a
 * `createProfileFromPaste`, ver research.md). Una discordancia de
 * nombre de perfil reemplaza la zona de pegado por una vista de
 * advertencia dentro del mismo modal, nunca un segundo modal apilado.
 *
 * Esa vista muestra el `username` guardado (el valor que el caso de uso
 * compara), nunca el `alias`: mostrar el alias hacía que un perfil
 * renombrado exhibiera dos nombres idénticos en un mensaje de "no
 * coinciden". Y ofrece forzar la actualización, la salida para cuando el
 * nombre en Discord/Mudae cambió de verdad.
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
        profileUsername: result.profileUsername,
        pastedText,
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
    const handleForce = () => {
      const result = updateActiveProfileHarem(view.pastedText, { force: true });
      if (result.ok) {
        onUpdated();
      }
    };

    return (
      <Modal onClose={onClose} ariaLabel="Actualizar harem">
        <Title>Actualizar harem</Title>
        <Message>
          El texto pegado pertenece a{" "}
          <MismatchName>{view.pastedProfileName}</MismatchName>, pero este
          perfil se creó con el nombre de Mudae{" "}
          <strong>{view.profileUsername}</strong>
          {activeProfile && activeProfile.alias !== view.profileUsername && (
            <> (lo ves en la app como «{activeProfile.alias}»)</>
          )}
          . No se modificó ningún harem.
        </Message>
        <Message>
          Si te cambiaste el nombre en Discord, actualizá de todas formas: se
          sobrescribe el harem de este perfil y pasa a llamarse{" "}
          <strong>{view.pastedProfileName}</strong>.
        </Message>
        <ButtonRow>
          <ForceButton type="button" onClick={handleForce}>
            Actualizar de todas formas
          </ForceButton>
          <RetryButton type="button" onClick={() => setView({ kind: "paste" })}>
            Reintentar
          </RetryButton>
        </ButtonRow>
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
