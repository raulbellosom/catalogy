# Frontend Requirements and Architecture

Los agentes AI DEBEN seguir estas reglas a menos que 00_project_brief.md las sobreescriba explicitamente.

## Stack default

- React (JavaScript + JSDoc; no TypeScript por default)
- Vite
- PWA: vite-plugin-pwa (generacion de service worker basada en Workbox)
- CSS: TailwindCSS v4.x
- Theming: Tailwind dark variant + class strategy
- Animacion de cambio de tema: react-theme-switch-animation
- Animaciones: Motion (`motion`) como default; Framer Motion solo como fallback
- Routing: react-router-dom
- Data fetching/caching: TanStack React Query
- Iconos: Lucide React (NUNCA emojis)

## Regla de iconos (ESTRICTA)

- NUNCA usar emojis en la UI
- SIEMPRE usar iconos de Lucide React
- Importar solo los iconos necesarios para optimizar bundle size
- Ejemplo: `import { Home, Settings, Plus } from 'lucide-react'`

## Requisitos de PWA

Entregables core de PWA:

- Web manifest: name, short_name, icons, theme_color, background_color, display, start_url
- Registro de service worker y estrategia de actualizacion
- Estrategia offline (definida en 00_project_brief.md)

UX de actualizacion (baseline recomendado):

- registerType: autoUpdate
- Cuando se instala un nuevo SW:
  - mostrar un toast/boton sutil "Actualizacion disponible"
  - permitir al usuario refrescar para activar el nuevo SW

Desarrollo:

- Service worker en dev es opcional (muchos equipos lo deshabilitan para evitar confusion de cache)
- Si esta habilitado, documentar como "resetear" SW y caches

Limites de tamano de Workbox:

- Si algunos assets construidos desaparecen de la lista de precache, verificar thresholds de tamano de archivo de Workbox
- Ajustar maximumFileSizeToCacheInBytes solo cuando sea necesario

Estrategias de cache (elegir por tipo de recurso; documentar elecciones):

- Assets de app shell: precache
- API: usualmente network-first con TTL corto, o stale-while-revalidate (depende de la app)
- Imagenes: cache-first con expiracion
- Fallback offline: mostrar UI amigable offline

## Barra de calidad de UI

- Layout y tipografia mobile-first
- Estetica premium: gradientes, profundidad, glassmorphism (cuando sea apropiado), espaciado limpio
- Micro-interacciones:
  - estados hover / press
  - transiciones sutiles entre cambios de estado
  - loading skeletons, empty states, error states
- Layout aware de safe-area:
  - usar `env(safe-area-inset-top)` / bottom en app shell si es necesario

Guia de touch target:

- Apuntar a >= 44x44px para controles de toque primarios

## Theming y modo oscuro

- Usar estrategia de clase dark mode de Tailwind
- Aplicar clase `dark` en el elemento `<html>`
- Persistir preferencia (`light` / `dark` / `system`) en localStorage
- Tema default es system a menos que lo sobreescriba el Project Brief

Tokens de tema:

- Usar variables CSS como fuente de verdad (ej: --bg, --fg, --card)
- Las utilidades de Tailwind deben referenciar estas variables para consistencia

Animacion de cambio de tema:

- Si esta habilitada, react-theme-switch-animation puede animar la transicion de tema
- Respetar accesibilidad:
  - Reduced motion debe deshabilitar transiciones pesadas

## Reglas de animacion (Motion-first)

Usar Motion para:

- Transiciones de pagina (enter/exit)
- Listas escalonadas
- Modales y drawers
- Micro-interacciones de botones (scale/opacity sutil)
- Shimmer de skeleton o cambios de estado (mantener sutil)

Fallback a Framer Motion solo cuando:

- una feature requerida no existe en Motion
- el codebase existente ya depende de patrones de Framer Motion

## JavaScript + JSDoc (no TypeScript por default)

Usar JSDoc consistentemente para:

- interfaces de feature service (capa API)
- modelos de dominio (forma de documentos)
- funciones y hooks complejos

Patron de ejemplo:

- src/features/tasks/models/task.js define la forma de Task via tipos JSDoc

## Arquitectura: feature-based + atomic design

### Estructura de carpetas (baseline)

```
src/
├── app/
│   ├── routes/
│   ├── providers/
│   └── layouts/
├── features/
│   └── <domain>/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── models/
│       └── index.js
├── shared/
│   ├── ui/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   └── styles/
└── assets/
```

### Reglas

- Logica de dominio permanece dentro de src/features/<domain>
- Acoplamiento cross-feature esta desaconsejado
- UI compartida pertenece a src/shared/ui
- Las paginas son thin: orquestan componentes y data fetching; evitar logica de negocio pesada en paginas

## Politica de tamano de archivo y modularizacion (estricta)

- Threshold de advertencia: 300 lineas
- Limite duro: 700 lineas (no exceder)
- Dividir antes de que se vuelva spaghetti:
  - Extraer componentes
  - Extraer hooks
  - Extraer services (llamadas API)
  - Extraer view-model helpers
  - Extraer constantes

## Regla de redundancia

No agregar librerias que:

- dupliquen responsabilidades de Tailwind (sistemas de utilidades CSS)
- dupliquen responsabilidades de Motion (librerias de animacion)
- dupliquen React Query (data caching) a menos que exista una razon clara
- dupliquen Lucide (otras librerias de iconos)

Si se agrega una nueva dependencia:

- explicar por que
- donde usarla
- que no usar mas

## i18n opcional

Default es solo espanol a menos que 00_project_brief.md habilite i18n.

## Definicion de done (frontend)

Una feature esta "done" solo cuando:

- Layout mobile esta pulido
- Modo oscuro esta revisado a fondo
- Animaciones son intencionales y no distraen
- Estados de loading/empty/error existen
- Codigo es modular y entendible por un agente AI
- Se usan iconos de Lucide, NUNCA emojis

## Sistema de templates

### Arquitectura

El catalogo publico de cada tienda se renderiza usando un sistema de templates:

```
src/features/templates/
├── registry.js              # Registro central de templates
├── components/              # Componentes reutilizables para templates
│   ├── ProductCard.jsx
│   ├── StoreHeader.jsx
│   ├── ProductGrid.jsx
│   └── index.js
└── variants/
    ├── MinimalTemplate.jsx  # Template default
    ├── StorefrontTemplate.jsx
    ├── GalleryTemplate.jsx
    └── index.js
```

### Template registry pattern

El registry exporta un objeto con la configuracion de cada template:

```javascript
export const TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Tipografia simple, fondo limpio, lista directa',
    component: MinimalTemplate,
    thumbnail: '/templates/minimal-thumb.png',
    puckConfig: minimalPuckConfig,
  },
  storefront: { ... },
  gallery: { ... },
};

export const getTemplate = (templateId) => TEMPLATES[templateId] || TEMPLATES.minimal;
```

### Contrato de template component

Cada template recibe las mismas props:

```javascript
/**
 * @param {Object} props
 * @param {Object} props.store - Datos de la tienda
 * @param {Array} props.products - Lista de productos
 * @param {Object|null} props.puckData - Configuracion de Puck (si existe)
 */
function TemplateComponent({ store, products, puckData }) { ... }
```

### Integracion con Puck Editor

Puck (@puckeditor/core) permite edicion visual drag-and-drop:

- Cada template define un `puckConfig` con los componentes permitidos
- El resultado se guarda como JSON en `store.puckData`
- Si `puckData` existe, el template lo usa para renderizar el layout personalizado
- Si `puckData` es null, el template usa su layout default

Estructura del editor:

```
src/features/editor/
├── pages/
│   └── PuckEditorPage.jsx   # Wrapper del editor
├── components/
│   └── EditorToolbar.jsx    # Acciones (guardar, publicar, etc)
└── configs/
    ├── minimalConfig.js     # Componentes disponibles para minimal
    ├── storefrontConfig.js
    └── galleryConfig.js
```

### Flujo de seleccion de template

1. Usuario crea tienda → templateId = 'minimal' (default)
2. En Store Settings, usuario puede cambiar template
3. Al cambiar template, puckData se resetea a null
4. Usuario puede personalizar via Editor (/app/editor)
5. El editor guarda el JSON en puckData
6. CatalogPage usa el registry para obtener el componente y renderizar
