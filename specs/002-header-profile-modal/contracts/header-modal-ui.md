# Contrato de UI: Header + Modal de Perfiles

**Módulos**: `presentation/components/Header/`, `Modal/`,
`ProfilesModal/`, `ProfileList/`, `ProfileCard/` (extendido).

## `Header`

- Sin props (lee `useProfiles()` directamente, igual que hacía `App.tsx`
  antes).
- Fijo en la parte superior (`position: sticky` o `fixed` + z-index por
  encima del contenido, por debajo de `zIndex.modal`).
- Título "MyMudae" a la izquierda; control de perfil a la derecha:
  - `activeProfile` presente → botón con `activeProfile.alias`.
  - sin `activeProfile` (0 perfiles, o `urlProfileStatus === 'not-found'`
    sin ningún otro activo) → botón con invitación a crear ("Crear
    perfil" o similar).
  - cualquiera de los dos abre `ProfilesModal` al presionarse.

## `Modal` (genérico, reutilizable)

```ts
interface IModal {
  onClose: () => void
  ariaLabel: string
  children: ReactNode
}
```

- Overlay + diálogo centrado sobre `zIndex.modal` (o `zIndex.nestedDialog`
  si se renderiza anidado — lo decide el caller pasando la prop de
  z-index apropiada, o el propio `ConfirmDeleteProfileDialog` se ajusta
  para pedir el nivel más alto).
- Cierra con click en el overlay, tecla Escape, o llamando a `onClose`
  desde el contenido.

## `ProfilesModal`

- Sin props (se monta/desmonta desde `Header` según un estado local de
  "modal abierto").
- Contenido: `ProfileList` (o el estado vacío + `PasteHaremScreen` si no
  hay perfiles) + acción "nuevo perfil" que revela `PasteHaremScreen`
  dentro del mismo modal (mismo patrón que ya existía en `App.tsx` de la
  feature anterior, ahora reubicado acá).
- Al crear/sincronizar un perfil con éxito dentro del modal, el modal NO
  se cierra automáticamente (el usuario puede seguir viendo/gestionando
  la lista); si lo desea, lo cierra con Escape o clickeando afuera.

## `ProfileList`

- Envuelve las filas en `DndContext` + `SortableContext` de `@dnd-kit`;
  al terminar un arrastre (`onDragEnd`), llama a `reorderProfiles` con
  los `id`s en el nuevo orden.
- Cada fila es un `ProfileCard` dentro de un `useSortable({ id: profile.id })`.

## `ProfileCard` — props nuevas sobre `001`

```ts
interface IProfileCard {
  profile: Profile
  onActivate: (profileId: string) => void
  onDelete: (profileId: string) => void
  onRename: (profileId: string, alias: string) => void
  onOpenInNewTab: (profileId: string) => void   // NUEVO
  characterCount: number                         // NUEVO (calculado por el caller con countCharacters)
  totalKakera: number                            // NUEVO (calculado por el caller con sumKakera)
  dragHandleProps?: DraggableAttributes & SyntheticListenerMap  // NUEVO, de useSortable
}
```

- Debajo del alias: `characterCount` personajes · `totalKakera` kakera.
- Fila activa: efecto de foco/resaltado visual (borde/fondo en `accent`,
  reutilizando el mismo lenguaje visual que el `:focus-visible` de
  `PasteZone` en `DESIGN.md`).
- Acciones: editar (ya existente), eliminar (ya existente, abre
  `ConfirmDeleteProfileDialog` — ahora como diálogo anidado dentro del
  modal), abrir en pestaña nueva (nuevo, ícono tipo `ExternalLink` de
  `lucide-react`), y una manija de arrastre (ícono `GripVertical`) que
  recibe `dragHandleProps`.
