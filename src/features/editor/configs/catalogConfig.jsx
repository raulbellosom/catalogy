/**
 * Catalog Puck Config
 *
 * Configuracion unica para el editor y el render publico de Puck.
 * Solo incluye bloques funcionales (header + catalogo).
 */

import { StoreHeaderBlock, ProductCatalogBlock } from "../components/CatalogBlocks";

export const catalogPuckConfig = {
  components: {
    StoreHeader: StoreHeaderBlock,
    ProductCatalog: ProductCatalogBlock,
  },
  categories: {
    catalog: {
      title: "Catalogo",
      components: ["StoreHeader", "ProductCatalog"],
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

export const catalogDefaultData = {
  content: [
    {
      type: "StoreHeader",
      props: {},
    },
    {
      type: "ProductCatalog",
      props: {},
    },
  ],
  root: {
    props: {},
  },
  zones: {},
};
