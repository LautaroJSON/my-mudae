<!--
Sync Impact Report
==================
Version change: 1.2.0 → 1.3.0
Rationale: MINOR bump — no existing principle was removed or redefined
incompatibly; this amendment adds new material guidance to the existing
Restricciones Técnicas section: a mandatory design-tokens single source
of truth (DESIGN.md + src/shared/theme.ts) and recognition of shared/ as
a cross-cutting directory in the architecture bullet.

Modified principles: none (7 principles unchanged in count/title/text)

Modified sections:
  - Restricciones Técnicas > Estilos — extended with the tokens-only
    rule: no hardcoded color/typography/spacing outside DESIGN.md /
    src/shared/theme.ts; whole app wrapped in styled-components
    ThemeProvider.
  - Restricciones Técnicas > Arquitectura — extended to recognize
    shared/ as a cross-cutting directory of pure constants/tokens (no
    business logic), consumable from presentation/ (and infrastructure/
    if ever needed) without breaking domain/'s isolation.

Added sections: none

Removed sections: none

Templates requiring follow-up review (not modified by this command, per scope guard):
  - .specify/templates/plan-template.md — verify its Constitution Check gate
    and any generated project-structure section reflect the fixed stack,
    the domain/application/infrastructure/presentation/shared layering,
    the components/<Name>/{index.tsx,styles.tsx} convention, AND the new
    DESIGN.md/shared/theme.ts tokens-only rule.
  - .specify/templates/tasks-template.md — verify component-creation tasks
    are generated with the mandatory folder/file split (index.tsx +
    styles.tsx), the typing convention (no React.FC, "I"-prefixed props
    interface in index.tsx, arrow function, export default at EOF), AND
    styled-components written against theme.ts tokens (no literal
    colors/typography/spacing in generated styles.tsx).

Deferred placeholders: none — all template tokens were resolved.
-->

# MyMudae Constitution

## Core Principles

### I. Persistencia de Datos Local Automática
El harem del usuario (su lista de personajes y el orden en que los cargó)
DEBE persistirse automáticamente en almacenamiento local del navegador
(`localStorage` o equivalente) en cada cambio significativo del estado
(carga, reordenamiento, eliminación de un personaje), sin requerir una
acción explícita de "guardar" por parte del usuario. Un refresh de la
página, un cierre accidental de la pestaña o un cierre del navegador NUNCA
deben resultar en pérdida del harem cargado. La app DEBE restaurar el
último estado persistido automáticamente al volver a abrirse.
**Rationale**: el harem representa horas de trabajo manual del usuario
armando su lista; perderlo por un accidente de navegación es el fallo más
costoso que la app puede cometer, y no existe backend que lo respalde (ver
Principio IV), por lo que la persistencia local es la única red de
seguridad del usuario.

### II. Integridad del Output (Orden = Comando)
El comando/código generado para copiar DEBE reflejar, en todo momento y de
forma exacta, el orden visual actual del harem tal como lo ve el usuario en
pantalla. Cualquier desfase entre el orden mostrado en la lista y el orden
codificado en el comando generado se clasifica como **bug crítico** (no
como detalle cosmético) y bloquea el release de la funcionalidad que lo
introdujo. El generador de comando DEBE derivarse directamente del mismo
estado ordenado que renderiza la lista (fuente única de verdad), nunca de
una copia o snapshot que pueda desincronizarse.
**Rationale**: el propósito único de la app es producir un comando correcto
para Mudae; si el orden mostrado no coincide con el orden generado, la app
falla en su función central sin que el usuario tenga forma fácil de
notarlo antes de pegarlo en Discord.

### III. Rendimiento en Listas Grandes (200+ Personajes)
El drag and drop y cualquier interacción de reordenamiento DEBEN mantenerse
fluidos (sin jank perceptible) con harems de 200 personajes o más. Un
movimiento de un ítem NO DEBE disparar un re-render de la lista completa;
solo los elementos cuya posición o estado visual cambian pueden
re-renderizarse. Toda implementación de lista ordenable DEBE justificar su
estrategia de memoización/virtualización cuando el harem supere umbrales
grandes, y DEBE validarse manualmente (o con test de performance) contra un
harem de prueba de 200+ personajes antes de darse por terminada.
**Rationale**: Mudae es un juego con harems que fácilmente superan cientos
de personajes; una lista que solo funciona bien con harems chicos de
prueba no sirve para el caso de uso real de la mayoría de los usuarios.

### IV. Simplicidad del Stack (Client-Only por Defecto)
La aplicación NO DEBE introducir backend propio, autenticación de usuarios
ni base de datos remota, salvo que una funcionalidad futura lo justifique
explícitamente por escrito (en una spec o plan) antes de implementarse.
Mientras sea técnicamente viable, todo el estado y la lógica viven en el
cliente (React + almacenamiento local del navegador). Cualquier propuesta
de agregar infraestructura de servidor DEBE documentar qué funcionalidad
concreta lo requiere y por qué el enfoque client-only no alcanza.
**Rationale**: la app resuelve un problema puramente local (ordenar una
lista y generar texto); agregar backend/autenticación sin necesidad real
aumenta costo, superficie de fallo y mantenimiento sin beneficio para el
usuario.

### V. Diseño Responsive y Touch-First
Toda pantalla y todo componente DEBEN ser completamente usables en
dispositivos móviles, no solo en desktop. Esto incluye explícitamente el
drag and drop: en pantallas táctiles DEBE funcionar con gestos touch, no
solo con eventos de mouse. Ninguna funcionalidad se considera terminada
("Done") si no fue probada manualmente (o con test automatizado) en al
menos un viewport móvil representativo, incluyendo la interacción de
arrastrar y soltar con touch.
**Rationale**: los usuarios de Mudae suelen gestionar su harem desde el
celular mientras juegan por Discord móvil; una app que solo funciona con
mouse en desktop excluye a una parte significativa de su audiencia
objetivo.

### VI. Confiabilidad del Copiado al Portapapeles
La función de copiar el comando generado al portapapeles DEBE funcionar de
forma consistente en los navegadores soportados (incluyendo variantes
móviles), con manejo explícito de los casos en que la API de portapapeles
no esté disponible o falle (fallback aceptable, por ejemplo selección de
texto manual). El usuario DEBE recibir feedback visual claro e inmediato
indicando si la copia fue exitosa o si falló; un copiado silencioso sin
confirmación NO es aceptable.
**Rationale**: el comando copiado es el entregable final de la app; si el
usuario no sabe con certeza si se copió (o copia algo desactualizado sin
darse cuenta), la app falla en su propósito aunque toda la lógica interna
sea correcta.

### VII. Componentes Pequeños de Responsabilidad Única
El código de la UI DEBE dividirse en componentes pequeños con una única
responsabilidad claramente identificable (por ejemplo: tarjeta de
personaje, lista ordenable, generador de comando, botón de copiar, cada
uno en su propio componente). NO se acepta concentrar carga de datos,
lógica de reordenamiento, generación de comando y copiado en un único
componente monolítico. Un componente que mezcla más de una de estas
responsabilidades DEBE refactorizarse antes de agregarle funcionalidad
nueva.

Esta separación es además **obligatoria a nivel de archivos** para todo
componente nuevo, siguiendo esta convención sin excepciones:
- Cada componente vive en su propia carpeta dentro de `components/`, con
  el nombre de carpeta igual al nombre del componente (ej.
  `components/PerfilCard/`).
- Esa carpeta contiene exactamente dos archivos: `index.tsx` (lógica y
  JSX del componente) y `styles.tsx` (los `styled-components` que usa ese
  componente).
- `index.tsx` NO DEBE contener definiciones de estilos (`styled.div` y
  similares); esas definiciones viven únicamente en `styles.tsx`.
- Una misma carpeta de `components/` NO DEBE mezclar más de un componente
  no relacionado.

El tipado de cada componente también sigue una convención fija, sin
excepciones:
- NO se usa `React.FC` ni `React.FunctionComponent` para tipar
  componentes.
- Cada componente define su propia interface de props dentro de su mismo
  `index.tsx` (nunca en un archivo separado), nombrada con el prefijo
  `I` seguido del nombre del componente (ej. `IPerfilCard` para el
  componente `PerfilCard`).
- Los componentes se escriben como arrow functions, tipadas a través de
  sus props (`const PerfilCard = ({ ... }: IPerfilCard) => { ... }`), no
  a través del tipo de retorno del componente.
- El export es siempre `export default` al final del archivo; nunca
  `export const` en la línea de declaración del componente.

Ejemplo de referencia:

```tsx
// styles.tsx
export const Container = styled.div`...`;

// index.tsx
import { Container } from './styles';

interface IPerfilCard {
  nombre: string;
  activo: boolean;
  onSeleccionar: () => void;
}

const PerfilCard = ({ nombre, activo, onSeleccionar }: IPerfilCard) => {
  return (
    <Container onClick={onSeleccionar}>
      {nombre}
    </Container>
  );
};

export default PerfilCard;
```

**Rationale**: dado que la app vive enteramente en el cliente (Principio
IV) y debe seguir siendo fácil de razonar sobre performance (Principio
III) y corrección del output (Principio II), la separación de
responsabilidades es lo que permite verificar cada garantía de forma
aislada. Fijar la convención de carpeta/archivo (en vez de dejarla a
criterio de cada desarrollador) evita que el mismo problema de "componente
gigante" reaparezca disfrazado de un solo archivo que mezcla JSX y
estilos. Fijar también el tipado y el estilo de export elimina la
discusión recurrente de "React.FC vs función simple" o "dónde va la
interface" en cada PR, y mantiene el mismo patrón reconocible en los
200+ componentes que puede llegar a tener el proyecto.

## Restricciones Técnicas

- **Stack técnico**: React + TypeScript + Vite. Este stack es fijo para
  todas las features del proyecto; cambiarlo requiere una enmienda a esta
  constitución, no una decisión de feature individual.
- **Arquitectura**: monolito modular con enfoque DDD, organizado en capas
  `domain/`, `application/`, `infrastructure/` y `presentation/`. La capa
  `domain/` NO DEBE depender directamente de React, de `styled-components`
  ni de `localStorage`: debe poder razonarse y testearse sin ninguno de
  los tres, dejando esas dependencias para `infrastructure/` y
  `presentation/`. `shared/` es un directorio transversal adicional que
  SOLO contiene constantes/tokens puros (hoy, `shared/theme.ts`) sin
  lógica de negocio; es consumible desde `presentation/` (y desde
  `infrastructure/` si alguna vez hiciera falta) sin romper el
  aislamiento de `domain/`.
- **Estilos**: `styled-components`, siguiendo la convención de archivo
  `styles.tsx` por componente del Principio VII. Todo estilo visual DEBE
  usar los tokens definidos en `DESIGN.md` / `src/shared/theme.ts`
  (colores, tipografía, spacing, radios, sombras, motion). NO se permiten
  valores de color, tipografía o spacing hardcodeados en ningún
  `styles.tsx` (ni en ningún otro archivo de `presentation/`) fuera de
  esos dos archivos; `App.tsx` envuelve toda la aplicación en el
  `ThemeProvider` de `styled-components` con el `theme` exportado desde
  `shared/theme.ts`. Agregar o cambiar un token es una edición a
  `DESIGN.md` + `theme.ts`, no una decisión ad hoc dentro de un
  componente.
- **Iconografía**: `lucide-react`.
- **Estado global**: Context API de React. No se introduce una librería
  de manejo de estado externa (Redux, Zustand, etc.) salvo que una
  funcionalidad futura lo justifique explícitamente, conforme al
  Principio IV.
- **Persistencia**: exclusivamente en el cliente vía `localStorage` (ver
  Principio I). No se envían datos del harem a ningún servidor, ya que no
  existe backend (Principio IV).
- Cualquier librería de drag-and-drop adoptada DEBE soportar tanto
  interacción con mouse como con touch (Principio V) y DEBE poder operar
  sobre listas de 200+ ítems sin re-render completo (Principio III).
- No hay dependencia de conexión a internet para el uso normal de la app
  una vez cargada (carga, reordenamiento, generación y copiado del
  comando deben funcionar offline).

## Flujo de Desarrollo y Criterios de Aceptación

- Ninguna funcionalidad que toque la lista de personajes, el orden del
  harem o el comando generado se considera terminada sin verificar
  manualmente que el comando copiado coincide exactamente con el orden
  visual (Principio II).
- Ninguna funcionalidad de UI se considera terminada sin probarse en un
  viewport móvil, incluyendo drag-and-drop por touch cuando aplique
  (Principio V).
- Cambios a la lista ordenable o a su renderizado DEBEN incluir una
  verificación (manual o automatizada) de performance con un harem de
  200+ personajes antes de mergear (Principio III).
- Toda propuesta de agregar backend, autenticación o base de datos remota
  DEBE documentarse en la spec o plan correspondiente justificando por
  qué el enfoque client-only no alcanza, antes de implementarse
  (Principio IV).

## Governance

Esta constitución prevalece sobre cualquier otra práctica, convención o
preferencia individual de implementación dentro del proyecto. Todo plan,
spec o revisión de código DEBE verificar cumplimiento contra los siete
principios de este documento; una violación no justificada DEBE
resolverse antes de mergear, no documentarse como deuda técnica aceptada.

**Enmiendas**: cualquier cambio a esta constitución (agregar, quitar o
redefinir un principio o sección) se hace editando este archivo mediante
el flujo `/speckit-constitution`, y DEBE incluir un Sync Impact Report
actualizado en el comentario HTML al inicio del archivo.

**Versionado semántico**:
- MAJOR: eliminación o redefinición incompatible de un principio existente.
- MINOR: agregado de un nuevo principio o de guía material nueva a uno
  existente.
- PATCH: aclaraciones, correcciones de redacción o ajustes no semánticos.

**Revisión de cumplimiento**: toda spec (`speckit-specify`), plan
(`speckit-plan`) y conjunto de tareas (`speckit-tasks`) que dependan de
esta constitución deben resolverse contra su versión vigente en el
momento de su creación. Si esta constitución se enmienda después de que
un plan fue aprobado, el plan DEBE revisarse contra la nueva versión antes
de continuar la implementación.

**Version**: 1.3.0 | **Ratified**: 2026-09-11 | **Last Amended**: 2026-09-11
