/**
 * Gallery Template - Puck Config
 *
 * Configuracion de componentes disponibles para el template Gallery.
 * Enfocado en productos visuales con grids amplios.
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
 * Configuracion de Puck para template Gallery
 */
export const galleryPuckConfig = {
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
 * Data inicial para un catalogo gallery nuevo
 */
export const galleryDefaultData = {
  content: [
    {
      type: "StoreHeader",
      props: {
        variant: "hero",
        showDescription: true,
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
      type: "ProductGrid",
      props: {
        variant: "wide",
        showDescription: false,
        limit: 0,
      },
    },
    {
      type: "Spacer",
      props: {
        size: "large",
      },
    },
  ],
  root: {
    props: {},
  },
  zones: {},
};
