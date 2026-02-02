/**
 * Storefront Template - Puck Config
 *
 * Configuracion de componentes disponibles para el template Storefront.
 * Incluye secciones y bloques para una tienda clasica.
 */

import {
  HeadingBlock,
  ParagraphBlock,
  SpacerBlock,
  DividerBlock,
  ContainerBlock,
  SectionBlock,
} from "../components/PuckBlocks";

import {
  StoreHeaderBlock,
  ProductGridBlock,
  FeaturedProductBlock,
} from "../components/CatalogBlocks";

/**
 * Configuracion de Puck para template Storefront
 */
export const storefrontPuckConfig = {
  components: {
    // Layout
    Container: ContainerBlock,
    Section: SectionBlock,
    Spacer: SpacerBlock,
    Divider: DividerBlock,

    // Texto
    Heading: HeadingBlock,
    Paragraph: ParagraphBlock,

    // Catalogo
    StoreHeader: StoreHeaderBlock,
    ProductGrid: ProductGridBlock,
    FeaturedProduct: FeaturedProductBlock,
  },

  categories: {
    layout: {
      title: "Layout",
      components: ["Container", "Section", "Spacer", "Divider"],
    },
    text: {
      title: "Texto",
      components: ["Heading", "Paragraph"],
    },
    catalog: {
      title: "Catalogo",
      components: ["StoreHeader", "ProductGrid", "FeaturedProduct"],
    },
  },

  root: {
    fields: {},
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
 * Data inicial para un catalogo storefront nuevo
 */
export const storefrontDefaultData = {
  content: [
    {
      type: "StoreHeader",
      props: {
        variant: "banner",
        showDescription: true,
      },
    },
    {
      type: "Section",
      props: {
        background: "muted",
        padding: "normal",
      },
    },
    {
      type: "Container",
      props: {
        maxWidth: "normal",
        padding: "normal",
      },
    },
    {
      type: "Heading",
      props: {
        text: "Bienvenido a nuestra tienda",
        level: "h2",
        align: "center",
      },
    },
    {
      type: "Paragraph",
      props: {
        text: "Explora nuestra coleccion de productos",
        align: "center",
      },
    },
    {
      type: "Spacer",
      props: {
        size: "large",
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
      type: "Heading",
      props: {
        text: "Nuestros productos",
        level: "h2",
        align: "left",
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
