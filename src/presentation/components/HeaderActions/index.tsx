import { useProfiles } from "../../context/ProfilesContext";
import ShareHaremButton from "../ShareHaremButton";
import UpdateHaremButton from "../UpdateHaremButton";
import HaremSortButton from "../HaremSortButton";
import { ActionsRow } from "./styles";

/**
 * Lista horizontal de iconos redondos de acciones rápidas en la esquina
 * superior derecha (FR-001 de 004). Monta "Compartir harem" (004),
 * "Actualizar harem" (005) y "Ordenar harem" (010); queda preparada para
 * sumar más en futuras features del mismo conjunto sin volver a tocar
 * `Header`.
 */
const HeaderActions = () => {
  const { activeProfile } = useProfiles();
  return (
    <ActionsRow>
      {activeProfile && (
        <>
          <ShareHaremButton />
          <UpdateHaremButton />
          <HaremSortButton />
        </>
      )}
    </ActionsRow>
  );
};

export default HeaderActions;
