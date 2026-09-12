---

description: "Task list template for feature implementation"
---

# Tasks: Servidores Múltiples por Usuario (Reestructura de Perfiles)

**Input**: Design documents from `/specs/008-multi-server-profiles/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: el plan (`research.md`, `data-model.md`, `contracts/*.md`) ya comprometió una estrategia de testing concreta para cada pieza nueva/modificada (igual que en `001`-`007`), así que las tareas de test de abajo SÍ están incluidas.

**Organization**: 4 historias de usuario (`spec.md`) — US1 (P1) alta con servidor, US2 (P2) eliminar servidor, US3 (P2) ver agrupado por servidor, US4 (P3) reordenar. La reestructura de `Profile`/creación de `Server`/`ServerRepository` es un cambio de forma que rompe compilación/tests existentes independientemente de qué historia se implemente primero, por lo que vive en Foundational (Phase 2), no dentro de ninguna historia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1-US4)
- Cada tarea incluye la ruta de archivo exacta

## Path Conventions

Mismo proyecto único de `001`-`007`: `src/{domain,application,infrastructure,presentation,shared}/` y `tests/` en la raíz del repo.

---

## Phase 1: Setup

Sin tareas — esta feature no agrega ninguna dependencia nueva a `package.json` (reutiliza `react`, `styled-components`, `lucide-react`, `@dnd-kit/*`, el `Modal` genérico y el patrón `zIndex.nestedDialog` ya existentes; ver `research.md`/`plan.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: el nuevo tipo `Server`, el cambio de forma de `Profile` (id vuelve a ser UUID; +`serverId`/+`username`; -`order`) y la eliminación del shim `migrateLegacyProfiles` son cambios de base que rompen compilación/tests existentes sin importar qué historia se aborde primero — deben quedar resueltos antes de tocar cualquier historia.

**⚠️ CRITICAL**: ninguna historia de usuario puede empezar hasta completar esta fase.

- [X] T001 [P] Test de las funciones puras nuevas de `domain/server/Server.ts` en `tests/unit/domain/server.test.ts`: `addProfileToServer`/`removeProfileFromServer` (agregar/quitar en un servidor de 2+ perfiles sin afectar otro; agregar un id ya presente no lo duplica; ids/servidores inexistentes no lanzan); `removeServer` (elimina el servidor sin tocar `Profile[]`; inexistente no lanza); `reorderServers`/`reorderProfilesInServer` (reordenamiento parcial/con ids desconocidos, análogo a `reorderProfiles`/`reorderCharactersInSeries` ya existentes); `pickNextActiveProfileId` (con 2+ servidores, eliminar el primero completo → devuelve el primer perfil del segundo; todos vacíos → `undefined`) — según `contracts/server-domain.md`
- [X] T002 Implementar `domain/server/Server.ts` en `src/domain/server/Server.ts`: `interface Server { id, name, profileIds }` + las 6 funciones puras de T001, mismo estilo tolerante (nunca lanza) que `domain/profile/Profile.ts`/`domain/harem/Harem.ts` — según `data-model.md`; hace pasar T001 (depende de T001)
- [X] T003 [P] Modificar `src/domain/profile/Profile.ts`: `id` vuelve a generarse como `crypto.randomUUID()` (ya no derivado del username); agregar campos `serverId: string` y `username: string`; eliminar el campo `order`; simplificar `removeProfile(profiles, profileId)` a un simple filtro (ya no elige reemplazo activo); eliminar la función `reorderProfiles` de este archivo — según `data-model.md`
- [X] T004 [P] Eliminar `src/domain/profile/migrateLegacyProfiles.ts` y cualquier test que lo cubra (dead code — no hay perfiles reales que migrar, ver `research.md`/Assumptions de `spec.md`)
- [X] T005 Actualizar `src/infrastructure/storage/LocalStorageProfileRepository.ts`: quitar la llamada a `migrateLegacyProfiles` (eliminado en T004) del camino de lectura
- [X] T006 [P] Crear el puerto `ServerRepository` en `src/application/ports/ServerRepository.ts`: `interface ServerRepository { getAll(): Server[]; save(servers: Server[]): void }` — según `data-model.md`
- [X] T007 [P] Test de `LocalStorageServerRepository` en `tests/infrastructure/LocalStorageServerRepository.test.ts`: `getAll()` vacío sin nada persistido; `save()`+`getAll()` round-trip; JSON corrupto en `localStorage` → `getAll()` devuelve `[]` sin lanzar (mismo comportamiento defensivo que `LocalStorageProfileRepository.test.ts`)
- [X] T008 Implementar `LocalStorageServerRepository` en `src/infrastructure/storage/LocalStorageServerRepository.ts`: clave `mymudae:serverList`, mismo patrón defensivo try/catch silencioso que `LocalStorageProfileRepository` — según `data-model.md`; hace pasar T007 (depende de T006, T007)
- [X] T009 [P] Crear `InMemoryServerRepository` en `tests/support/InMemoryServerRepository.ts`, mismo patrón que `tests/support/InMemoryProfileRepository.ts` (test double en memoria, `getAll`/`save`)
- [X] T010 Modificar `src/application/useCases/deleteProfile.ts`: gana parámetro `serverRepository: ServerRepository`; además de `removeProfile` sobre `Profile[]`, quita el perfil de `Server.profileIds` vía `removeProfileFromServer`; si el perfil eliminado era el activo, usa `pickNextActiveProfileId(servers, profiles)` (ya actualizados) en vez de la lógica anterior basada en `order` — según `contracts/delete-server.md` (depende de T002, T003)
- [X] T011 [P] Actualizar `tests/unit/application/deleteProfile.test.ts` para la nueva firma/fixtures (`Profile` con `serverId`/`username`, sin `order`; repositorio de servidores en memoria vía T009): eliminar un perfil no activo de un servidor con 2+ perfiles conserva el resto del `profileIds` en orden; eliminar el activo con otro perfil en el MISMO servidor activa el siguiente de ESE servidor; eliminar el único perfil de un servidor con perfiles en OTRO servidor activa el primero del otro servidor y el servidor recién vaciado persiste sin perfiles — según `contracts/delete-server.md`; hace pasar contra T010 (depende de T009, T010)
- [X] T012 Modificar `src/presentation/context/ProfilesContext.tsx`: inyectar un segundo repositorio (`serverRepository`, default `LocalStorageServerRepository`, inyectable para tests igual que `repository` hoy); cargar y exponer `servers: Server[]` en el estado del provider; actualizar el sitio donde se llama a `deleteProfile` para pasarle `serverRepository` (depende de T003, T008, T010)
- [X] T013 [P] Actualizar los fixtures de `Profile` usados en tests existentes que sigan referenciando la forma vieja (`id` = username, campo `order`) en `tests/unit/application/activateProfile.test.ts`, `tests/unit/application/renameProfile.test.ts` y cualquier otro test de aplicación/componente que construya un `Profile` a mano, para que compilen y pasen con el nuevo shape (`id` UUID + `serverId`/`username`, sin `order`) — sin cambiar el comportamiento que ya verificaban

**Checkpoint**: `Server` existe y persiste; `Profile` tiene el nuevo shape; `deleteProfile` y el resto de la suite existente compilan y pasan contra el nuevo shape. Recién acá puede empezar cualquier historia de usuario.

---

## Phase 3: User Story 1 - Indicar el servidor al dar de alta un perfil (Priority: P1) 🎯 MVP

**Goal**: al pegar un harem con formato válido durante el alta, en vez de crear el perfil de inmediato se abre un pedido de servidor (nombre nuevo hasta 50 caracteres, o elegir uno ya cargado por radio button); confirmar crea/sincroniza el perfil asociado a ese servidor, permitiendo que el mismo nombre de usuario tenga harems independientes en servidores distintos.

**Independent Test**: pegar un harem válido, verificar que aparece el pedido de servidor antes de crear nada; escribir un servidor nuevo y confirmar → perfil creado en ese servidor; pegar otro harem y elegir el servidor recién creado por radio → ambos perfiles quedan bajo el mismo servidor; repetir el mismo username en un servidor B nuevo → segundo perfil independiente, sin afectar el de servidor A.

### Tests for User Story 1 ⚠️

- [X] T014 [P] [US1] Test de `createProfileWithServer` en `tests/unit/application/createProfileWithServer.test.ts` con `InMemoryProfileRepository`/`InMemoryServerRepository` vacíos: `new-server` crea el servidor y el perfil (`profileIds: [nuevoId]`); `existing-server` con un servidor ya existente agrega el perfil a SU `profileIds` sin crear un servidor adicional; repetir alta con mismo `serverId`+`username` → `mode: 'synced'`, sin duplicar perfil ni membresía; mismo `username` eligiendo un servidor DISTINTO → `mode: 'created'`, perfil nuevo e independiente, el otro servidor queda intacto; `existing-server` con `serverId` inexistente → `{ ok: false, reason: 'SERVER_NOT_FOUND' }`, ningún repositorio cambia — según `contracts/create-profile-with-server.md`
- [X] T015 [P] [US1] Actualizar `tests/unit/application/updateActiveProfileHarem.test.ts`: ajustar fixtures de `Profile` a `serverId`/`username` (en vez de `id = username`); reutilizar los casos ya cubiertos en `005` (formato inválido, discordancia, éxito, perfil activo inexistente); caso nuevo: dos perfiles con el mismo `username` en servidores distintos, uno activo → actualizar el activo con un pegado de ese `username` sincroniza el perfil activo correcto sin afectar al del otro servidor — según `contracts/create-profile-with-server.md`
- [X] T016 [P] [US1] Test de `ServerPickerModal` en `tests/component/presentation/ServerPickerModal.test.tsx`: input de texto con `maxLength=50`; sin servidores existentes no se renderiza ninguna lista; con servidores existentes se renderiza un radio por servidor (mismo `name`, mutuamente excluyentes); elegir un radio deshabilita/opaca el input de texto; botón de confirmar deshabilitado hasta que haya texto no vacío O un radio elegido; confirmar con texto llama a `onConfirm({ kind: 'new-server', name })`; confirmar con radio llama a `onConfirm({ kind: 'existing-server', serverId })` — según `contracts/server-list-ui.md` (la eliminación de servidores desde este modal se testea en US2)
- [X] T017 [P] [US1] Actualizar `tests/component/presentation/PasteHaremScreen.test.tsx`: pegar un texto válido llama a `parseHaremMessage` y abre `ServerPickerModal` SIN haber llamado a ningún método de creación todavía; confirmar el modal con una elección de servidor llama a `createProfileWithServer(username, series, choice)`; cancelar el modal no crea nada y permite volver a pegar; pegar un texto inválido sigue mostrando el mismo error inline de siempre, sin abrir nada — según `contracts/server-list-ui.md`

### Implementation for User Story 1

- [X] T018 [US1] Implementar `createProfileWithServer` en `src/application/useCases/createProfileWithServer.ts`: recibe el pegado ya parseado (`parsedUsername`, `parsedSeries`) + `ServerChoice`; crea servidor nuevo si corresponde; busca coincidencia por `serverId === target.id && username === parsedUsername` para decidir crear-vs-sincronizar (`syncHarem`); persiste `Profile[]` y `Server[]` según corresponda — según `contracts/create-profile-with-server.md` y `data-model.md`; hace pasar T014 (depende de T002, T003, T006)
- [X] T019 [US1] Eliminar `src/application/useCases/createProfileFromPaste.ts` y `tests/unit/application/createProfileFromPaste.test.ts` (reemplazados por T018/T014)
- [X] T020 [US1] Modificar `src/application/useCases/updateActiveProfileHarem.ts`: resolver `target = profiles.find(p => p.id === activeProfileId)` antes de comparar, y comparar `parsed.profileName !== target.username` (antes comparaba contra `activeProfileId`); el resto del contrato de `005` no cambia — según `contracts/create-profile-with-server.md`; hace pasar T015 (depende de T003)
- [X] T021 [US1] Extender `ProfilesContext` (`src/presentation/context/ProfilesContext.tsx`): exponer `createProfileWithServer(parsedUsername, parsedSeries, choice)` (reemplaza a `createProfileFromPaste`), operando sobre los dos repositorios ya inyectados (depende de T012, T018, T019, T020)
- [X] T022 [US1] Crear `ServerPickerModal` en `src/presentation/components/ServerPickerModal/{index.tsx,styles.tsx}`: construido sobre `Modal` genérico; input de texto `maxLength={50}`; lista de `useProfiles().servers` con un radio por servidor (deshabilita/opaca el input al elegir uno); botón confirmar deshabilitado sin texto ni radio; `onConfirm`/`onClose` por props — según `contracts/server-list-ui.md`; hace pasar T016 (el botón "Eliminar" por fila se agrega recién en US2, T027) (depende de T021)
- [X] T023 [US1] Modificar `PasteHaremScreen` (`src/presentation/components/PasteHaremScreen/index.tsx`): al pegar, llamar directamente a `parseHaremMessage(rawText)` (sin pasar por el contexto); en formato válido, guardar `{ username, series }` en estado local y montar `<ServerPickerModal>` en vez de crear el perfil; al confirmar el modal, llamar a `createProfileWithServer` y, si `ok`, limpiar el estado y notificar como hoy; al cancelar, cerrar sin crear nada; `SERVER_NOT_FOUND` se trata como error inline — según `contracts/server-list-ui.md`; hace pasar T017 (depende de T022)
- [X] T024 [US1] Verificar manualmente los Escenarios 1-3 de `quickstart.md` (alta con servidor nuevo, alta reutilizando servidor existente por radio, mismo username en servidores distintos sin interferencia)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente — el alta de perfiles ya asocia cada perfil a un servidor, nuevo o existente.

---

## Phase 4: User Story 2 - Eliminar un servidor no deseado desde el pedido de servidor (Priority: P2)

**Goal**: desde el mismo `ServerPickerModal` del alta, poder eliminar un servidor cargado por error; si está vacío se elimina de inmediato, si tiene perfiles se exige confirmar en una advertencia con la lista de esos perfiles (scroll a 300px, ancho completo).

**Independent Test**: con un servidor vacío guardado, eliminarlo desde el pedido de servidor → desaparece sin confirmación; con un servidor con perfiles, eliminarlo → aparece la advertencia con cantidad+lista; cancelar no cambia nada; confirmar elimina servidor y perfiles.

### Tests for User Story 2 ⚠️

- [X] T025 [P] [US2] Test de `deleteServer` en `tests/unit/application/deleteServer.test.ts`: servidor de 3 perfiles (uno activo) + otro servidor con 1 perfil → eliminar el primero borra los 3 perfiles y el servidor, y activa el único perfil del segundo servidor; eliminar un servidor vacío → solo desaparece el servidor, `deletedProfileCount: 0`, sin cambio de perfil activo; eliminar el único servidor con el único perfil activo → ambas colecciones quedan vacías, ningún perfil activo; `serverId` inexistente → sin cambios, `deletedProfileCount: 0` — según `contracts/delete-server.md`
- [X] T026 [P] [US2] Test de `ConfirmDeleteServerDialog` en `tests/component/presentation/ConfirmDeleteServerDialog.test.tsx`: renderiza la cantidad de perfiles y un `<ul>` con `profileAliases` dentro de un contenedor `max-height:300px; overflow-y:auto` a ancho completo; confirmar llama a `onConfirm`; cancelar llama a `onCancel` sin ningún otro efecto — según `contracts/server-list-ui.md`
- [X] T027 [P] [US2] Extender `tests/component/presentation/ServerPickerModal.test.tsx`: cada fila de servidor existente tiene un botón "Eliminar"; tocarlo en un servidor con `profileIds.length === 0` llama a `deleteServer` de inmediato sin montar ningún diálogo (y limpia la selección de radio si era ese el elegido); tocarlo en uno con `profileIds.length > 0` monta `ConfirmDeleteServerDialog` con la lista de alias correcta en vez de eliminar directo; cancelar ese diálogo no cierra el `ServerPickerModal` ni cambia datos — según `contracts/server-list-ui.md`

### Implementation for User Story 2

- [X] T028 [US2] Implementar `deleteServer` en `src/application/useCases/deleteServer.ts`: elimina el `Server` (`removeServer`) y en cascada todos los `Profile` con ese `serverId`; si el activo estaba entre los eliminados, reactiva vía `pickNextActiveProfileId` sobre el estado ya actualizado; devuelve `{ ok: true, deletedProfileCount }` — según `contracts/delete-server.md` y `data-model.md`; hace pasar T025 (depende de T002, T003)
- [X] T029 [US2] Exponer `deleteServer(serverId)` en `ProfilesContext` (depende de T012, T028)
- [X] T030 [US2] Crear `ConfirmDeleteServerDialog` en `src/presentation/components/ConfirmDeleteServerDialog/{index.tsx,styles.tsx}`: construido sobre `Modal` con `zIndex.nestedDialog` (mismo patrón que `ConfirmDeleteProfileDialog`); mensaje con la cantidad + `<ul>` de `profileAliases` en contenedor `max-height: 300px; overflow-y: auto` a ancho completo; props `serverName`, `profileAliases`, `onConfirm`, `onCancel` — según `contracts/server-list-ui.md`; hace pasar T026
- [X] T031 [US2] Modificar `ServerPickerModal` (`src/presentation/components/ServerPickerModal/index.tsx`): agregar botón "Eliminar" (icono `Trash2`, mismo ícono que `ProfileCard`) por fila de servidor existente; si `profileIds.length === 0` llama a `deleteServer` de inmediato; si no, monta `ConfirmDeleteServerDialog` (confirmar invoca `deleteServer` y cierra el diálogo, cancelar solo cierra el diálogo) — según `contracts/server-list-ui.md`; hace pasar T027 (depende de T029, T030)
- [X] T032 [US2] Verificar manualmente los Escenarios 5-6 de `quickstart.md` (eliminar servidor vacío sin confirmación, eliminar servidor con perfiles con confirmación cancelar/confirmar)

**Checkpoint**: User Stories 1 y 2 funcionan juntas de forma independiente — el pedido de servidor permite tanto elegir/crear como limpiar servidores no deseados.

---

## Phase 5: User Story 3 - Ver los perfiles agrupados por servidor (Priority: P2)

**Goal**: la lista de perfiles (dentro de `ProfilesModal`) pasa de una lista plana a un acordeón de un nivel: servidores (con al menos un perfil) como nivel superior, cada uno desplegable para ver sus propios perfiles; más de uno puede estar desplegado a la vez.

**Independent Test**: con perfiles en 2+ servidores, abrir la lista de perfiles y verificar que se ven los nombres de servidor como nivel superior; desplegar uno muestra solo sus perfiles; desplegar un segundo sin colapsar el primero muestra ambos sin mezclarse; un servidor sin perfiles no aparece en esta lista.

### Tests for User Story 3 ⚠️

- [X] T033 [P] [US3] Test de `ServerList` en `tests/component/presentation/ServerList.test.tsx`: con servidores mixtos (algunos con `profileIds` vacío, otros no), solo renderiza los que tienen al menos un perfil; si ninguno califica, muestra el mismo `EmptyMessage` ya existente adaptado ("Todavía no tenés ningún perfil")
- [X] T034 [P] [US3] Test de `ServerListItem` en `tests/component/presentation/ServerListItem.test.tsx`: colapsado no muestra perfiles; clickear el nombre despliega y renderiza `ProfileList` con únicamente los perfiles de ESE servidor, en el orden de su `profileIds`; el estado expandido/colapsado es local a cada item (dos instancias pueden estar expandidas a la vez sin coordinarse)
- [X] T035 [P] [US3] Actualizar `tests/component/presentation/ProfilesModal.test.tsx` y/o `tests/component/presentation/ProfilesFlow.test.tsx`: con perfiles en 2+ servidores, abrir la lista de perfiles muestra los servidores agrupados (no una lista plana); desplegar dos servidores a la vez muestra los perfiles correctos de cada uno sin mezclarse

### Implementation for User Story 3

- [X] T036 [US3] Modificar `ProfileList` (`src/presentation/components/ProfileList/index.tsx`): recibir `profiles: Profile[]` y `serverId: string` por props en vez de leer todos los perfiles del contexto; en esta historia el reordenamiento por arrastre queda fuera de alcance (se restaura en US4) — `ProfileListItem`/`ProfileCard` no cambian — según `contracts/server-list-ui.md`
- [X] T037 [US3] Crear `ServerListItem` en `src/presentation/components/ServerListItem/{index.tsx,styles.tsx}`: fila con el nombre del servidor clickeable para expandir/colapsar (estado local); expandido monta `<ProfileList profiles={...} serverId={server.id} />` con los perfiles de ese servidor en el orden de `profileIds` — según `contracts/server-list-ui.md`; hace pasar T034 (depende de T036)
- [X] T038 [US3] Crear `ServerList` en `src/presentation/components/ServerList/{index.tsx,styles.tsx}`: filtra `useProfiles().servers` a los que tienen `profileIds.length > 0`, renderiza un `ServerListItem` por cada uno; `EmptyMessage` si ninguno califica — según `contracts/server-list-ui.md`; hace pasar T033 (depende de T037)
- [X] T039 [US3] Modificar `ProfilesModal` (`src/presentation/components/ProfilesModal/index.tsx`): montar `<ServerList />` en vez de `<ProfileList />` directamente; hace pasar T035 (depende de T038)
- [X] T040 [US3] Verificar manualmente el Escenario 4 de `quickstart.md` (ver perfiles agrupados, dos servidores desplegados a la vez sin mezclarse, servidor vacío ausente de la lista)

**Checkpoint**: User Stories 1-3 funcionan juntas de forma independiente — la lista de perfiles ya se ve agrupada por servidor (el reordenamiento por drag-and-drop se agrega en US4).

---

## Phase 6: User Story 4 - Reordenar servidores y perfiles dentro de cada servidor (Priority: P3)

**Goal**: restaurar drag-and-drop tanto para los servidores entre sí (nivel superior del acordeón) como para los perfiles dentro de cada servidor, persistiendo el nuevo orden automáticamente.

**Independent Test**: con 2+ servidores, arrastrar uno a otra posición y verificar que el nuevo orden persiste tras recargar; con un servidor de 2+ perfiles, arrastrar uno a otra posición dentro del mismo servidor y verificar que persiste sin afectar el orden de perfiles de otro servidor.

### Tests for User Story 4 ⚠️

- [X] T041 [P] [US4] Test de `reorderServers` (caso de uso) en `tests/unit/application/reorderServers.test.ts`: reordena `Server[]` vía el repositorio inyectado, mismo criterio tolerante que `reorderProfiles`/`reorderCharactersInSeries` (ids desconocidos se ignoran, ausentes quedan al final)
- [X] T042 [P] [US4] Test de `reorderProfilesInServer` (caso de uso) en `tests/unit/application/reorderProfilesInServer.test.ts`: reordena `profileIds` de un único servidor sin afectar ningún otro servidor del mismo repositorio
- [X] T043 [P] [US4] Crear `tests/component/presentation/ServerList.dragdrop.test.tsx`: arrastrar un servidor a otra posición llama a `reorderServers` con la secuencia de ids esperada (mismo mecanismo de test ya usado por `ProfileList.dragdrop.test.tsx`)
- [X] T044 [P] [US4] Actualizar `tests/component/presentation/ProfileList.dragdrop.test.tsx`: arrastrar un perfil dentro de un servidor llama a `reorderProfilesInServer(serverId, orderedIds)` con el `serverId` correcto, sin afectar otro servidor

### Implementation for User Story 4

- [X] T045 [P] [US4] Implementar `reorderServers(serverRepository, orderedIds)` en `src/application/useCases/reorderServers.ts`: lee, aplica `reorderServers` de dominio, guarda — según `data-model.md`; hace pasar T041
- [X] T046 [P] [US4] Implementar `reorderProfilesInServer(serverRepository, serverId, orderedProfileIds)` en `src/application/useCases/reorderProfilesInServer.ts`: lee, aplica `reorderProfilesInServer` de dominio, guarda — según `data-model.md`; hace pasar T042
- [X] T047 [US4] Eliminar `src/application/useCases/reorderProfiles.ts` y `tests/unit/application/reorderProfiles.test.ts` (reemplazado por T046/T042)
- [X] T048 [US4] Exponer `reorderServers(orderedServerIds)` y `reorderProfilesInServer(serverId, orderedProfileIds)` en `ProfilesContext`, reemplazando el `reorderProfiles` plano eliminado (depende de T012, T045, T046, T047)
- [X] T049 [US4] Agregar `DndContext`/`SortableContext` (mismo patrón `PointerSensor`+`KeyboardSensor` que `ProfileList`/`HaremView`) a `ServerList` (`src/presentation/components/ServerList/index.tsx`), llamando a `reorderServers` vía `computeReorderedIds` en `onDragEnd` — según `contracts/server-list-ui.md`; hace pasar T043 (depende de T048)
- [X] T050 [US4] Restaurar el `onDragEnd` de `ProfileList` (`src/presentation/components/ProfileList/index.tsx`) para llamar a `reorderProfilesInServer(serverId, orderedIds)` (recibiendo `serverId` por props desde T036) en vez del `reorderProfiles` plano eliminado — según `contracts/server-list-ui.md`; hace pasar T044 (depende de T048)
- [X] T051 [US4] Verificar manualmente el Escenario 7 de `quickstart.md` (reordenar servidores y perfiles dentro de un servidor, persistencia tras recargar)

**Checkpoint**: Las 4 historias de usuario funcionan de forma independiente y en conjunto — reestructura completa según `spec.md`.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T052 [P] Verificar manualmente el Escenario 8 de `quickstart.md` (viewport móvil ~390×844, Principio V): pedido de servidor (input+radios+lista con scroll), acordeón de dos niveles y advertencia de eliminación (con su lista scrolleable) se leen completos y son operables por touch, sin desbordar horizontalmente
- [X] T053 [P] Auditar el Principio VII sobre todos los componentes nuevos/modificados de esta feature (`ServerPickerModal`, `ConfirmDeleteServerDialog`, `ServerList`, `ServerListItem`, `ProfileList`, `PasteHaremScreen`, `ProfilesModal`): grep de `React.FC`, `styled.` fuera de `styles.tsx`, presencia de interface `I<Nombre>` en cada `index.tsx` que reciba props, `export default` al final; sin valores de color/tipografía/spacing hardcodeados fuera de `theme.ts`
- [X] T054 Ejecutar `npm run lint`, `npx tsc -b --noEmit`, `npx vitest run` y `npm run build` — gate final

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin tareas
- **Foundational (Phase 2)**: sin dependencias previas — BLOQUEA el inicio de las 4 historias (cambia el shape de `Profile` y crea `Server`/`ServerRepository`, de los que dependen todas)
- **User Story 1 (Phase 3)**: depende solo de Foundational
- **User Story 2 (Phase 4)**: depende de Foundational; reutiliza `ServerPickerModal` creado en US1 (T022) para agregar el botón "Eliminar" — no puede empezar su implementación de UI antes de que exista ese componente, aunque `deleteServer` (T028) en sí es independiente
- **User Story 3 (Phase 5)**: depende de Foundational; no depende de US1/US2 para funcionar (puede probarse con servidores/perfiles sembrados directamente en los repositorios), pero en la práctica de la app ya vienen creados por US1
- **User Story 4 (Phase 6)**: depende de Foundational y de que `ProfileList`/`ServerList` ya existan con su forma final de props (T036, T038 de US3) — agrega el `DndContext` que US3 dejó deliberadamente fuera de alcance
- **Polish (Phase 7)**: depende de que las 4 historias estén completas

### Within Each User Story

- Tests (si se incluyen) antes que la implementación que los hace pasar
- Caso de uso (`application/`) antes que su exposición en `ProfilesContext`
- `ProfilesContext` antes que los componentes de `presentation/` que lo consumen
- Componente hoja antes que el componente que lo monta (p. ej. `ServerListItem` antes que `ServerList`, `ConfirmDeleteServerDialog` antes de wirearlo en `ServerPickerModal`)

### Parallel Opportunities

- Dentro de Foundational: T001/T003/T004/T006/T007/T009 (archivos distintos, sin dependencias pendientes entre sí) en paralelo; T002 depende de T001, T008 depende de T006+T007, T010 depende de T002+T003, T011/T013 dependen de tareas previas
- Dentro de cada historia: todas las tareas de test marcadas [P] en paralelo entre sí; T045/T046 (US4, casos de uso independientes) en paralelo
- Distintas historias NO deberían trabajarse en paralelo por distintas personas en este proyecto dado el orden de dependencia real entre ellas (US2 reutiliza el componente de US1; US4 reutiliza los componentes de US3) — a diferencia de un caso genérico de equipos, acá conviene el orden secuencial P1→P2→P2→P3

---

## Parallel Example: Foundational

```bash
# Lanzar juntos los tests/archivos independientes de Foundational:
Task: "Test de domain/server/Server.ts en tests/unit/domain/server.test.ts"
Task: "Modificar domain/profile/Profile.ts (id UUID, +serverId/+username, -order)"
Task: "Eliminar domain/profile/migrateLegacyProfiles.ts"
Task: "Crear el puerto ServerRepository en application/ports/ServerRepository.ts"
```

## Parallel Example: User Story 1

```bash
# Lanzar juntos los tests de US1:
Task: "Test de createProfileWithServer en tests/unit/application/createProfileWithServer.test.ts"
Task: "Actualizar tests/unit/application/updateActiveProfileHarem.test.ts"
Task: "Test de ServerPickerModal en tests/component/presentation/ServerPickerModal.test.tsx"
Task: "Actualizar tests/component/presentation/PasteHaremScreen.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 2: Foundational (bloqueante)
2. Completar Phase 3: User Story 1
3. **DETENERSE y VALIDAR**: Escenarios 1-3 de `quickstart.md` — el alta ya asocia cada perfil a un servidor
4. Desplegar/demostrar (MVP)

### Incremental Delivery

1. Foundational → base lista (`Server`, `ServerRepository`, `Profile` reestructurado)
2. + User Story 1 → alta con servidor → probar de forma independiente → Demo (MVP)
3. + User Story 2 → eliminar servidores desde el mismo pedido → probar → Demo
4. + User Story 3 → ver agrupado por servidor (acordeón, sin drag todavía) → probar → Demo
5. + User Story 4 → drag-and-drop de servidores y de perfiles dentro de cada uno → probar → Demo
6. Polish final (mobile, Principio VII, gate de lint/tipos/tests/build)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Foundational reestructura `Profile` (rompe `id`/`order` existentes) y agrega `Server` — es deliberadamente más grande que en features anteriores porque no hay forma de aislar ese cambio de forma dentro de una sola historia sin romper la compilación de las demás
- US3 deja el drag-and-drop de `ServerList`/`ProfileList` fuera de alcance a propósito (ninguno de sus criterios de aceptación lo pide) — se restaura en US4, que reutiliza exactamente los mismos componentes
- Verificar que los tests de cada historia fallan antes de implementar
- Detenerse en el checkpoint de cada fase para validar la historia de forma independiente antes de avanzar a la siguiente

## Ajustado en ejecución

- T022/T027: el botón "Eliminar" por fila y la lógica de `ConfirmDeleteServerDialog` (US2) se construyeron en el mismo pase que el resto de `ServerPickerModal` (US1) en vez de en una edición separada posterior — mismo resultado final que describía el plan, solo que sin una segunda edición discreta del archivo. `tests/component/presentation/ServerPickerModal.test.tsx` cubre en un único archivo tanto los casos de T016 (US1) como los de T027 (US2).
- T036/T037/T038 (US3) se implementaron sin ningún `DndContext`/`SortableContext` (tal como pedía el plan), y T049/T050 (US4) los agregaron después sobre esos mismos archivos — sin reescrituras adicionales de por medio.
- Se agregó `tests/component/presentation/ConfirmDeleteServerDialog.test.tsx` (no listado explícitamente como tarea propia, cubierto por T026) con tests unitarios de ese componente aislado, además de los casos ya cubiertos indirectamente vía `ServerPickerModal.test.tsx`.
- Tests preexistentes que construían un `Profile` a mano y no pertenecían a ninguna historia de 008 (`tests/unit/domain/formatHaremMessage.test.ts`, `tests/component/presentation/HaremView.*.test.tsx`, `SeriesGroup.*.test.tsx`, `ShareHaremButton.test.tsx`, `UpdateHaremModal.test.tsx`, `UrlProfileParam.test.tsx`, `ProfileCard.rename.test.tsx`, `LocalStorageProfileRepository.test.ts`) se ajustaron al nuevo shape de `Profile` (T013) sin cambiar el comportamiento que ya verificaban.
- `tests/component/presentation/ProfilesFlow.test.tsx` y `tests/component/presentation/Persistence.test.tsx` (flujos end-to-end existentes de features previas) se actualizaron para pasar por el pedido de servidor nuevo en cada alta — no estaban listados como tarea propia, pero su comportamiento cambió por la reestructura de US1 y quedaron cubiertos dentro de los checkpoints de US1/US3.
- Gate final (T054): `npm run lint` (0 errores, mismas 2 advertencias preexistentes ya documentadas en features anteriores), `npx tsc -b --noEmit` (0 errores), `npx vitest run` (196/199 tests en verde — las 3 fallas restantes son preexistentes y no relacionadas con esta feature: 2 en `Header.test.tsx` por la regresión ya documentada de "ocultar en vez de deshabilitar" en `HeaderActions`, y 1 en `SeriesGroup.appearance.test.tsx`, confirmada como preexistente comparando contra el código antes de esta feature vía `git stash`), `npm run build` (build de producción exitoso, 365.69 kB / gzip 112.17 kB).
