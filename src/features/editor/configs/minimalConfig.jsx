/**
 * Minimal Template - Puck Config
 *
 * Configuracion de componentes disponibles para el template Minimal.
 * Incluye solo bloques esenciales para mantener la simplicidad.
 */

import {
  HeadingBlock,
  ParagraphBlock,
  SpacerBlock,
  DividerBlock,
  ContainerBlock,
} from "../components/PuckBlocks";

import {
  StoreHeaderBlock,
  ProductGridBlock,
} from "../components/CatalogBlocks";

/**
 * Configuracion de Puck para template Minimal
 */
export const minimalPuckConfig = {
  // Componentes disponibles para drag & drop
  components: {
    // Layout
    Container: ContainerBlock,
    Spacer: SpacerBlock,
    Divider: DividerBlock,

    // Texto
    Heading: HeadingBlock,
    Paragraph: ParagraphBlock,

    // Catalogo
    StoreHeader: StoreHeaderBlock,
    ProductGrid: ProductGridBlock,
  },

  // Categorias para organizar en el sidebar
  categories: {
    layout: {
      title: "Layout",
      components: ["Container", "Spacer", "Divider"],
    },
    text: {
      title: "Texto",
      components: ["Heading", "Paragraph"],
    },
    catalog: {
      title: "Catalogo",
      components: ["StoreHeader", "ProductGrid"],
    },
  },

  // Props del root (datos que se pasan a todos los componentes)
  root: {
    fields: {
      // Los datos de store y products se inyectan aqui
    },
    defaultProps: {
      store: null,
      products: [],
    },
    render: ({ children }) => (
      <div className="min-h-screen bg-[var(--background)]">{children}</div>
    ),
  },
};

/**
 * Data inicial para un catalogo minimal nuevo
 */
export const minimalDefaultData = {
  content: [
    {
      type: "StoreHeader",
      props: {
        variant: "minimal",
        showDescription: true,
      },
    },
    {
      type: "Divider",
      props: {
        style: "subtle",
      },
    },
    {
      type: "Container",
      props: {
        maxWidth: "wide",
        padding: "normal",
      },
    },
    {
      type: "ProductGrid",
      props: {
        variant: "standard",
        showDescription: true,
        limit: 0,
      },
    },
  ],
  root: {
    props: {},
  },
  zones: {},
};
